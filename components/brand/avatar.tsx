import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { AvatarColor } from '@/types'

interface AvatarProps {
  initials: string
  color?: AvatarColor
  size?: 'sm' | 'md' | 'lg'
  verified?: boolean
  className?: string
}

const gradients: Record<AvatarColor, string> = {
  blue:   'linear-gradient(135deg, #7697F5, #9CF1C4)',
  orange: 'linear-gradient(135deg, #EF9B5B, #FCE5D2)',
  ink:    'linear-gradient(135deg, #3B3B55, #6B6B85)',
  green:  'linear-gradient(135deg, #9CF1C4, #4FBA88)',
}

const sizeCls: Record<string, string> = {
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-[13px]',
  lg: 'w-12 h-12 text-[16px]',
}

const badgeSize: Record<string, number> = {
  sm: 10,
  md: 12,
  lg: 14,
}

export function Avatar({
  initials,
  color = 'blue',
  size = 'md',
  verified,
  className,
}: AvatarProps) {
  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center rounded-full font-semibold text-white flex-none',
        sizeCls[size],
        className,
      )}
      style={{ background: gradients[color] }}
    >
      {initials}
      {verified && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-tm-blue flex items-center justify-center"
          style={{ width: badgeSize[size] + 4, height: badgeSize[size] + 4 }}
        >
          <Check size={badgeSize[size]} color="#fff" strokeWidth={2.5} />
        </span>
      )}
    </span>
  )
}
