import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AppBar } from '@/components/brand/app-bar'
import RateForm from './rate-form'

export default async function RatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const ratingToken = await prisma.ratingToken.findUnique({
    where:   { token },
    include: {
      booking: {
        include: {
          trip:      true,
          passenger: true,
        },
      },
    },
  })

  if (!ratingToken) notFound()

  const otherParty =
    ratingToken.side === 'DRIVER'
      ? ratingToken.booking.passenger.name
      : ratingToken.booking.trip.origin

  const { origin, destination } = ratingToken.booking.trip
  const isExpired = ratingToken.expiresAt < new Date()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--tm-surface)' }}>
      <AppBar logo />

      <main className="flex-1 flex flex-col justify-center px-4 py-8 max-w-sm mx-auto w-full">
        <h1 className="tm-h1 mb-1">Rate your trip</h1>
        <p className="text-[14px] mb-8" style={{ color: 'var(--tm-ink-500)' }}>
          {origin} to {destination} with {ratingToken.side === 'DRIVER' ? ratingToken.booking.passenger.name : 'your driver'}
        </p>

        {ratingToken.used ? (
          <div className="card p-6 text-center">
            <p className="text-[15px] font-semibold text-tm-ink mb-1">Rating submitted</p>
            <p className="text-[14px] text-tm-ink-500">Thank you. Your rating will be revealed once the other party submits theirs.</p>
          </div>
        ) : isExpired ? (
          <div className="card p-6 text-center">
            <p className="text-[15px] font-semibold text-tm-ink mb-1">Link expired</p>
            <p className="text-[14px] text-tm-ink-500">This rating link has expired (30-day window).</p>
          </div>
        ) : (
          <RateForm
            token={token}
            otherName={ratingToken.side === 'DRIVER' ? ratingToken.booking.passenger.name : 'your driver'}
          />
        )}
      </main>
    </div>
  )
}
