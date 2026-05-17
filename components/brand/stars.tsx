import { cn } from '@/lib/utils'

interface StarsProps {
  value?: number
  size?: number
  className?: string
}

export function Stars({ value = 5, size = 13, className }: StarsProps) {
  const filled = Math.round(value)
  return (
    <span
      className={cn('inline-flex items-center', className)}
      style={{ fontSize: size, lineHeight: 1 }}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{ color: i <= filled ? 'var(--tm-orange)' : 'var(--tm-border-strong)' }}
        >
          ★
        </span>
      ))}
    </span>
  )
}
