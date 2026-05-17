import { prisma } from '@/lib/prisma'
import { mapTrip } from '@/lib/trip-mapper'
import { TripsFeed } from './trips-feed'

export default async function TripsPage() {
  const dbTrips = await prisma.trip.findMany({
    where: {
      status:              'OPEN',
      isAcceptingRequests: true,
      departureAt:         { gte: new Date() },
    },
    include:  { driver: { include: { verification: true } } },
    orderBy:  { departureAt: 'asc' },
    take:     100,
  })

  const trips = dbTrips.map(mapTrip)

  return <TripsFeed trips={trips} />
}
