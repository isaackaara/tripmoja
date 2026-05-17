import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AppBar } from '@/components/brand/app-bar'
import { BottomNav } from '@/components/brand/bottom-nav'
import { TripDetail } from '@/components/ui/trip-detail'
import { mapTrip } from '@/lib/trip-mapper'
import RequestButton from './request-button'

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  const dbTrip = await prisma.trip.findUnique({
    where:   { id },
    include: { driver: { include: { verification: true } } },
  })
  if (!dbTrip) notFound()

  const trip = mapTrip(dbTrip)

  const similarDbTrips = await prisma.trip.findMany({
    where: {
      origin:      dbTrip.origin,
      destination: dbTrip.destination,
      status:      'OPEN',
      id:          { not: id },
    },
    include:  { driver: { include: { verification: true } } },
    take:     3,
    orderBy:  { departureAt: 'asc' },
  })
  const similar = similarDbTrips.map(mapTrip)

  return (
    <div className="min-h-screen flex flex-col">
      <AppBar title="Trip detail" />
      <div className="flex-1 overflow-y-auto pb-20">
        <TripDetail
          trip={trip}
          similarTrips={similar}
          ctaSlot={
            <RequestButton
              tripId={id}
              isFull={trip.full}
              isSignedIn={!!session?.user}
            />
          }
        />
      </div>
      <BottomNav />
    </div>
  )
}
