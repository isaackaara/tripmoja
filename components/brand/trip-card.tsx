'use client'

import { Avatar } from './avatar'
import { Stars } from './stars'
import { Icon } from './icon'
import { formatKes, formatArrivalTime, buildWhatsAppShareUrl } from '@/lib/utils'
import type { Trip } from '@/types'

interface TripCardProps {
  trip: Trip
  onOpen?: () => void
  groupName?: string
}

function seatColor(seatsLeft: number, full: boolean): string {
  if (full || seatsLeft === 0) return 'text-tm-ink-300'
  if (seatsLeft === 1) return 'text-red-500'
  if (seatsLeft === 2) return 'text-tm-orange'
  return 'text-tm-ink-500'
}

function formatTripType(raw: string): string {
  return raw
    .toLowerCase()
    .split(/[\s_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function TripCard({ trip, onOpen, groupName }: TripCardProps) {
  const colorClass = seatColor(trip.seatsLeft, trip.full)
  const waUrl = buildWhatsAppShareUrl(trip)

  const seatText = trip.full
    ? 'Full'
    : `${trip.seatsLeft} seat${trip.seatsLeft === 1 ? '' : 's'} left`

  return (
    <div
      className="card flex flex-col gap-2.5 cursor-pointer transition-all duration-[180ms] hover:shadow-pop hover:-translate-y-0.5 active:scale-[0.985]"
      onClick={onOpen}
    >
      {/* Departure time + price */}
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className="text-[20px] font-bold text-tm-ink leading-none">
            {trip.when}
          </span>
          {trip.estimatedArrival && (
            <span className="text-[12px] text-tm-ink-500 ml-2">
              arr. {formatArrivalTime(new Date(trip.estimatedArrival))}
            </span>
          )}
        </div>
        <span className="text-lg font-bold text-tm-ink flex-none">
          {formatKes(trip.price)}
          <span className="text-[11px] font-medium text-tm-ink-500 ml-0.5">/seat</span>
        </span>
      </div>

      {/* Status line */}
      <div className="flex items-center gap-2 text-[13px] text-tm-ink-500">
        <span>
          {formatTripType(trip.tripType)}
          {' · '}
          <span className={colorClass}>{seatText}</span>
        </span>
        {trip.seatsLeft === 1 && !trip.full && (
          <span
            className="flex-none px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: 'rgba(239,155,91,0.15)', color: 'var(--tm-orange-700)' }}
          >
            Filling fast
          </span>
        )}
        {groupName && (
          <span
            className="flex-none px-2 py-0.5 rounded-full text-[11px] font-semibold ml-auto"
            style={{ background: 'var(--tm-blue-100)', color: 'var(--tm-blue)' }}
          >
            {groupName}
          </span>
        )}
      </div>

      {/* Driver row */}
      <div className="flex items-center gap-2">
        <Avatar
          initials={trip.driver.initials}
          color={trip.driver.avatarColor ?? 'blue'}
          verified={trip.driver.verified}
          size="sm"
        />
        <div className="min-w-0">
          <div className="text-[14px] font-semibold truncate">{trip.driver.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Stars value={trip.driver.rating ?? 0} size={11} />
            <span className="text-[12px] text-tm-ink-500">
              {(trip.driver.rating ?? 0).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* WhatsApp share */}
      <div className="flex justify-end">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-[12px] font-semibold"
          style={{ color: '#25D366' }}
        >
          <Icon name="share-2" size={12} color="#25D366" />
          Share
        </a>
      </div>
    </div>
  )
}
