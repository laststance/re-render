import { cn } from '@/lib/utils'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface TriggerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon to display before the label */
  icon?: ReactNode
  /** Button label text */
  label: string
  /** Optional description shown below the label */
  description?: string
  /** Visual variant */
  variant?: 'default' | 'state' | 'props' | 'parent' | 'context' | 'force'
}

const variantStyles: Record<string, string> = {
  default: 'border-border hover:border-primary/50 hover:bg-primary/5 active:bg-primary/10',
  state: 'border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/5 active:bg-blue-500/15',
  props: 'border-green-500/30 hover:border-green-500/60 hover:bg-green-500/5 active:bg-green-500/15',
  parent: 'border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/5 active:bg-purple-500/15',
  context: 'border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/5 active:bg-amber-500/15',
  force: 'border-red-500/30 hover:border-red-500/60 hover:bg-red-500/5 active:bg-red-500/15',
}

const variantIconStyles: Record<string, string> = {
  default: 'text-muted-foreground group-hover:text-primary',
  state: 'text-blue-500/70 group-hover:text-blue-500',
  props: 'text-green-500/70 group-hover:text-green-500',
  parent: 'text-purple-500/70 group-hover:text-purple-500',
  context: 'text-amber-500/70 group-hover:text-amber-500',
  force: 'text-red-500/70 group-hover:text-red-500',
}

/**
 * Button component for triggering specific re-render conditions.
 * Provides visual feedback on hover and press states.
 * Minimum 44px tap target per Apple HIG.
 */
export function TriggerButton({
  icon,
  label,
  description,
  variant = 'default',
  className,
  disabled,
  ...props
}: TriggerButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'group relative flex min-h-[44px] w-full items-center gap-3',
        'rounded-lg border bg-card px-3 py-2',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        // Active state: scale down slightly + shadow for press feedback
        'active:scale-[0.98] active:shadow-inner',
        variantStyles[variant],
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      {...props}
    >
      {/* Icon */}
      {icon && (
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 transition-colors',
            variantIconStyles[variant]
          )}
        >
          {icon}
        </span>
      )}

      {/* Label and description */}
      <div className="flex flex-col items-start text-left">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
    </button>
  )
}
