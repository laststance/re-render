import { useFlashOnChange } from '@/hooks'
import { cn } from '@/lib/utils'
import type { ComponentNode } from '@/types'

/**
 * Visual variant for the component tree.
 * - 'child': orange flash, default styling (without memo)
 * - 'memoized': blue flash, blue accents (with memo)
 */
export type ComponentBoxVariant = 'child' | 'memoized'

interface ComponentBoxProps {
  node: ComponentNode
  /** Nesting depth for visual hierarchy (indentation) */
  depth?: number
  /** Visual variant: 'child' (orange) or 'memoized' (blue) */
  variant?: ComponentBoxVariant
  className?: string
}

/**
 * Renders a single component as a nested box with name label and re-render count badge.
 * Supports two visual variants for the comparison view:
 * - 'child' variant: orange flash animation (default)
 * - 'memoized' variant: blue flash animation
 *
 * @example
 * <ComponentBox node={tree} variant="child" />     // orange flash
 * <ComponentBox node={tree} variant="memoized" />   // blue flash
 */
export function ComponentBox({
  node,
  depth = 0,
  variant = 'child',
  className,
}: ComponentBoxProps) {
  const hasChildren = node.children && node.children.length > 0
  const hasReRenders = node.renderCount > 0
  // Key changes when renderCount changes, triggering CSS animation restart
  const flashKey = useFlashOnChange(node.renderCount)

  const isMemoized = variant === 'memoized'
  const flashColorVar = isMemoized ? '--flash-color-memo' : '--flash-color'
  const flashClass = isMemoized ? 'animate-flash-memo' : 'animate-flash'

  return (
    <div
      // The key forces re-mount which restarts the CSS animation
      key={flashKey}
      className={cn(
        'relative rounded-lg border-2 border-border bg-card/50',
        'transition-colors duration-150',
        depth === 0 && (isMemoized ? 'border-blue-500/60' : 'border-primary/60'),
        // Only apply animation class when there have been re-renders
        hasReRenders && flashClass,
        className
      )}
      data-component={node.name}
      data-render-count={node.renderCount}
      data-variant={variant}
    >
      {/* Header: Component name + Re-render badge */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-1.5">
        <span
          className={cn(
            'text-sm font-medium',
            depth === 0
              ? isMemoized ? 'text-blue-500' : 'text-primary'
              : 'text-foreground'
          )}
        >
          {node.name}
        </span>

        {/* Re-render count badge */}
        <span
          className={cn(
            'inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium',
            hasReRenders
              ? 'text-white'
              : 'bg-muted text-muted-foreground'
          )}
          style={hasReRenders ? { backgroundColor: `var(${flashColorVar})` } : undefined}
          aria-label={`Render count: ${node.renderCount}`}
        >
          {node.renderCount}
        </span>
      </div>

      {/* Children container */}
      {hasChildren && (
        <div className="flex flex-col gap-2 p-2">
          {node.children!.map((child) => (
            <ComponentBox
              key={child.id}
              node={child}
              depth={depth + 1}
              variant={variant}
            />
          ))}
        </div>
      )}

      {/* Empty state for leaf components */}
      {!hasChildren && (
        <div className="p-2">
          <div className="h-4 rounded bg-muted/30" />
        </div>
      )}
    </div>
  )
}
