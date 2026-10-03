import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useRenderTracker } from '@/hooks'
import type { TrackableDeps } from '@/types'

interface LivePreviewWrapperProps {
  /** The component name to display in the overlay label */
  componentName: string
  /** Child elements to wrap */
  children: ReactNode
  /** Additional class names */
  className?: string
  /** Optional dependencies to track for render reason detection (props and/or state) */
  deps?: TrackableDeps
}

/**
 * Wraps a component with hover-activated boundary overlays and render tracking.
 *
 * - Tracks re-renders via useRenderTracker, dispatching events to Redux store
 *   so that Toast notifications and visualizations reflect live preview activity.
 * - Shows dashed border and component name label on hover (CSS-only to avoid
 *   triggering React re-renders on hover).
 * - Overlay visibility is gated by the ancestor `data-show-overlays`
 *   attribute (see {@link LivePreview}), so toggling overlays does not
 *   re-render this component — keeping render counts honest.
 */
export function LivePreviewWrapper({
  componentName,
  children,
  className,
  deps,
}: LivePreviewWrapperProps) {
  // Track re-renders for this wrapper so Toast notifications fire.
  // When deps is provided, render reason detection can identify
  // state-change/props-change instead of falling through to parent-rerender.
  useRenderTracker(componentName, deps)

  // Overlay variants fire only when an ancestor sets data-show-overlays="true".
  // The class names MUST be written as complete literals — Tailwind's static
  // extractor cannot see runtime-composed strings, so a `const gate + suffix`
  // pattern silently drops these rules from the generated CSS.
  return (
    <div
      className={cn('group/overlay relative', className)}
      data-component={componentName}
    >
      {/* Overlay border - appears on hover (CSS-only via group-hover) */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-sm border-2 border-dashed border-transparent opacity-0 transition-opacity duration-150',
          'group-data-[show-overlays=true]/preview:group-hover/overlay:border-primary/70',
          'group-data-[show-overlays=true]/preview:group-hover/overlay:opacity-100'
        )}
        aria-hidden="true"
      />

      {/* Component name label - appears on hover (CSS-only via group-hover) */}
      <div
        className={cn(
          'pointer-events-none absolute -top-6 left-0 z-10 rounded-t bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground opacity-0 transition-opacity duration-150',
          'group-data-[show-overlays=true]/preview:group-hover/overlay:opacity-100'
        )}
        aria-hidden="true"
      >
        {componentName}
      </div>

      {/* Actual component content */}
      {children}
    </div>
  )
}
