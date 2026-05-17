'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Icon } from '@/components/brand/icon'

export function SearchBar() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const from = searchParams.get('from') ?? 'Nanyuki'
  const to   = searchParams.get('to')   ?? 'Nairobi'
  const date = searchParams.get('date') ?? ''

  function swap() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('from', to)
    params.set('to', from)
    router.push(`/trips?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 flex items-center gap-1.5 h-11 px-3 rounded-xl"
        style={{
          background: 'var(--tm-white)',
          border: '1px solid var(--tm-border)',
          fontSize: 14,
        }}
      >
        <Icon name="map-pin" size={13} color="var(--tm-blue)" />
        <span className="font-semibold truncate" style={{ color: 'var(--tm-ink)' }}>{from}</span>
        <span style={{ color: 'var(--tm-ink-300)', fontSize: 12, margin: '0 2px' }}>→</span>
        <Icon name="map-pin" size={13} color="var(--tm-orange)" />
        <span className="font-semibold truncate" style={{ color: 'var(--tm-ink)' }}>{to}</span>
        {date && (
          <span className="ml-auto flex-none" style={{ color: 'var(--tm-ink-500)', fontSize: 12 }}>
            {new Date(date + 'T00:00:00').toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
      <button
        onClick={swap}
        className="iconbtn flex-none"
        aria-label="Swap direction"
        style={{ width: 40, height: 40 }}
      >
        <Icon name="arrow-left-right" size={18} color="var(--tm-ink-500)" />
      </button>
    </div>
  )
}
