'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { sendBookingRequest, sendBookingConfirmed, sendBookingDeclined } from '@/lib/email'
import { addDays } from 'date-fns'

export async function requestSeat(tripId: string, message?: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.email) return { error: 'Not signed in' }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return { error: 'User not found' }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { driver: true },
  })
  if (!trip) return { error: 'Trip not found' }
  if (trip.status !== 'OPEN') return { error: 'Trip is no longer available' }
  if (trip.driverId === user.id) return { error: 'You cannot book your own trip' }
  if (trip.seatsAvailable < 1) return { error: 'No seats available' }

  const existing = await prisma.booking.findFirst({
    where: { tripId, passengerId: user.id, status: { in: ['PENDING', 'CONFIRMED'] } },
  })
  if (existing) return { error: 'You already have a booking on this trip' }

  const booking = await prisma.booking.create({
    data: { tripId, passengerId: user.id, message: message ?? null },
  })

  await sendBookingRequest({
    driverName: trip.driver.name,
    driverEmail: trip.driver.email,
    passengerName: user.name,
    passengerEmail: user.email,
    origin: trip.origin,
    destination: trip.destination,
    departureAt: trip.departureAt,
    bookingId: booking.id,
    price: trip.pricePerSeat,
  }).catch(() => {})

  revalidatePath(`/trips/${tripId}`)
  return {}
}

export async function acceptBooking(bookingId: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.email) return { error: 'Not signed in' }

  const driver = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!driver) return { error: 'User not found' }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trip: true, passenger: true },
  })
  if (!booking) return { error: 'Booking not found' }
  if (booking.trip.driverId !== driver.id) return { error: 'Not authorised' }
  if (booking.status !== 'PENDING') return { error: 'Booking is no longer pending' }

  const updated = await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: booking.tripId },
      select: { seatsAvailable: true },
    })
    if (!trip || trip.seatsAvailable < booking.seatsBooked) {
      throw new Error('No seats available')
    }

    const newSeats = trip.seatsAvailable - booking.seatsBooked

    await tx.trip.update({
      where: { id: booking.tripId },
      data: {
        seatsAvailable: newSeats,
        status: newSeats === 0 ? 'FULL' : 'OPEN',
      },
    })

    return tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED', respondedAt: new Date() },
    })
  })

  await sendBookingConfirmed({
    driverName: driver.name,
    driverEmail: driver.email,
    passengerName: booking.passenger.name,
    passengerEmail: booking.passenger.email,
    origin: booking.trip.origin,
    destination: booking.trip.destination,
    departureAt: booking.trip.departureAt,
    bookingId: updated.id,
    price: booking.trip.pricePerSeat,
  }).catch(() => {})

  revalidatePath(`/trips/${booking.tripId}/manage`)
  revalidatePath(`/bookings/${bookingId}`)
  return {}
}

export async function declineBooking(bookingId: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.email) return { error: 'Not signed in' }

  const driver = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!driver) return { error: 'User not found' }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trip: true, passenger: true },
  })
  if (!booking) return { error: 'Booking not found' }
  if (booking.trip.driverId !== driver.id) return { error: 'Not authorised' }
  if (booking.status !== 'PENDING') return { error: 'Booking is no longer pending' }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'DECLINED', respondedAt: new Date() },
  })

  await sendBookingDeclined({
    driverName: driver.name,
    driverEmail: driver.email,
    passengerName: booking.passenger.name,
    passengerEmail: booking.passenger.email,
    origin: booking.trip.origin,
    destination: booking.trip.destination,
    departureAt: booking.trip.departureAt,
    bookingId,
    price: booking.trip.pricePerSeat,
  }).catch(() => {})

  revalidatePath(`/trips/${booking.tripId}/manage`)
  return {}
}

export async function cancelBooking(bookingId: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.email) return { error: 'Not signed in' }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return { error: 'User not found' }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trip: true },
  })
  if (!booking) return { error: 'Booking not found' }
  if (booking.passengerId !== user.id) return { error: 'Not authorised' }
  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) return { error: 'Cannot cancel this booking' }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    })

    if (booking.status === 'CONFIRMED') {
      const trip = await tx.trip.findUnique({ where: { id: booking.tripId } })
      if (trip) {
        await tx.trip.update({
          where: { id: booking.tripId },
          data: {
            seatsAvailable: trip.seatsAvailable + booking.seatsBooked,
            status: trip.status === 'FULL' ? 'OPEN' : trip.status,
          },
        })
      }
    }
  })

  revalidatePath('/bookings')
  return {}
}

export async function issueRatingTokens(bookingId: string): Promise<void> {
  await prisma.ratingToken.createMany({
    data: [
      { bookingId, side: 'DRIVER',    expiresAt: addDays(new Date(), 30) },
      { bookingId, side: 'PASSENGER', expiresAt: addDays(new Date(), 30) },
    ],
    skipDuplicates: true,
  })
}
