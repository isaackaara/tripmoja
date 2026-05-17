'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Icon } from './icon'

type TabId = 'feed' | 'post' | 'me'

interface Tab {
  id: TabId
  icon: string
  label: string
  href: string
}

const TABS: Tab[] = [
  { id: 'feed', icon: 'layers',      label: 'Feed', href: '/trips' },
  { id: 'post', icon: 'plus-circle', label: 'Post', href: '/trips/new' },
  { id: 'me',   icon: 'user-round',  label: 'Me',   href: '/profile' },
]

function getActiveTab(pathname: string): TabId {
  if (pathname.startsWith('/trips/new')) return 'post'
  if (pathname.startsWith('/trips'))     return 'feed'
  if (pathname.startsWith('/profile'))   return 'me'
  return 'feed'
}

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const active = getActiveTab(pathname)

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const isActive = active === tab.id
        return (
          <div
            key={tab.id}
            className={`tab ${isActive ? 'active' : ''}`}
            onClick={() => router.push(tab.href)}
            aria-label={tab.label}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={isActive ? 'var(--tm-blue)' : 'var(--tm-ink-300)'}
            />
            {tab.label}
          </div>
        )
      })}
    </nav>
  )
}
