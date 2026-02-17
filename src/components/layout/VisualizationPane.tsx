import { cn } from '@/lib/utils'
import { Boxes, Play } from 'lucide-react'
import type { ReactNode } from 'react'
import { ResetButton } from '@/components/ui'

type ViewMode = 'box' | 'live'

interface VisualizationPaneProps {
  /** Current view mode */
  viewMode?: ViewMode
  /** Callback when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void
  /** Whether live preview is available for this example */
  hasLivePreview?: boolean
  children?: ReactNode
  className?: string
}

/**
 * Container for component visualization (Box View or Live Preview)
 * Provides consistent padding, background styling, and view toggle
 */
export function VisualizationPane({
  viewMode = 'box',
  onViewModeChange,
  hasLivePreview = false,
  children,
  className,
}: VisualizationPaneProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col bg-card',
        'overflow-auto',
        className
      )}
    >
      {/* Header with view toggle and reset button */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            {viewMode === 'box' ? 'Component Tree' : 'Live Preview'}
          </span>
          <ResetButton />
        </div>

        {/* View mode toggle - only show when live preview is available */}
        {hasLivePreview && onViewModeChange && (
          <div className="flex rounded-md bg-muted p-0.5" role="tablist" aria-label="View mode">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'box'}
              onClick={() => onViewModeChange('box')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
                'min-h-[36px] touch-manipulation', // Slightly smaller but still accessible
                viewMode === 'box'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Tree</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'live'}
              onClick={() => onViewModeChange('live')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
                'min-h-[36px] touch-manipulation',
                viewMode === 'live'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Live</span>
            </button>
          </div>
        )}
      </div>

      {/* Visualization content area */}
      <div
        className="flex-1 p-4"
      >
        {children ?? (
          <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted">
            <p className="text-muted-foreground">
              Component visualization will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export type { ViewMode }
