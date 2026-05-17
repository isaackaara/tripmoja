'use client'

import type React from 'react'
import { Button } from '@/components/brand/button'
import { Icon } from '@/components/brand/icon'
import { Stars } from '@/components/brand/stars'
import { TripCard } from '@/components/brand/trip-card'
import { DriverSheet } from '@/components/ui/driver-sheet'
import { formatKes, formatArrivalTime, buildWhatsAppShareUrl } from '@/lib/utils'
import type { Trip } from '@/types'

const MOCK_REVIEWS = [
  { name: 'Alice K.', when: '3 weeks ago', rating: 5, text: 'Great driver, smooth ride and on time.' },
  { name: 'Peter M.', when: '2 months ago', rating: 5, text: 'Comfortable car. Will book again.' },
]

interface TripDetailProps {
  trip: Trip
  similarTrips?: Trip[]
  onRequestSeat?: () => void
  onOpenTrip?: (trip: Trip) => void
  ctaSlot?: React.ReactNode
}

export function TripDetail({ trip, similarTrips = [], onRequestSeat, onOpenTrip, ctaSlot }: TripDetailProps) {
  const taken = trip.seatsTotal - trip.seatsLeft

  const waUrl = buildWhatsAppShareUrl(trip)

  return (
    <div className="flex flex-col gap-0">
      {/* Summary card */}
      <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
        {/* Departure + price */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[22px] font-bold" style={{ color: 'var(--tm-ink)' }}>
              {trip.when.split('·')[1]?.trim() ?? trip.when}
            </span>
            {trip.estimatedArrival && (
              <span className="text-[13px] ml-2" style={{ color: 'var(--tm-ink-500)' }}>
                arr. {formatArrivalTime(new Date(trip.estimatedArrival))}
              </span>
            )}
          </div>
          <span className="text-[18px] font-bold" style={{ color: 'var(--tm-ink)' }}>
            {formatKes(trip.price)}
            <span className="text-[11px] font-medium ml-0.5" style={{ color: 'var(--tm-ink-500)' }}>/seat</span>
          </span>
        </div>

        {/* Route + date */}
        <div className="flex items-center gap-2 text-[14px]" style={{ color: 'var(--tm-ink-700)' }}>
          <Icon name="map-pin" size={14} color="var(--tm-blue)" />
          <span className="font-semibold">{trip.from}</span>
          <span style={{ color: 'var(--tm-ink-300)' }}>→</span>
          <Icon name="map-pin" size={14} color="var(--tm-orange)" />
          <span className="font-semibold">{trip.to}</span>
          <span className="ml-auto text-[13px]" style={{ color: 'var(--tm-ink-500)' }}>
            {trip.when.split('·')[0]?.trim()}
          </span>
        </div>

        {/* Seat grid */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: trip.seatsTotal }).map((_, i) => (
            <span
              key={i}
              className="w-7 h-7 flex items-center justify-center"
              style={{
                borderRadius: 8,
                background: i < taken ? 'var(--tm-ink)' : 'var(--tm-green)',
              }}
            >
              <Icon name="armchair" size={14} color={i < taken ? '#fff' : 'var(--tm-ink)'} />
            </span>
          ))}
          <span className="ml-auto text-[12px]" style={{ color: 'var(--tm-ink-500)' }}>
            {trip.seatsLeft} of {trip.seatsTotal} open
          </span>
        </div>

        {/* WhatsApp share */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[13px] font-semibold"
          style={{ color: '#25D366' }}
        >
          <Icon name="share-2" size={14} color="#25D366" />
          Share on WhatsApp
        </a>
      </div>

      {/* Driver */}
      <div className="border-t" style={{ borderColor: 'var(--tm-border)' }}>
        <p className="section-h px-4 pt-4 mb-0">Driver</p>
        <DriverSheet driver={trip.driver} />
      </div>

      {/* Notes */}
      {trip.notes && (
        <div className="border-t px-4 py-4" style={{ borderColor: 'var(--tm-border)' }}>
          <p className="section-h mb-2">Notes</p>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--tm-ink-700)' }}>
            {trip.notes}
          </p>
        </div>
      )}

      {/* Reviews */}
      <div className="border-t px-4 py-4" style={{ borderColor: 'var(--tm-border)' }}>
        <p className="section-h mb-3">Reviews</p>
        <div className="grid gap-3">
          {MOCK_REVIEWS.map((r, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[14px] font-semibold">{r.name}</span>
                <span className="text-[12px]" style={{ color: 'var(--tm-ink-500)' }}>{r.when}</span>
              </div>
              <Stars value={r.rating} size={12} />
              <p className="text-[13px] m-0" style={{ color: 'var(--tm-ink-700)' }}>{r.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Similar trips */}
      {similarTrips.length > 0 && (
        <div className="border-t px-4 py-4" style={{ borderColor: 'var(--tm-border)' }}>
          <p className="section-h mb-3">Similar trips</p>
          <div className="grid gap-3">
            {similarTrips.map((t) => (
              <TripCard key={t.id} trip={t} onOpen={() => onOpenTrip?.(t)} />
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div
        className="px-4 pt-4 pb-6 border-t"
        style={{ borderColor: 'var(--tm-border)' }}
      >
        {ctaSlot ?? (
          <Button
            variant="primary"
            full
            disabled={trip.full}
            onClick={onRequestSeat}
          >
            {trip.full ? 'Trip full' : 'Request seat'}
          </Button>
        )}
      </div>
    </div>
  )
}
