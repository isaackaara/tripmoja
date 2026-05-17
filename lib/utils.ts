import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { addMinutes, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`
}

export function formatRoute(origin: string, destination: string): string {
  return `${origin} → ${destination}`
}

const ROUTE_DURATIONS_MIN: Record<string, number> = {
  'nanyuki->nairobi': 180,
  'nairobi->nanyuki': 210,
}

export function estimateArrival(origin: string, destination: string, departureAt: Date): Date | null {
  const key = `${origin.toLowerCase()}->${destination.toLowerCase()}`
  const duration = ROUTE_DURATIONS_MIN[key]
  if (!duration) return null
  return addMinutes(departureAt, duration)
}

export function formatArrivalTime(arrival: Date): string {
  return format(arrival, 'HH:mm')
}

export function buildShareUrl(tripId: string): string {
  return `https://tripmoja.com/trips/${tripId}`
}

export function buildWhatsAppShareUrl(trip: {
  id: string
  from: string
  to: string
  when: string
  price: number
}): string {
  const url = buildShareUrl(trip.id)
  const msg = `${trip.from} to ${trip.to} - ${trip.when} - KES ${trip.price.toLocaleString('en-KE')}/seat\nBook on TripMoja: ${url}`
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}
