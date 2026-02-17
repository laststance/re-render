import { cn } from '@/lib/utils'
import { ComponentBox } from './ComponentBox'
import type { ComponentNode } from '@/types'
import type { ComponentBoxVariant } from './ComponentBox'

interface ComponentBoxViewProps {
  /** Root component node(s) to render */
  tree: ComponentNode | ComponentNode[]
  /** Visual variant: 'child' (orange) or 'memoized' (blue) */
  variant?: ComponentBoxVariant
  className?: string
}

/**
 * Container component that renders the component tree as nested boxes.
 * Accepts either a single root node or an array of root nodes.
 * Passes variant down to all ComponentBox nodes for consistent color theming.
 * @example
 * <ComponentBoxView tree={liveTree} variant="child" />
 * <ComponentBoxView tree={memoizedTree} variant="memoized" />
 */
export function ComponentBoxView({ tree, variant = 'child', className }: ComponentBoxViewProps) {
  const roots = Array.isArray(tree) ? tree : [tree]

  if (roots.length === 0) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <p className="text-sm text-muted-foreground">No components to display</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {roots.map((root) => (
        <ComponentBox key={root.id} node={root} depth={0} variant={variant} />
      ))}
    </div>
  )
}
