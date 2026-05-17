import type { Trip as PrismaTrip, User as PrismaUser, Verification } from '@prisma/client'
import { format } from 'date-fns'
import type { Trip } from '@/types'
import { estimateArrival, formatArrivalTime } from '@/lib/utils'

type PrismaTripWithDriver = PrismaTrip & {
  driver: PrismaUser & { verification: Verification | null }
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const AVATAR_COLORS = ['blue', 'orange', 'green', 'ink'] as const

export function mapTrip(t: PrismaTripWithDriver): Trip {
  const colorIdx = t.driverId.charCodeAt(t.driverId.length - 1) % AVATAR_COLORS.length
  const dep = new Date(t.departureAt)
  const v = t.driver.verification

  const verified     = v?.status === 'APPROVED'
  const verifiedType = verified
    ? (v?.type === 'DRIVER' ? 'DRIVER' : 'ID')
    : undefined

  const arrivalDate = estimateArrival(t.origin, t.destination, dep)
  const estimatedArrival = arrivalDate ? arrivalDate.toISOString() : undefined

  return {
    id:               t.id,
    from:             t.origin,
    to:               t.destination,
    price:            t.pricePerSeat,
    departureAt:      t.departureAt.toISOString(),
    when:             `${format(dep, 'EEE d MMM')} · ${format(dep, 'HH:mm')}`,
    estimatedArrival,
    seatsLeft:   t.seatsAvailable,
    seatsTotal:  t.seatsTotal,
    tripType:    t.tripType,
    full:        t.seatsAvailable === 0 || t.status === 'FULL',
    isPublic:    t.isPublic,
    status:      t.status as Trip['status'],
    notes:       t.notes ?? undefined,
    driver: {
      id:           t.driver.id,
      name:         t.driver.name,
      initials:     initials(t.driver.name),
      avatarUrl:    t.driver.avatarUrl ?? undefined,
      rating:       t.driver.rating ?? undefined,
      tripCount:    t.driver.tripCount,
      bio:          t.driver.bio ?? undefined,
      verified,
      verifiedType,
      avatarColor:  AVATAR_COLORS[colorIdx],
    },
  }
}
