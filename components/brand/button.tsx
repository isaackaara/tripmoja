import { cn } from '@/lib/utils'
import { Icon } from './icon'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warm'
type ButtonSize = 'sm' | 'md'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  icon?: string
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-all duration-[120ms] cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-tm-blue text-white hover:bg-tm-blue-700 focus-visible:ring-tm-blue shadow-press active:shadow-none',
  secondary:
    'bg-transparent text-tm-blue border-[1.5px] border-tm-blue hover:bg-tm-blue-050 focus-visible:ring-tm-blue',
  ghost:
    'bg-transparent text-tm-blue hover:bg-tm-blue-050 focus-visible:ring-tm-blue',
  danger:
    'bg-tm-error text-white hover:brightness-90 focus-visible:ring-tm-error shadow-press active:shadow-none',
  warm:
    'bg-tm-orange text-white hover:bg-tm-orange-700 focus-visible:ring-tm-orange shadow-press active:shadow-none',
}

const sizes: Record<ButtonSize, string> = {
  md: 'h-12 px-6 text-[15px]',
  sm: 'h-9 px-4 text-[13px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  icon,
  children,
  onClick,
  disabled,
  type = 'button',
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        full && 'w-full',
        className,
      )}
    >
      {icon && <Icon name={icon} size={18} color="currentColor" />}
      {children}
    </button>
  )
}
