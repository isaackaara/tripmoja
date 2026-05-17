'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelBooking } from '@/lib/actions/bookings'

export default function CancelButton({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    if (!confirm('Cancel this booking?')) return
    startTransition(async () => {
      await cancelBooking(bookingId)
      router.push('/bookings')
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="w-full py-3 rounded-xl text-[15px] font-semibold"
      style={{
        background: 'transparent',
        border: '1.5px solid var(--tm-error)',
        color: 'var(--tm-error)',
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {isPending ? 'Cancelling...' : 'Cancel booking'}
    </button>
  )
}
