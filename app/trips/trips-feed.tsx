'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppBar } from '@/components/brand/app-bar'
import { BottomNav } from '@/components/brand/bottom-nav'
import { TripCard } from '@/components/brand/trip-card'
import { Icon } from '@/components/brand/icon'
import { SearchBar } from '@/components/ui/search-bar'
import { DateStrip } from '@/components/ui/date-strip'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { TripDetail } from '@/components/ui/trip-detail'
import { FeedSkeleton } from '@/components/ui/skeleton'
import { OfflineBanner } from '@/components/ui/offline-banner'
import { saveFeedCache, loadFeedCache, formatCacheAge } from '@/lib/cache'
import type { Trip } from '@/types'
import { useRouter } from 'next/navigation'

function toIso(date: Date): string {
  return date.toISOString().split('T')[0]
}

function Inner({ trips }: { trips: Trip[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<Trip | null>(null)
  const [cacheAge, setCacheAge] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (trips.length > 0) {
      saveFeedCache(trips)
    }
    const cached = loadFeedCache()
    if (cached) {
      setCacheAge(formatCacheAge(cached.savedAt))
      intervalRef.current = setInterval(() => {
        setCacheAge(formatCacheAge(cached.savedAt))
      }, 60_000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [trips])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = toIso(today)
  const selectedDate = searchParams.get('date') ?? todayIso
  const from = searchParams.get('from') ?? 'Nanyuki'
  const to   = searchParams.get('to')   ?? 'Nairobi'

  const filtered = trips.filter((t) => {
    const matchesDate  = t.departureAt.startsWith(selectedDate)
    const matchesRoute =
      t.from.toLowerCase() === from.toLowerCase() &&
      t.to.toLowerCase()   === to.toLowerCase()
    return matchesDate && matchesRoute
  })

  const sorted = [...filtered].sort((a, b) => a.departureAt.localeCompare(b.departureAt))

  const similar = selected
    ? trips.filter(
        (t) =>
          t.from.toLowerCase() === selected.from.toLowerCase() &&
          t.to.toLowerCase()   === selected.to.toLowerCase() &&
          t.id !== selected.id,
      )
    : []

  return (
    <div className="min-h-screen flex flex-col">
      <AppBar
        title="Find a ride"
        right={
          <span className="iconbtn">
            <Icon name="sliders-horizontal" size={20} color="var(--tm-ink)" />
          </span>
        }
      />

      <OfflineBanner />

      <div
        className="sticky z-20 border-b"
        style={{ top: 56, background: 'var(--tm-white)', borderColor: 'var(--tm-border)' }}
      >
        <div className="px-4 pt-3 pb-0">
          <SearchBar />
        </div>
        <DateStrip />
      </div>

      <div className="flex-1 px-4 pt-3 pb-24">
        {sorted.length > 0 ? (
          <>
            <div className="flex items-baseline justify-between mb-2.5">
              <p className="text-[13px]" style={{ color: 'var(--tm-ink-500)' }}>
                {sorted.length} trip{sorted.length === 1 ? '' : 's'} · earliest first
              </p>
              {cacheAge && (
                <p className="text-[11px]" style={{ color: 'var(--tm-ink-300)' }}>
                  Updated {cacheAge}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              {sorted.map((trip) => (
                <TripCard key={trip.id} trip={trip} onOpen={() => setSelected(trip)} />
              ))}
            </div>
            <div className="py-6 text-center text-[13px]" style={{ color: 'var(--tm-ink-500)' }}>
              End of results.
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div
              className="w-14 h-14 flex items-center justify-center rounded-2xl"
              style={{ background: 'var(--tm-blue-100)' }}
            >
              <Icon name="car-front" size={28} color="var(--tm-blue)" />
            </div>
            <p className="text-[15px] font-semibold" style={{ color: 'var(--tm-ink)' }}>No trips found</p>
            <p className="text-[13px] text-center" style={{ color: 'var(--tm-ink-500)' }}>
              No {from} to {to} trips on this date. Try another date or swap the route.
            </p>
          </div>
        )}
      </div>

      <BottomNav />

      <BottomSheet
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.from} → ${selected.to}` : undefined}
      >
        {selected && (
          <TripDetail
            trip={selected}
            similarTrips={similar}
            onOpenTrip={(t) => setSelected(t)}
            onRequestSeat={() => router.push(`/trips/${selected.id}`)}
          />
        )}
      </BottomSheet>
    </div>
  )
}

export function TripsFeed({ trips }: { trips: Trip[] }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <div className="appbar" />
        <div className="px-4 pt-3">
          <FeedSkeleton />
        </div>
      </div>
    }>
      <Inner trips={trips} />
    </Suspense>
  )
}
