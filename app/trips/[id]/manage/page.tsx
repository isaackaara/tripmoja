import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AppBar } from '@/components/brand/app-bar'
import { format } from 'date-fns'
import ManageActions from './manage-actions'
import DriverControls from './driver-controls'

export default async function ManageTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.email) redirect(`/login?next=/trips/${id}/manage`)

  const driver = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!driver) redirect('/login')

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      bookings: {
        include: { passenger: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!trip) notFound()
  if (trip.driverId !== driver.id) redirect('/trips')

  const pending   = trip.bookings.filter((b) => b.status === 'PENDING')
  const confirmed = trip.bookings.filter((b) => b.status === 'CONFIRMED')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--tm-surface)' }}>
      <AppBar title="Manage trip" onBack={true} />

      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full grid gap-4">
        <div className="card p-4 grid gap-1">
          <h2 className="tm-h2">{trip.origin} to {trip.destination}</h2>
          <p className="text-[14px] text-tm-ink-500">{format(trip.departureAt, 'EEEE d MMMM yyyy, HH:mm')}</p>
          <p className="text-[14px] text-tm-ink-500">
            {trip.seatsAvailable}/{trip.seatsTotal} seats free &middot; KES {trip.pricePerSeat.toLocaleString()}/seat
          </p>
          {trip.departureStatus === 'EN_ROUTE' && (
            <span className="text-[12px] font-semibold mt-1" style={{ color: 'var(--tm-success)' }}>
              On the way
            </span>
          )}
        </div>

        <DriverControls
          tripId={id}
          isAcceptingRequests={trip.isAcceptingRequests}
          departureStatus={trip.departureStatus}
          tripStatus={trip.status}
        />

        {pending.length > 0 && (
          <section>
            <h3 className="text-[13px] font-semibold text-tm-ink-500 mb-2 uppercase tracking-wide">Pending requests</h3>
            <div className="grid gap-3">
              {pending.map((b) => (
                <div key={b.id} className="card p-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[15px] font-semibold text-tm-ink">{b.passenger.name}</p>
                    <p className="text-[13px] text-tm-ink-500">{b.seatsBooked} seat{b.seatsBooked > 1 ? 's' : ''}</p>
                  </div>
                  {b.passenger.rating && (
                    <p className="text-[13px] text-tm-ink-500 mb-1">Rating: {b.passenger.rating.toFixed(1)}</p>
                  )}
                  {b.message && (
                    <p className="text-[13px] text-tm-ink-500 mb-3 italic">&ldquo;{b.message}&rdquo;</p>
                  )}
                  <ManageActions bookingId={b.id} tripId={id} />
                </div>
              ))}
            </div>
          </section>
        )}

        {confirmed.length > 0 && (
          <section>
            <h3 className="text-[13px] font-semibold text-tm-ink-500 mb-2 uppercase tracking-wide">Confirmed passengers</h3>
            <div className="grid gap-3">
              {confirmed.map((b) => (
                <div key={b.id} className="card p-4 flex justify-between items-center">
                  <div>
                    <p className="text-[15px] font-semibold text-tm-ink">{b.passenger.name}</p>
                    {b.passenger.phone && (
                      <a href={`tel:${b.passenger.phone}`} className="text-[14px] text-tm-blue font-semibold">
                        {b.passenger.phone}
                      </a>
                    )}
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--tm-success)' }}>Confirmed</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {trip.bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[15px] text-tm-ink-500">No booking requests yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}
