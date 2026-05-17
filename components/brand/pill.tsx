import { cn } from '@/lib/utils'
import { Icon } from './icon'

type PillKind = 'open' | 'full' | 'cancel' | 'done' | 'tint' | 'type'

interface PillProps {
  kind?: PillKind
  icon?: string
  children?: React.ReactNode
  className?: string
}

const base =
  'inline-flex items-center gap-1 rounded-full text-[11px] font-semibold px-2.5 py-1 whitespace-nowrap tracking-wide'

const kinds: Record<PillKind, string> = {
  open:   'bg-tm-green text-tm-ink',
  full:   'bg-tm-error text-white',
  cancel: 'bg-tm-border text-tm-ink-500',
  done:   'bg-tm-green-700/10 text-tm-green-700',
  tint:   'bg-tm-blue-050 text-tm-blue',
  type:   'bg-tm-blue-050 text-tm-blue uppercase tracking-widest',
}

export function Pill({ kind = 'open', icon, children, className }: PillProps) {
  return (
    <span className={cn(base, kinds[kind], className)}>
      {icon && <Icon name={icon} size={11} color="currentColor" />}
      {children}
    </span>
  )
}
