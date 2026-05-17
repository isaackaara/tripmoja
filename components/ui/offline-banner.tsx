'use client'

import { useOffline } from '@/hooks/use-offline'
import { Icon } from '@/components/brand/icon'

export function OfflineBanner() {
  const { isOffline } = useOffline()

  if (!isOffline) return null

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium"
      style={{ background: 'var(--tm-ink)', color: '#fff' }}
      role="status"
      aria-live="polite"
    >
      <Icon name="wifi-off" size={14} color="#fff" />
      You&apos;re offline. Showing last cached data.
    </div>
  )
}
