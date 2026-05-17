'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/brand/button'
import { requestSeat } from '@/lib/actions/bookings'

export default function RequestButton({ tripId, isFull, isSignedIn }: { tripId: string; isFull: boolean; isSignedIn: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function handleClick() {
    if (!isSignedIn) {
      router.push(`/login?next=/trips/${tripId}`)
      return
    }
    startTransition(async () => {
      const result = await requestSeat(tripId)
      if (result.error) {
        setError(result.error)
        return
      }
      setDone(true)
      router.push('/bookings')
    })
  }

  if (done) return null

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-[13px] font-medium text-center" style={{ color: 'var(--tm-error)' }}>{error}</p>
      )}
      <Button variant="primary" full disabled={isFull || isPending} onClick={handleClick}>
        {isFull ? 'Trip full' : isPending ? 'Requesting...' : 'Request seat'}
      </Button>
    </div>
  )
}
