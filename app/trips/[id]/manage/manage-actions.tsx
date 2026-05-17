'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { acceptBooking, declineBooking } from '@/lib/actions/bookings'

export default function ManageActions({ bookingId, tripId }: { bookingId: string; tripId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function act(action: 'accept' | 'decline') {
    startTransition(async () => {
      if (action === 'accept') {
        await acceptBooking(bookingId)
      } else {
        await declineBooking(bookingId)
      }
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act('decline')}
        disabled={isPending}
        className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold"
        style={{
          background: 'transparent',
          border: '1.5px solid var(--tm-error)',
          color: 'var(--tm-error)',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        Decline
      </button>
      <button
        onClick={() => act('accept')}
        disabled={isPending}
        className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold"
        style={{
          background: 'var(--tm-blue)',
          color: '#fff',
          border: 'none',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? '...' : 'Accept'}
      </button>
    </div>
  )
}
