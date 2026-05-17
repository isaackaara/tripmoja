import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AppBar } from '@/components/brand/app-bar'
import { BottomNav } from '@/components/brand/bottom-nav'
import { Icon } from '@/components/brand/icon'
import { format } from 'date-fns'

export default async function BookingsPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login?next=/bookings')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect('/login')

  const [asPassenger, asDriver] = await Promise.all([
    prisma.booking.findMany({
      where:   { passengerId: user.id },
      include: { trip: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.findMany({
      where:   { trip: { driverId: user.id } },
      include: { trip: true, passenger: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const statusLabel: Record<string, string> = {
    PENDING:   'Pending',
    CONFIRMED: 'Confirmed',
    DECLINED:  'Declined',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  }

  const statusColor: Record<string, string> = {
    PENDING:   'var(--tm-orange-700)',
    CONFIRMED: 'var(--tm-success)',
    DECLINED:  'var(--tm-error)',
    COMPLETED: 'var(--tm-ink-500)',
    CANCELLED: 'var(--tm-ink-500)',
  }

  return (
    <div className="min-h-screen flex flex-col bg-tm-surface pb-24">
      <AppBar title="Bookings" logo />

      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        {asPassenger.length === 0 && asDriver.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Icon name="calendar-x" size={48} color="var(--tm-ink-300)" />
            <p className="text-[15px] text-tm-ink-500">No bookings yet.</p>
            <Link href="/trips" className="text-[14px] text-tm-blue font-semibold">Browse trips</Link>
          </div>
        )}

        {asPassenger.length > 0 && (
          <section className="mb-8">
            <h2 className="tm-h2 mb-3">My seat requests</h2>
            <div className="grid gap-3">
              {asPassenger.map((b) => (
                <Link key={b.id} href={`/bookings/${b.id}`} className="card p-4 flex justify-between items-start">
                  <div>
                    <p className="text-[14px] font-semibold text-tm-ink">{b.trip.origin} to {b.trip.destination}</p>
                    <p className="text-[13px] text-tm-ink-500 mt-0.5">{format(b.trip.departureAt, 'EEE d MMM, HH:mm')}</p>
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: statusColor[b.status] ?? 'var(--tm-ink-500)' }}>
                    {statusLabel[b.status] ?? b.status}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {asDriver.length > 0 && (
          <section>
            <h2 className="tm-h2 mb-3">Requests for my trips</h2>
            <div className="grid gap-3">
              {asDriver.map((b) => (
                <Link key={b.id} href={`/trips/${b.tripId}/manage`} className="card p-4 flex justify-between items-start">
                  <div>
                    <p className="text-[14px] font-semibold text-tm-ink">{b.passenger.name}</p>
                    <p className="text-[13px] text-tm-ink-500 mt-0.5">
                      {b.trip.origin} to {b.trip.destination} &middot; {format(b.trip.departureAt, 'EEE d MMM')}
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: statusColor[b.status] ?? 'var(--tm-ink-500)' }}>
                    {statusLabel[b.status] ?? b.status}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
