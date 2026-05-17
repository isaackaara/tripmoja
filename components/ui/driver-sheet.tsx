'use client'

import { Avatar } from '@/components/brand/avatar'
import { Stars } from '@/components/brand/stars'
import { Icon } from '@/components/brand/icon'

interface DriverSheetProps {
  driver: {
    id:           string
    name:         string
    initials:     string
    avatarUrl?:   string
    rating?:      number
    tripCount?:   number
    bio?:         string
    verified:     boolean
    verifiedType?: 'ID' | 'DRIVER'
    avatarColor?: 'blue' | 'orange' | 'green' | 'ink'
  }
}

export function DriverSheet({ driver }: DriverSheetProps) {
  const verifiedLabel = driver.verifiedType === 'DRIVER' ? 'Driver Verified' : 'ID Verified'

  return (
    <div className="flex flex-col gap-0">
      {driver.verified && (
        <div className="px-4 pt-4 pb-0">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold"
            style={{
              borderRadius: 20,
              background: 'var(--tm-blue)',
              color: '#fff',
            }}
          >
            <Icon name="badge-check" size={14} color="#fff" />
            {verifiedLabel}
          </span>
        </div>
      )}

      <div className="px-4 pt-4 pb-4 flex gap-4 items-center">
        <Avatar
          initials={driver.initials}
          color={driver.avatarColor ?? 'blue'}
          size="lg"
          verified={false}
        />
        <div className="min-w-0">
          <h2 className="text-[20px] font-bold" style={{ color: 'var(--tm-ink)' }}>{driver.name}</h2>
          {(driver.rating !== undefined) && (
            <div className="flex items-center gap-1.5 mt-1">
              <Stars value={driver.rating} size={14} />
              <span className="text-[13px]" style={{ color: 'var(--tm-ink-500)' }}>
                {driver.rating.toFixed(1)}
              </span>
            </div>
          )}
          {(driver.tripCount !== undefined && driver.tripCount > 0) && (
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--tm-ink-500)' }}>
              {driver.tripCount} trip{driver.tripCount !== 1 ? 's' : ''} completed
            </p>
          )}
        </div>
      </div>

      {driver.bio && (
        <div className="border-t px-4 py-4" style={{ borderColor: 'var(--tm-border)' }}>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--tm-ink-700)' }}>
            {driver.bio}
          </p>
        </div>
      )}
    </div>
  )
}
