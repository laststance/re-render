import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useRenderTracker } from '@/hooks'
import { useLivePreview } from './LivePreviewContext'

interface LivePreviewWrapperProps {
  /** The component name to display in the overlay label */
  componentName: string
  /** Child elements to wrap */
  children: ReactNode
  /** Additional class names */
  className?: string
}

/**
 * Wraps a component with hover-activated boundary overlays and render tracking.
 *
 * - Tracks re-renders via useRenderTracker, dispatching events to Redux store
 *   so that Toast notifications and visualizations reflect live preview activity.
 * - Shows dashed border and component name label on hover.
 * - Reads showOverlays from LivePreview context to toggle overlay visibility.
 */
export function LivePreviewWrapper({
  componentName,
  children,
  className,
}: LivePreviewWrapperProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { showOverlays } = useLivePreview()

  // Track re-renders for this wrapper so Toast notifications fire
  useRenderTracker(componentName)

  // When overlays are disabled, just render children directly
  if (!showOverlays) {
    return <>{children}</>
  }

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-component={componentName}
    >
      {/* Overlay border - appears on hover */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-sm border-2 border-dashed transition-opacity duration-150',
          isHovered
            ? 'border-primary/70 opacity-100'
            : 'border-transparent opacity-0'
        )}
        aria-hidden="true"
      />

      {/* Component name label - appears on hover */}
      <div
        className={cn(
          'pointer-events-none absolute -top-6 left-0 z-10 rounded-t px-2 py-0.5 text-xs font-medium transition-opacity duration-150',
          'bg-primary text-primary-foreground',
          isHovered ? 'opacity-100' : 'opacity-0'
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
