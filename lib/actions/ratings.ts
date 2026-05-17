'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function submitRating(
  token: string,
  rating: number,
  comment?: string,
): Promise<{ error?: string }> {
  if (rating < 1 || rating > 5) return { error: 'Rating must be 1-5' }

  const ratingToken = await prisma.ratingToken.findUnique({
    where:   { token },
    include: { booking: { include: { trip: true } } },
  })

  if (!ratingToken)         return { error: 'Invalid rating link' }
  if (ratingToken.used)     return { error: 'You have already submitted a rating' }
  if (ratingToken.expiresAt < new Date()) return { error: 'This rating link has expired' }

  const booking = ratingToken.booking
  const isDriverRating    = ratingToken.side === 'DRIVER'
  const reviewerId = isDriverRating ? booking.trip.driverId : booking.passengerId
  const revieweeId = isDriverRating ? booking.passengerId    : booking.trip.driverId

  const existing = await prisma.review.findUnique({
    where: { bookingId_reviewerId: { bookingId: booking.id, reviewerId } },
  })
  if (existing) return { error: 'You have already rated this trip' }

  await prisma.review.create({
    data: { bookingId: booking.id, reviewerId, revieweeId, rating, comment: comment ?? null, revealed: false },
  })

  await prisma.ratingToken.update({
    where: { id: ratingToken.id },
    data:  { used: true, usedAt: new Date() },
  })

  const otherSide = isDriverRating ? 'PASSENGER' : 'DRIVER'
  const otherToken = await prisma.ratingToken.findFirst({
    where: { bookingId: booking.id, side: otherSide },
  })

  if (otherToken?.used) {
    await prisma.review.updateMany({
      where: { bookingId: booking.id },
      data:  { revealed: true },
    })
    await updateRating(revieweeId)
    await updateRating(reviewerId)
  }

  revalidatePath(`/bookings/${booking.id}`)
  return {}
}

async function updateRating(userId: string) {
  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId, revealed: true },
    select: { rating: true },
  })
  if (reviews.length === 0) return

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  await prisma.user.update({
    where: { id: userId },
    data:  { rating: Math.round(avg * 10) / 10 },
  })
}

export async function revealStaleRatings(bookingId: string): Promise<void> {
  const tokens = await prisma.ratingToken.findMany({
    where: { bookingId },
  })
  const windowExpired = tokens.some((t) => t.expiresAt < new Date())
  if (!windowExpired) return

  const reviews = await prisma.review.findMany({
    where: { bookingId, revealed: false },
    select: { revieweeId: true },
  })
  if (reviews.length === 0) return

  await prisma.review.updateMany({
    where: { bookingId, revealed: false },
    data:  { revealed: true },
  })

  const uniqueReviewees = [...new Set(reviews.map((r) => r.revieweeId))]
  await Promise.all(uniqueReviewees.map(updateRating))
}
