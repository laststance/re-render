import { useState, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LivePreviewContext } from './LivePreviewContext'

interface LivePreviewProps {
  /** The preview content to render */
  children: ReactNode
  /** Additional class names */
  className?: string
}

/**
 * Container for live component preview with overlay toggle.
 *
 * Provides:
 * - Toggle button to show/hide component boundary overlays
 * - Isolated rendering environment for preview UI
 * - Passes `showOverlays` via context for children to read
 */
export function LivePreview({ children, className }: LivePreviewProps) {
  const [showOverlays, setShowOverlays] = useState(true)

  return (
    <div className={cn('relative flex h-full flex-col', className)}>
      {/* Header with toggle */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-sm font-medium text-muted-foreground">
          Live Preview
        </span>

        {/* Overlay toggle button */}
        <button
          type="button"
          onClick={() => setShowOverlays(!showOverlays)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
            'min-h-[44px] min-w-[44px] touch-manipulation', // Apple HIG tap target
            showOverlays
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
          aria-pressed={showOverlays}
          aria-label={showOverlays ? 'Hide component overlays' : 'Show component overlays'}
        >
          {showOverlays ? (
            <>
              <Eye className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Overlays</span>
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Overlays</span>
            </>
          )}
        </button>
      </div>

      {/* Preview area with padding for labels */}
      <div
        className="flex-1 overflow-auto p-6 pt-8"
        data-show-overlays={showOverlays}
      >
        <LivePreviewContext.Provider value={{ showOverlays }}>
          {children}
        </LivePreviewContext.Provider>
      </div>
    </div>
  )
}
