import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { Toast as ToastType } from '@/store'
import type { RenderReason, ChangedValue } from '@/types'

interface ToastProps {
  toast: ToastType
  onDismiss: () => void
  onToggleExpand: () => void
  /** Auto-dismiss delay in ms (default: 5000) */
  dismissDelay?: number
}

/**
 * Mapping of render reasons to human-readable explanations
 */
const REASON_EXPLANATIONS: Record<RenderReason, string> = {
  initial: 'This was the first render of the component.',
  'props-change': 'One or more props passed to this component changed.',
  'state-change': 'The component\'s internal state was updated.',
  'context-change': 'A React context value this component consumes changed.',
  'parent-rerender': 'The parent component re-rendered, causing this component to re-render.',
  'force-update': 'A force update was triggered on this component.',
}

/**
 * Mapping of render reasons to display labels
 */
const REASON_LABELS: Record<RenderReason, string> = {
  initial: 'Initial Render',
  'props-change': 'Props Changed',
  'state-change': 'State Changed',
  'context-change': 'Context Changed',
  'parent-rerender': 'Parent Re-rendered',
  'force-update': 'Force Update',
}

/**
 * Detailed React mechanism explanations for each re-render cause
 */
const REACT_MECHANISMS: Record<RenderReason, string> = {
  initial: 'React calls the component function for the first time to build the initial virtual DOM tree.',
  'props-change': 'When a parent passes new prop values, React detects the reference change and schedules a re-render. Use React.memo() to skip re-renders when props are shallowly equal.',
  'state-change': 'Calling setState/useState setter enqueues a state update. React batches updates and re-renders the component with the new state.',
  'context-change': 'Context.Provider value changed → all consuming components re-render. Consider splitting contexts or memoizing values to reduce scope.',
  'parent-rerender': 'Without React.memo(), a component re-renders whenever its parent renders, even if props haven\'t changed. This is React\'s default behavior.',
  'force-update': 'Key prop change unmounts/remounts the component. useReducer dispatch or forceUpdate() bypasses normal comparison.',
}

/**
 * Renders a single changed value with previous → current comparison
 */
function ChangedValueRow({ change }: { change: ChangedValue }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span className="font-mono text-xs font-medium text-foreground shrink-0">
        {change.key}:
      </span>
      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
        <code className="font-mono text-xs bg-destructive/10 text-destructive px-1 py-0.5 rounded truncate max-w-[100px]">
          {change.previousValue}
        </code>
        <span className="text-muted-foreground text-xs">→</span>
        <code className="font-mono text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-1 py-0.5 rounded truncate max-w-[100px]">
          {change.currentValue}
        </code>
      </div>
    </div>
  )
}

/**
 * Toast notification showing re-render details
 */
export function Toast({
  toast,
  onDismiss,
  onToggleExpand,
  dismissDelay = 5000,
}: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { renderInfo, isExpanded } = toast

  // Auto-dismiss after delay
  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, dismissDelay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [onDismiss, dismissDelay])

  // Pause auto-dismiss when expanded
  useEffect(() => {
    if (isExpanded && timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    } else if (!isExpanded && !timerRef.current) {
      timerRef.current = setTimeout(onDismiss, dismissDelay)
    }
  }, [isExpanded, onDismiss, dismissDelay])

  const hasPropChanges = renderInfo.propChanges && renderInfo.propChanges.length > 0
  const hasStateChanges = renderInfo.stateChanges && renderInfo.stateChanges.length > 0
  const hasDetailedChanges = hasPropChanges || hasStateChanges

  return (
    <div
      className={cn(
        'animate-toast-slide-in',
        'w-80 rounded-lg border bg-card text-card-foreground shadow-lg',
        'transition-all duration-200 ease-out',
        isExpanded && 'ring-2 ring-ring'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Header - Always visible */}
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Flash indicator */}
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: 'var(--flash-color)' }}
            aria-hidden="true"
          />

          {/* Component name */}
          <span className="font-medium truncate">
            {renderInfo.componentName}
          </span>

          {/* Re-render count badge */}
          <span
            className={cn(
              'inline-flex items-center justify-center',
              'rounded-full px-2 py-0.5 text-xs font-medium',
              'bg-secondary text-secondary-foreground'
            )}
          >
            #{renderInfo.renderCount}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Expand/collapse button */}
          <button
            type="button"
            onClick={onToggleExpand}
            className={cn(
              'inline-flex items-center justify-center',
              'h-6 w-6 rounded-md text-muted-foreground',
              'hover:bg-secondary hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            <svg
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              'inline-flex items-center justify-center',
              'h-6 w-6 rounded-md text-muted-foreground',
              'hover:bg-secondary hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            aria-label="Dismiss notification"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Reason label - Always visible */}
      <div className="px-3 pb-2">
        <span className="text-sm text-muted-foreground">
          {REASON_LABELS[renderInfo.reason]}
        </span>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t px-3 py-2 space-y-3 text-sm">
          {/* What happened explanation */}
          <div>
            <p className="text-muted-foreground">
              {REASON_EXPLANATIONS[renderInfo.reason]}
            </p>
          </div>

          {/* Detailed prop changes with values */}
          {hasPropChanges && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Props Changed</span>
                <span className="text-xs text-muted-foreground">
                  ({renderInfo.propChanges!.length})
                </span>
              </div>
              <div className="bg-secondary/30 rounded-md px-2 py-1">
                {renderInfo.propChanges!.map((change) => (
                  <ChangedValueRow key={change.key} change={change} />
                ))}
              </div>
            </div>
          )}

          {/* Detailed state changes with values */}
          {hasStateChanges && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">State Changed</span>
                <span className="text-xs text-muted-foreground">
                  ({renderInfo.stateChanges!.length})
                </span>
              </div>
              <div className="bg-secondary/30 rounded-md px-2 py-1">
                {renderInfo.stateChanges!.map((change) => (
                  <ChangedValueRow key={change.key} change={change} />
                ))}
              </div>
            </div>
          )}

          {/* React mechanism explanation */}
          <div className="border-t border-border/50 pt-2">
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-primary shrink-0">⚛ React:</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {REACT_MECHANISMS[renderInfo.reason]}
              </p>
            </div>
          </div>

          {/* Debug info for parent re-renders without detected changes */}
          {renderInfo.reason === 'parent-rerender' && !hasDetailedChanges && (
            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs rounded-md px-2 py-1.5">
              <span className="font-medium">💡 Tip:</span> Wrap this component with{' '}
              <code className="font-mono bg-amber-500/20 px-1 rounded">React.memo()</code>{' '}
              to prevent unnecessary re-renders when props haven't changed.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
