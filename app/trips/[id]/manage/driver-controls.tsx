'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setEnRoute, toggleAcceptingRequests, completeTrip } from '@/lib/actions/trips'
import { Icon } from '@/components/brand/icon'

interface DriverControlsProps {
  tripId:              string
  isAcceptingRequests: boolean
  departureStatus:     string
  tripStatus:          string
}

export default function DriverControls({
  tripId,
  isAcceptingRequests,
  departureStatus,
  tripStatus,
}: DriverControlsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEnRoute   = departureStatus === 'EN_ROUTE'
  const isCompleted = tripStatus === 'COMPLETED'

  function handleEnRoute() {
    startTransition(async () => {
      await setEnRoute(tripId)
      router.refresh()
    })
  }

  function handleTogglePause() {
    startTransition(async () => {
      await toggleAcceptingRequests(tripId)
      router.refresh()
    })
  }

  function handleComplete() {
    if (!confirm('Mark this trip as complete? Rating links will be sent to passengers.')) return
    startTransition(async () => {
      await completeTrip(tripId)
      router.refresh()
    })
  }

  if (isCompleted) {
    return (
      <div
        className="flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold"
        style={{ background: 'var(--tm-green)', color: 'var(--tm-ink)' }}
      >
        <Icon name="check-circle" size={16} color="var(--tm-ink)" />
        Trip completed
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {!isEnRoute && (
        <button
          onClick={handleEnRoute}
          disabled={isPending}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[15px] font-semibold"
          style={{
            background: 'var(--tm-blue)',
            color: '#fff',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          <Icon name="navigation" size={16} color="#fff" />
          {isPending ? '...' : "I'm on my way"}
        </button>
      )}

      <button
        onClick={handleTogglePause}
        disabled={isPending}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[15px] font-semibold"
        style={{
          background: 'transparent',
          border: `1.5px solid ${isAcceptingRequests ? 'var(--tm-border-strong)' : 'var(--tm-blue)'}`,
          color: isAcceptingRequests ? 'var(--tm-ink-500)' : 'var(--tm-blue)',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        <Icon
          name={isAcceptingRequests ? 'pause-circle' : 'play-circle'}
          size={16}
          color={isAcceptingRequests ? 'var(--tm-ink-500)' : 'var(--tm-blue)'}
        />
        {isPending ? '...' : isAcceptingRequests ? 'Pause new bookings' : 'Resume bookings'}
      </button>

      <button
        onClick={handleComplete}
        disabled={isPending}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[14px] font-semibold"
        style={{
          background: 'transparent',
          border: '1.5px solid var(--tm-border-strong)',
          color: 'var(--tm-ink-500)',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        <Icon name="flag" size={14} color="var(--tm-ink-500)" />
        {isPending ? '...' : 'Mark trip complete'}
      </button>
    </div>
  )
}
