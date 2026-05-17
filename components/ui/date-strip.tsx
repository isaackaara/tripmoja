'use client'

import { useRouter, useSearchParams } from 'next/navigation'

function toIso(date: Date): string {
  return date.toISOString().split('T')[0]
}

function pillLabel(date: Date, index: number): string {
  if (index === 0) return 'Today'
  if (index === 1) return 'Tomorrow'
  return date.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric' })
}

export function DateStrip() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = toIso(today)
  const selected = searchParams.get('date') ?? todayIso

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return { iso: toIso(d), label: pillLabel(d, i) }
  })

  function pick(iso: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', iso)
    router.push(`/trips?${params.toString()}`)
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto px-4 py-2.5"
      style={{ scrollbarWidth: 'none' }}
    >
      {days.map(({ iso, label }) => {
        const active = iso === selected
        return (
          <button
            key={iso}
            onClick={() => pick(iso)}
            className="flex-none px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap"
            style={{
              background: active ? 'var(--tm-blue)' : 'var(--tm-surface)',
              color: active ? '#fff' : 'var(--tm-ink-700)',
              border: active ? 'none' : '1px solid var(--tm-border)',
              transition: 'background 120ms, color 120ms',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
