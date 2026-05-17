'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AppBar } from '@/components/brand/app-bar'
import { Button } from '@/components/brand/button'
import { Icon } from '@/components/brand/icon'
import { createTrip } from '@/lib/actions/trips'

const TOTAL_STEPS = 4

const TRIP_TYPES = [
  { id: 'SELF_DRIVE',   icon: 'car-front',     label: 'Self drive' },
  { id: 'HIRED_DRIVER', icon: 'users',          label: 'Hired driver' },
  { id: 'TAXI_RENTAL',  icon: 'car-taxi-front', label: 'Taxi' },
] as const

const POST_TARGETS = [
  { id: 'public', name: 'Public marketplace', sub: 'Anyone on TripMoja can see this', color: '#7697F5', icon: 'globe-2', emoji: null },
  { id: 'g1',     name: 'Nanyuki Neighbours',  sub: '47 members',                      color: '#7697F5', icon: null, emoji: '🏔' },
  { id: 'g2',     name: 'Mt Kenya Cycling Club', sub: '23 members',                    color: '#EF9B5B', icon: null, emoji: '🚴' },
] as const

interface FormErrors {
  from?: string
  to?: string
  date?: string
  time?: string
  price?: string
  form?: string
}

export default function CreateTripPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isPending, startTransition] = useTransition()

  // Form data
  const [from, setFrom] = useState('Nanyuki')
  const [to,   setTo]   = useState('Nairobi')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [seats, setSeats] = useState(3)
  const [price, setPrice] = useState('')
  const [tripType, setTripType] = useState('SELF_DRIVE')
  const [notes, setNotes] = useState('')
  const [targets, setTargets] = useState<Record<string, boolean>>({ public: true, g1: true, g2: false })

  function validate(): boolean {
    const e: FormErrors = {}
    if (step === 1) {
      if (!from.trim()) e.from = 'Enter a departure town'
      if (!to.trim())   e.to   = 'Enter a destination'
      if (from.trim().toLowerCase() === to.trim().toLowerCase()) e.to = 'Departure and destination must differ'
    }
    if (step === 2) {
      if (!date) e.date = 'Pick a date'
      if (!time) e.time = 'Pick a departure time'
    }
    if (step === 3) {
      const n = parseInt(price, 10)
      if (!price || isNaN(n) || n < 100) e.price = 'Price must be at least KES 100'
      if (n > 50000) e.price = 'Price seems too high - double check'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (validate()) setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  function back() {
    setErrors({})
    if (step === 1) router.back()
    else setStep((s) => s - 1)
  }

  function toggleTarget(id: string) {
    setTargets((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const stepLabels = ['Route', 'When', 'Details', 'Post to']

  return (
    <div className="min-h-screen flex flex-col">
      <AppBar title="Post a trip" onBack={back} />

      {/* Progress bar */}
      <div className="px-4 pt-3 pb-4" style={{ background: 'var(--tm-white)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold" style={{ color: 'var(--tm-ink)' }}>
            {stepLabels[step - 1]}
          </span>
          <span className="text-[12px]" style={{ color: 'var(--tm-ink-500)' }}>
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'var(--tm-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: 'var(--tm-blue)' }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 pb-32">
        {/* Step 1: Route */}
        {step === 1 && (
          <div className="grid gap-4">
            <p className="text-[17px] font-semibold" style={{ color: 'var(--tm-ink)' }}>
              Where are you going?
            </p>
            <div>
              <span className="tm-label mb-1.5 block" style={{ color: 'var(--tm-ink-500)' }}>From</span>
              <div className={`input-field ${errors.from ? 'error' : ''}`}>
                <Icon name="map-pin" size={16} color="var(--tm-blue)" />
                <input
                  type="text"
                  value={from}
                  onChange={(e) => { setFrom(e.target.value); setErrors((x) => ({ ...x, from: undefined })) }}
                  placeholder="e.g. Nanyuki"
                  className="flex-1 bg-transparent border-none outline-none text-[15px]"
                  style={{ fontFamily: 'inherit', color: 'var(--tm-ink)' }}
                />
              </div>
              {errors.from && (
                <p className="text-[12px] mt-1 font-medium" style={{ color: 'var(--tm-error)' }}>{errors.from}</p>
              )}
            </div>
            <div>
              <span className="tm-label mb-1.5 block" style={{ color: 'var(--tm-ink-500)' }}>To</span>
              <div className={`input-field ${errors.to ? 'error' : ''}`}>
                <Icon name="map-pin" size={16} color="var(--tm-orange)" />
                <input
                  type="text"
                  value={to}
                  onChange={(e) => { setTo(e.target.value); setErrors((x) => ({ ...x, to: undefined })) }}
                  placeholder="e.g. Nairobi"
                  className="flex-1 bg-transparent border-none outline-none text-[15px]"
                  style={{ fontFamily: 'inherit', color: 'var(--tm-ink)' }}
                />
              </div>
              {errors.to && (
                <p className="text-[12px] mt-1 font-medium" style={{ color: 'var(--tm-error)' }}>{errors.to}</p>
              )}
            </div>
            <button
              onClick={() => { const t = to; setTo(from); setFrom(t) }}
              className="flex items-center gap-2 text-[13px] font-semibold"
              style={{ color: 'var(--tm-blue)' }}
            >
              <Icon name="arrow-left-right" size={14} color="var(--tm-blue)" />
              Swap direction
            </button>
          </div>
        )}

        {/* Step 2: When */}
        {step === 2 && (
          <div className="grid gap-4">
            <p className="text-[17px] font-semibold" style={{ color: 'var(--tm-ink)' }}>
              When are you leaving?
            </p>
            <div>
              <span className="tm-label mb-1.5 block" style={{ color: 'var(--tm-ink-500)' }}>Date</span>
              <div className={`input-field ${errors.date ? 'error' : ''}`}>
                <Icon name="calendar" size={16} color="var(--tm-ink-500)" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setErrors((x) => ({ ...x, date: undefined })) }}
                  className="flex-1 bg-transparent border-none outline-none text-[15px]"
                  style={{ fontFamily: 'inherit', color: 'var(--tm-ink)' }}
                />
              </div>
              {errors.date && (
                <p className="text-[12px] mt-1 font-medium" style={{ color: 'var(--tm-error)' }}>{errors.date}</p>
              )}
            </div>
            <div>
              <span className="tm-label mb-1.5 block" style={{ color: 'var(--tm-ink-500)' }}>Departure time</span>
              <div className={`input-field ${errors.time ? 'error' : ''}`}>
                <Icon name="clock" size={16} color="var(--tm-ink-500)" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => { setTime(e.target.value); setErrors((x) => ({ ...x, time: undefined })) }}
                  className="flex-1 bg-transparent border-none outline-none text-[15px]"
                  style={{ fontFamily: 'inherit', color: 'var(--tm-ink)' }}
                />
              </div>
              {errors.time && (
                <p className="text-[12px] mt-1 font-medium" style={{ color: 'var(--tm-error)' }}>{errors.time}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="grid gap-4">
            <p className="text-[17px] font-semibold" style={{ color: 'var(--tm-ink)' }}>
              How many seats and at what price?
            </p>
            <div>
              <span className="tm-label mb-1.5 block" style={{ color: 'var(--tm-ink-500)' }}>Seats available</span>
              <div className="input-field justify-between">
                <button
                  className="w-8 h-8 flex items-center justify-center font-bold"
                  style={{ borderRadius: 8, background: 'var(--tm-blue-050)', color: 'var(--tm-blue)', fontSize: 20 }}
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                  aria-label="Decrease seats"
                >
                  −
                </button>
                <span className="font-bold text-[20px]" style={{ color: 'var(--tm-ink)' }}>{seats}</span>
                <button
                  className="w-8 h-8 flex items-center justify-center font-bold text-white"
                  style={{ borderRadius: 8, background: 'var(--tm-blue)', fontSize: 20 }}
                  onClick={() => setSeats(Math.min(8, seats + 1))}
                  aria-label="Increase seats"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <span className="tm-label mb-1.5 block" style={{ color: 'var(--tm-ink-500)' }}>Price per seat (KES)</span>
              <div className={`input-field ${errors.price ? 'error' : ''}`}>
                <span className="text-[13px] mr-1" style={{ color: 'var(--tm-ink-500)' }}>KES</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value.replace(/[^0-9]/g, ''))
                    setErrors((x) => ({ ...x, price: undefined }))
                  }}
                  placeholder="1200"
                  className="flex-1 bg-transparent border-none outline-none text-[15px] font-semibold"
                  style={{ fontFamily: 'inherit', color: 'var(--tm-ink)' }}
                />
              </div>
              {errors.price && (
                <p className="text-[12px] mt-1 font-medium" style={{ color: 'var(--tm-error)' }}>{errors.price}</p>
              )}
            </div>
            <div>
              <span className="tm-label mb-1.5 block" style={{ color: 'var(--tm-ink-500)' }}>Trip type</span>
              <div className="grid grid-cols-3 gap-2">
                {TRIP_TYPES.map((t) => {
                  const active = tripType === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTripType(t.id)}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 transition-all duration-[120ms]"
                      style={{
                        borderRadius: 12,
                        border: `1.5px solid ${active ? 'var(--tm-blue)' : 'var(--tm-border)'}`,
                        background: active ? 'var(--tm-blue-050)' : 'var(--tm-white)',
                      }}
                    >
                      <Icon name={t.icon} size={22} color={active ? 'var(--tm-blue)' : 'var(--tm-ink-500)'} />
                      <span className="text-[12px] font-semibold" style={{ color: active ? 'var(--tm-blue)' : 'var(--tm-ink-500)' }}>
                        {t.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Notes + Post to */}
        {step === 4 && (
          <div className="grid gap-4">
            <p className="text-[17px] font-semibold" style={{ color: 'var(--tm-ink)' }}>
              Any notes for passengers?
            </p>
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 text-[15px] border outline-none resize-y"
                style={{
                  borderRadius: 12,
                  fontFamily: 'inherit',
                  minHeight: 80,
                  background: 'var(--tm-white)',
                  color: 'var(--tm-ink)',
                  borderColor: 'var(--tm-border)',
                }}
                placeholder="Pickup at Nanyuki Mall, drops in CBD and Westlands..."
              />
              <p className="text-[12px] mt-1" style={{ color: 'var(--tm-ink-500)' }}>
                Pickup point, stops, anything passengers need to know. Optional.
              </p>
            </div>
            <div>
              <span className="tm-label mb-2 block" style={{ color: 'var(--tm-ink-500)' }}>Post to</span>
              <div className="flex flex-col gap-2">
                {POST_TARGETS.map((target) => (
                  <button
                    key={target.id}
                    onClick={() => toggleTarget(target.id)}
                    className="flex items-center gap-3 p-3 text-left border"
                    style={{
                      borderRadius: 12,
                      background: 'var(--tm-white)',
                      borderColor: targets[target.id] ? 'var(--tm-blue)' : 'var(--tm-border)',
                    }}
                  >
                    <span
                      className="w-9 h-9 flex-none flex items-center justify-center font-bold text-white text-[16px]"
                      style={{ borderRadius: 10, background: target.color }}
                    >
                      {target.emoji ?? <Icon name={target.icon!} size={18} color="#fff" />}
                    </span>
                    <div className="flex-1">
                      <div className="text-[14px] font-semibold" style={{ color: 'var(--tm-ink)' }}>{target.name}</div>
                      <div className="text-[12px]" style={{ color: 'var(--tm-ink-500)' }}>{target.sub}</div>
                    </div>
                    <span
                      className="w-6 h-6 flex-none flex items-center justify-center"
                      style={{
                        borderRadius: 6,
                        background: targets[target.id] ? 'var(--tm-blue)' : 'var(--tm-white)',
                        border: targets[target.id] ? 'none' : '1.5px solid var(--tm-border-strong)',
                      }}
                    >
                      {targets[target.id] && <Icon name="check" size={14} color="#fff" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="sticky-cta">
        {errors.form && (
          <p className="text-[13px] font-medium text-center mb-2" style={{ color: 'var(--tm-error)' }}>{errors.form}</p>
        )}
        {step < TOTAL_STEPS ? (
          <Button variant="primary" full onClick={next} icon="arrow-right">
            Next
          </Button>
        ) : (
          <Button
            variant="primary"
            full
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const isPublic = targets['public'] ?? true
                const result = await createTrip({
                  origin:      from,
                  destination: to,
                  date,
                  time,
                  seats,
                  price:       parseInt(price, 10),
                  tripType,
                  notes:       notes || undefined,
                  isPublic,
                })
                if (result.error) {
                  setErrors({ form: result.error })
                  return
                }
                router.push(`/trips/${result.tripId}`)
              })
            }}
          >
            {isPending ? 'Posting...' : `Post trip${price ? ` · KES ${parseInt(price, 10).toLocaleString()}/seat` : ''}`}
          </Button>
        )}
      </div>
    </div>
  )
}
