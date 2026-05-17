'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { addDays } from 'date-fns'
import { sendRatingPrompt } from '@/lib/email'

interface CreateTripInput {
  origin:      string
  destination: string
  date:        string
  time:        string
  seats:       number
  price:       number
  tripType:    string
  notes?:      string
  isPublic:    boolean
}

export async function createTrip(input: CreateTripInput): Promise<{ tripId?: string; error?: string }> {
  const session = await auth()
  if (!session?.user?.email) return { error: 'Not signed in' }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return { error: 'User not found' }

  const { origin, destination, date, time, seats, price, tripType, notes, isPublic } = input

  const cleanOrigin = origin.trim()
  const cleanDest   = destination.trim()
  if (!cleanOrigin || !cleanDest || cleanOrigin.toLowerCase() === cleanDest.toLowerCase()) {
    return { error: 'Invalid route' }
  }

  const departureAt = new Date(`${date}T${time}:00`)
  if (isNaN(departureAt.getTime()) || departureAt <= new Date()) {
    return { error: 'Departure must be in the future' }
  }

  if (seats < 1 || seats > 8)       return { error: 'Seats must be between 1 and 8' }
  if (price < 100 || price > 50000) return { error: 'Price out of range' }

  const route = await prisma.route.upsert({
    where:  { origin_destination: { origin: cleanOrigin, destination: cleanDest } },
    update: {},
    create: { origin: cleanOrigin, destination: cleanDest },
  })

  const trip = await prisma.trip.create({
    data: {
      driverId:       user.id,
      routeId:        route.id,
      departureAt,
      origin:         cleanOrigin,
      destination:    cleanDest,
      seatsTotal:     seats,
      seatsAvailable: seats,
      pricePerSeat:   price,
      tripType:       tripType as 'SELF_DRIVE' | 'HIRED_DRIVER' | 'TAXI_RENTAL',
      notes:          notes?.trim() || null,
      isPublic,
    },
  })

  revalidatePath('/trips')
  return { tripId: trip.id }
}

export async function setEnRoute(tripId: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.email) return { error: 'Not signed in' }

  const driver = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!driver) return { error: 'User not found' }

  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip)                      return { error: 'Trip not found' }
  if (trip.driverId !== driver.id) return { error: 'Not authorised' }

  await prisma.trip.update({
    where: { id: tripId },
    data:  { departureStatus: 'EN_ROUTE' },
  })

  revalidatePath(`/trips/${tripId}/manage`)
  revalidatePath(`/bookings`)
  return {}
}

export async function toggleAcceptingRequests(tripId: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.email) return { error: 'Not signed in' }

  const driver = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!driver) return { error: 'User not found' }

  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip)                      return { error: 'Trip not found' }
  if (trip.driverId !== driver.id) return { error: 'Not authorised' }

  await prisma.trip.update({
    where: { id: tripId },
    data:  { isAcceptingRequests: !trip.isAcceptingRequests },
  })

  revalidatePath(`/trips/${tripId}/manage`)
  revalidatePath('/trips')
  return {}
}

export async function completeTrip(tripId: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.email) return { error: 'Not signed in' }

  const driver = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!driver) return { error: 'User not found' }

  const trip = await prisma.trip.findUnique({
    where:   { id: tripId },
    include: {
      bookings: {
        where:   { status: 'CONFIRMED' },
        include: { passenger: true },
      },
    },
  })
  if (!trip)                      return { error: 'Trip not found' }
  if (trip.driverId !== driver.id) return { error: 'Not authorised' }
  if (trip.status === 'COMPLETED') return { error: 'Trip is already completed' }

  const expiresAt = addDays(new Date(), 30)

  await prisma.$transaction(async (tx) => {
    await tx.trip.update({
      where: { id: tripId },
      data:  { status: 'COMPLETED' },
    })

    for (const booking of trip.bookings) {
      await tx.booking.update({
        where: { id: booking.id },
        data:  { status: 'COMPLETED' },
      })

      await tx.ratingToken.createMany({
        data: [
          { bookingId: booking.id, side: 'DRIVER',    expiresAt },
          { bookingId: booking.id, side: 'PASSENGER', expiresAt },
        ],
        skipDuplicates: true,
      })
    }

    await tx.user.update({
      where: { id: driver.id },
      data:  { tripCount: { increment: trip.bookings.length > 0 ? 1 : 0 } },
    })
  })

  for (const booking of trip.bookings) {
    const [driverToken, passengerToken] = await Promise.all([
      prisma.ratingToken.findFirst({ where: { bookingId: booking.id, side: 'DRIVER' } }),
      prisma.ratingToken.findFirst({ where: { bookingId: booking.id, side: 'PASSENGER' } }),
    ])

    const opts = {
      origin:      trip.origin,
      destination: trip.destination,
    }

    if (driverToken) {
      await sendRatingPrompt({
        toName:      driver.name,
        toEmail:     driver.email,
        otherName:   booking.passenger.name,
        ratingToken: driverToken.token,
        ...opts,
      }).catch(() => {})
    }

    if (passengerToken) {
      await sendRatingPrompt({
        toName:      booking.passenger.name,
        toEmail:     booking.passenger.email,
        otherName:   driver.name,
        ratingToken: passengerToken.token,
        ...opts,
      }).catch(() => {})
    }
  }

  revalidatePath(`/trips/${tripId}/manage`)
  revalidatePath('/bookings')
  return {}
}
