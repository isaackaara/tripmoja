import { cn } from '@/lib/utils'

interface BlobProps {
  color?: 'blue' | 'orange' | 'green' | 'ink'
  size?: number
  top?: number | string
  left?: number | string
  right?: number | string
  bottom?: number | string
  opacity?: number
  className?: string
}

const colorMap: Record<string, string> = {
  blue:   'var(--tm-blue)',
  orange: 'var(--tm-orange)',
  green:  'var(--tm-green)',
  ink:    'var(--tm-ink)',
}

export function Blob({
  color = 'green',
  size = 180,
  top,
  left,
  right,
  bottom,
  opacity = 1,
  className,
}: BlobProps) {
  return (
    <div
      className={cn('absolute rounded-full pointer-events-none', className)}
      style={{
        width: size,
        height: size,
        background: colorMap[color] ?? colorMap.green,
        top: top !== undefined ? top : undefined,
        left: left !== undefined ? left : undefined,
        right: right !== undefined ? right : undefined,
        bottom: bottom !== undefined ? bottom : undefined,
        opacity,
      }}
    />
  )
}
