import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AppBar } from '@/components/brand/app-bar'
import { format, differenceInDays } from 'date-fns'
import CancelButton from './cancel-button'
import { revealStaleRatings } from '@/lib/actions/ratings'

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.email) redirect(`/login?next=/bookings/${id}`)

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect('/login')

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      trip:         { include: { driver: true } },
      passenger:    true,
      ratingTokens: true,
      reviews:      true,
    },
  })
  if (!booking) notFound()
  if (booking.passengerId !== user.id) redirect('/bookings')

  if (booking.status === 'COMPLETED') {
    await revealStaleRatings(id)
  }

  const isConfirmed  = booking.status === 'CONFIRMED'
  const isCompleted  = booking.status === 'COMPLETED'
  const isCancellable = ['PENDING', 'CONFIRMED'].includes(booking.status)

  const statusLabel: Record<string, string> = {
    PENDING:   'Pending driver response',
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

  const passengerToken = booking.ratingTokens.find((t) => t.side === 'PASSENGER')
  const myReview       = booking.reviews.find((r) => r.reviewerId === user.id)
  const theirReview    = booking.reviews.find((r) => r.reviewerId !== user.id)

  const daysLeft = passengerToken
    ? Math.max(0, differenceInDays(passengerToken.expiresAt, new Date()))
    : 0

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--tm-surface)' }}>
      <AppBar title="Booking" onBack={true} />

      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full grid gap-4">
        <div className="card p-4 grid gap-1">
          <div className="flex justify-between items-start">
            <h2 className="tm-h2">{booking.trip.origin} to {booking.trip.destination}</h2>
            <span className="text-[12px] font-semibold" style={{ color: statusColor[booking.status] ?? 'var(--tm-ink-500)' }}>
              {statusLabel[booking.status] ?? booking.status}
            </span>
          </div>
          <p className="text-[14px] text-tm-ink-500">{format(booking.trip.departureAt, 'EEEE d MMMM yyyy, HH:mm')}</p>
          <p className="text-[14px] text-tm-ink-500 mt-1">KES {booking.trip.pricePerSeat.toLocaleString()}/seat</p>
        </div>

        <div className="card p-4">
          <p className="text-[13px] font-semibold text-tm-ink-500 mb-2">Driver</p>
          <p className="text-[15px] font-semibold text-tm-ink">{booking.trip.driver.name}</p>
          {isConfirmed && booking.trip.driver.phone && (
            <a
              href={`tel:${booking.trip.driver.phone}`}
              className="text-[14px] text-tm-blue font-semibold mt-1 inline-block"
            >
              {booking.trip.driver.phone}
            </a>
          )}
          {!isConfirmed && !isCompleted && (
            <p className="text-[13px] text-tm-ink-500 mt-1">Phone revealed after confirmation</p>
          )}
        </div>

        {booking.message && (
          <div className="card p-4">
            <p className="text-[13px] font-semibold text-tm-ink-500 mb-1">Your message</p>
            <p className="text-[14px] text-tm-ink">{booking.message}</p>
          </div>
        )}

        {isCompleted && passengerToken && (
          <div className="card p-4">
            <p className="text-[13px] font-semibold text-tm-ink-500 mb-2">Rating</p>

            {!myReview && !passengerToken.used && (
              <Link
                href={`/rate/${passengerToken.token}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[15px] font-semibold"
                style={{ background: 'var(--tm-blue)', color: '#fff' }}
              >
                Rate your trip with {booking.trip.driver.name}
              </Link>
            )}

            {myReview && !myReview.revealed && (
              <p className="text-[14px] text-tm-ink-500">
                Your rating is submitted. Waiting for {booking.trip.driver.name} to rate ({daysLeft} day{daysLeft !== 1 ? 's' : ''} left to reveal automatically).
              </p>
            )}

            {myReview?.revealed && (
              <div className="grid gap-1">
                <p className="text-[14px] text-tm-ink">
                  You rated: {'★'.repeat(myReview.rating)}{'☆'.repeat(5 - myReview.rating)}
                </p>
                {myReview.comment && (
                  <p className="text-[13px] text-tm-ink-500 italic">&ldquo;{myReview.comment}&rdquo;</p>
                )}
                {theirReview?.revealed && (
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--tm-border)' }}>
                    <p className="text-[13px] text-tm-ink-500 mb-0.5">Driver rated you:</p>
                    <p className="text-[14px] text-tm-ink">
                      {'★'.repeat(theirReview.rating)}{'☆'.repeat(5 - theirReview.rating)}
                    </p>
                    {theirReview.comment && (
                      <p className="text-[13px] text-tm-ink-500 italic">&ldquo;{theirReview.comment}&rdquo;</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {isCancellable && <CancelButton bookingId={booking.id} />}
      </main>
    </div>
  )
}
