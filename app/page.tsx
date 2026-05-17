import Link from 'next/link'
import { AppBar } from '@/components/brand/app-bar'
import { BottomNav } from '@/components/brand/bottom-nav'
import { Blob } from '@/components/brand/blob'
import { Button } from '@/components/brand/button'
import { TripCard } from '@/components/brand/trip-card'
import { Icon } from '@/components/brand/icon'
import { MOCK_TRIPS } from '@/lib/mock-data'

const HOW_IT_WORKS = [
  {
    icon: 'search',
    title: 'Search',
    description: 'Pick a date, see who is driving today.',
  },
  {
    icon: 'message-circle',
    title: 'Request a seat',
    description: 'Send the driver a note, they accept.',
  },
  {
    icon: 'car-front',
    title: 'Travel together',
    description: 'Meet at the pickup point. Pay on arrival.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* App bar */}
      <header className="appbar sticky top-0 z-30">
        <img
          src="/logo-wordmark.png"
          alt="TripMoja"
          style={{ height: 28, marginLeft: -6 }}
        />
        <span className="flex-1" />
        <Link href="/login">
          <Button variant="ghost" size="sm">Log in</Button>
        </Link>
      </header>

      {/* Hero band */}
      <section className="hero-band relative overflow-hidden">
        <Blob color="blue"   size={140} top={-40}  left={-30} opacity={0.25} />
        <Blob color="orange" size={100} bottom={-30} right={-20} opacity={0.35} />
        <div className="relative z-10">
          <h1 className="tm-display" style={{ fontSize: 28 }}>
            Need a seat to Nairobi today?
          </h1>
          <p className="text-[14px] text-tm-ink-700 my-3 leading-relaxed">
            Nanyuki ↔ Nairobi rides, posted by drivers in your community.
          </p>

          {/* Search card */}
          <div className="card p-3 grid gap-2">
            <div className="input-field">
              <Icon name="map-pin" size={16} color="var(--tm-blue)" />
              <span className="text-[14px]">Nanyuki</span>
            </div>
            <div className="input-field">
              <Icon name="map-pin" size={16} color="var(--tm-orange)" />
              <span className="text-[14px]">Nairobi</span>
            </div>
            <div className="input-field">
              <Icon name="calendar" size={16} color="var(--tm-ink-500)" />
              <span className="text-[14px] flex-1">Sun, 17 May</span>
              <Icon name="chevron-down" size={16} color="var(--tm-ink-500)" />
            </div>
            <Link href="/trips">
              <Button variant="primary" full icon="search">See today&apos;s trips</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-6">
        <h2 className="tm-h2 mb-4">How it works</h2>
        <div className="grid gap-3.5">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.icon} className="flex gap-3.5 items-start">
              <span
                className="w-11 h-11 flex-none flex items-center justify-center"
                style={{
                  borderRadius: 12,
                  background: 'var(--tm-blue-100)',
                }}
              >
                <Icon name={step.icon} size={22} color="var(--tm-blue)" />
              </span>
              <div>
                <div className="text-[15px] font-semibold">{step.title}</div>
                <div className="text-[13px] text-tm-ink-500 mt-0.5">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Today's trips */}
      <section className="px-4 pb-6">
        <h2 className="tm-h2 mb-3">Today's trips</h2>
        <div className="grid gap-3">
          {MOCK_TRIPS.slice(0, 2).map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <TripCard trip={trip} />
            </Link>
          ))}
        </div>
      </section>

      {/* Driver CTA card */}
      <section className="px-4 pb-24">
        <div
          className="card relative overflow-hidden flex flex-col gap-2.5"
          style={{ background: 'var(--tm-ink)', color: '#fff' }}
        >
          <Blob color="blue" size={140} top={-60} right={-40} opacity={0.25} />
          <span className="tm-label" style={{ color: 'var(--tm-orange)' }}>
            Become a driver
          </span>
          <span className="text-[18px] font-semibold">Drive on your terms</span>
          <span className="text-[13px] opacity-80">
            Set your price. Pick your passengers. Make every drive count.
          </span>
          <Link href="/trips/new">
            <Button variant="warm" full>Post a trip</Button>
          </Link>
        </div>
      </section>

      <BottomNav />
    </div>
  )
}
