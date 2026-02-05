import { useFlashOnChange } from '@/hooks'
import { cn } from '@/lib/utils'
import type { ComponentNode } from '@/types'

interface ComponentBoxProps {
  node: ComponentNode
  /** Nesting depth for visual hierarchy (indentation) */
  depth?: number
  className?: string
}

/**
 * Renders a single component as a nested box with name label and re-render count badge
 *
 * Visual design:
 * - Rounded border with subtle background
 * - Component name displayed at top-left
 * - Re-render count badge at top-right (orange when > 0)
 * - Children rendered recursively inside with increasing depth
 * - Flash animation (300ms orange glow) triggers on re-render
 */
export function ComponentBox({ node, depth = 0, className }: ComponentBoxProps) {
  const hasChildren = node.children && node.children.length > 0
  const hasReRenders = node.renderCount > 0
  // Key changes when renderCount changes, triggering CSS animation restart
  const flashKey = useFlashOnChange(node.renderCount)

  return (
    <div
      // The key forces re-mount which restarts the CSS animation
      key={flashKey}
      className={cn(
        'relative rounded-lg border-2 border-border bg-card/50',
        'transition-colors duration-150',
        depth === 0 && 'border-primary/60',
        // Only apply animation class when there have been re-renders
        hasReRenders && 'animate-flash',
        className
      )}
      data-component={node.name}
      data-render-count={node.renderCount}
    >
      {/* Header: Component name + Re-render badge */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-1.5">
        <span
          className={cn(
            'text-sm font-medium',
            depth === 0 ? 'text-primary' : 'text-foreground'
          )}
        >
          {node.name}
        </span>

        {/* Re-render count badge */}
        <span
          className={cn(
            'inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium',
            hasReRenders
              ? 'bg-[var(--flash-color)] text-white'
              : 'bg-muted text-muted-foreground'
          )}
          aria-label={`Render count: ${node.renderCount}`}
        >
          {node.renderCount}
        </span>
      </div>

      {/* Children container */}
      {hasChildren && (
        <div className="flex flex-col gap-2 p-2">
          {node.children!.map((child) => (
            <ComponentBox key={child.id} node={child} depth={depth + 1} />
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
