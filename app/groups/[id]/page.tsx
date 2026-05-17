'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AppBar } from '@/components/brand/app-bar'
import { BottomNav } from '@/components/brand/bottom-nav'
import { Blob } from '@/components/brand/blob'
import { Avatar } from '@/components/brand/avatar'
import { TripCard } from '@/components/brand/trip-card'
import { Pill } from '@/components/brand/pill'
import { Button } from '@/components/brand/button'
import { Icon } from '@/components/brand/icon'
import { MOCK_TRIPS, MOCK_GROUPS, MOCK_MEMBERS } from '@/lib/mock-data'

const AVATAR_OVERLAP = ['AW', 'PM', 'JK', 'SN', '+43'] as const
const AVATAR_COLORS  = ['#7697F5', '#EF9B5B', '#4FBA88', '#3B3B55', undefined] as const

interface Params {
  id: string
}

export default function GroupDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params)
  const group = MOCK_GROUPS.find((g) => g.id === id)
  if (!group) notFound()

  const [tab, setTab] = useState<'trips' | 'members'>('trips')

  return (
    <div className="min-h-screen flex flex-col">
      <AppBar
        transparent
        right={
          <span className="iconbtn">
            <Icon name="settings" size={20} color="var(--tm-ink)" />
          </span>
        }
      />

      <div className="px-4 pb-4">
        {/* Group banner */}
        <div
          className="h-[120px] relative overflow-hidden"
          style={{
            borderRadius: 20,
            background: `linear-gradient(135deg, ${group.color}, var(--tm-green))`,
          }}
        >
          <Blob color="green"  size={140} top={-60}  right={-30} opacity={0.4} />
          <Blob color="orange" size={100} bottom={-30} left={-20} opacity={0.45} />
        </div>

        {/* Group icon */}
        <span
          className="w-[72px] h-[72px] flex items-center justify-center text-[32px] bg-white"
          style={{
            borderRadius: 20,
            boxShadow: 'var(--sh-card)',
            marginTop: -36,
            marginLeft: 16,
            display: 'flex',
          }}
        >
          {group.emoji}
        </span>

        <h1 className="tm-h1 mt-3 mb-1">{group.name}</h1>
        <div className="flex items-center gap-2 text-[13px] text-tm-ink-500">
          <Icon name="users-round" size={14} color="var(--tm-ink-500)" />
          {group.members} members
          <span>·</span>
          <Icon name="lock" size={12} color="var(--tm-ink-500)" />
          Invite only
        </div>

        {/* Avatar stack */}
        <div className="flex mt-3 mb-2">
          {AVATAR_OVERLAP.map((label, i) => (
            <span
              key={i}
              className="w-7 h-7 flex items-center justify-center text-[10px] font-semibold border-2 border-tm-surface"
              style={{
                borderRadius: 999,
                marginLeft: i === 0 ? 0 : -8,
                background: AVATAR_COLORS[i] ?? 'var(--tm-blue-100)',
                color: i === 4 ? 'var(--tm-blue)' : '#fff',
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs mt-3">
          <div
            className={`tab ${tab === 'trips' ? 'active' : ''}`}
            onClick={() => setTab('trips')}
          >
            Trips · {MOCK_TRIPS.length}
          </div>
          <div
            className={`tab ${tab === 'members' ? 'active' : ''}`}
            onClick={() => setTab('members')}
          >
            Members
          </div>
        </div>
      </div>

      {/* Tab content */}
      {tab === 'trips' && (
        <div className="px-4 pb-24 grid gap-3">
          {MOCK_TRIPS.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <TripCard trip={trip} />
            </Link>
          ))}
        </div>
      )}

      {tab === 'members' && (
        <div className="px-4 pb-24">
          <div className="card p-0 overflow-hidden">
            {MOCK_MEMBERS.map((member) => (
              <div key={member.id} className="member-row px-4">
                <Avatar
                  initials={member.initials}
                  color={member.avatarColor}
                  verified={member.verified}
                />
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">{member.name}</div>
                  <div className="text-[12px] text-tm-ink-500">{member.role}</div>
                </div>
                {member.role.startsWith('Admin') && (
                  <Pill kind="tint">ADMIN</Pill>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="secondary" full icon="user-plus">
              Invite members
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
