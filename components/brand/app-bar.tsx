'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icon } from './icon'

interface AppBarProps {
  title?: string
  onBack?: (() => void) | true
  right?: React.ReactNode
  transparent?: boolean
  logo?: boolean
  className?: string
}

export function AppBar({ title, onBack, right, transparent, logo, className }: AppBarProps) {
  const router = useRouter()
  const handleBack = onBack === true ? () => router.back() : onBack

  return (
    <header className={cn('appbar', transparent && 'transparent', className)}>
      {handleBack && (
        <button
          className="iconbtn"
          onClick={handleBack}
          aria-label="Go back"
        >
          <Icon name="arrow-left" size={22} color="var(--tm-ink)" />
        </button>
      )}
      {logo ? (
        <>
          <img
            src="/logo-wordmark.png"
            alt="TripMoja"
            style={{ height: 28, marginLeft: -6 }}
          />
          <span className="flex-1" />
        </>
      ) : (
        <span className="flex-1 text-[17px] font-semibold text-tm-ink truncate">{title}</span>
      )}
      {right}
    </header>
  )
}
