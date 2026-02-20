import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { REASON_LABELS, REASON_EXPLANATIONS, REACT_MECHANISMS } from '@/data/renderReasonLabels'
import type { Toast as ToastType } from '@/store'
import type { RenderInfo, RenderReason, ChangedValue } from '@/types'

interface ToastProps {
  toast: ToastType
  onDismiss: () => void
  onToggleExpand: () => void
  /** Auto-dismiss delay in ms (default: 10000) */
  dismissDelay?: number
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
 * Groups render events by reason and returns a summary string.
 * @param renders - Array of render events to summarize
 * @returns Summary like "State Changed (1), Parent Re-rendered (3)"
 * @example
 * groupReasonSummary([stateRender, parentRender1, parentRender2])
 * // => "State Changed (1), Parent Re-rendered (2)"
 */
function groupReasonSummary(renders: RenderInfo[]): string {
  const counts = new Map<RenderReason, number>()
  for (const r of renders) {
    counts.set(r.reason, (counts.get(r.reason) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([reason, count]) => `${REASON_LABELS[reason]} (${count})`)
    .join(', ')
}

/**
 * Expanded row for a single render event within a batch toast
 */
function BatchRenderRow({ render }: { render: RenderInfo }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: 'var(--flash-color)' }}
          aria-hidden="true"
        />
        <span className="text-sm font-medium truncate">{render.componentName}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground">
          {REASON_LABELS[render.reason]}
        </span>
        <span className="inline-flex items-center justify-center rounded-full bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
          #{render.renderCount}
        </span>
      </div>
    </div>
  )
}

/**
 * Toast notification showing re-render details.
 * Supports both single-render and batch-render modes.
 */
export function Toast({
  toast,
  onDismiss,
  onToggleExpand,
  dismissDelay = 10000,
}: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { renderInfo, batchRenders, isExpanded } = toast
  const isBatch = batchRenders && batchRenders.length > 1

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

  if (isBatch) {
    return (
      <BatchToastView
        batchRenders={batchRenders}
        isExpanded={isExpanded}
        onDismiss={onDismiss}
        onToggleExpand={onToggleExpand}
      />
    )
  }

  return (
    <SingleToastView
      renderInfo={renderInfo}
      isExpanded={isExpanded}
      onDismiss={onDismiss}
      onToggleExpand={onToggleExpand}
    />
  )
}

/**
 * Toast view for a single re-render event
 */
function SingleToastView({
  renderInfo,
  isExpanded,
  onDismiss,
  onToggleExpand,
}: {
  renderInfo: RenderInfo
  isExpanded: boolean
  onDismiss: () => void
  onToggleExpand: () => void
}) {
  const hasPropChanges = renderInfo.propChanges && renderInfo.propChanges.length > 0
  const hasStateChanges = renderInfo.stateChanges && renderInfo.stateChanges.length > 0
  const hasDetailedChanges = hasPropChanges || hasStateChanges

  return (
    <div
      className={cn(
        'pointer-events-auto animate-toast-slide-in',
        'w-80 rounded-lg border bg-card text-card-foreground shadow-lg',
        'transition-all duration-200 ease-out',
        isExpanded && 'ring-2 ring-ring'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: 'var(--flash-color)' }}
            aria-hidden="true"
          />
          <span className="font-medium truncate">
            {renderInfo.componentName}
          </span>
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
        <ToastActions
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          onDismiss={onDismiss}
        />
      </div>

      {/* Reason label */}
      <div className="px-3 pb-2">
        <span className="text-sm text-muted-foreground">
          {REASON_LABELS[renderInfo.reason]}
        </span>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t px-3 py-2 space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">
              {REASON_EXPLANATIONS[renderInfo.reason]}
            </p>
          </div>

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

          <div className="border-t border-border/50 pt-2">
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-primary shrink-0">⚛ React:</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {REACT_MECHANISMS[renderInfo.reason]}
              </p>
            </div>
          </div>

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

/**
 * Toast view for a batch of re-render events triggered together
 */
function BatchToastView({
  batchRenders,
  isExpanded,
  onDismiss,
  onToggleExpand,
}: {
  batchRenders: RenderInfo[]
  isExpanded: boolean
  onDismiss: () => void
  onToggleExpand: () => void
}) {
  return (
    <div
      className={cn(
        'pointer-events-auto animate-toast-slide-in',
        'w-80 rounded-lg border bg-card text-card-foreground shadow-lg',
        'transition-all duration-200 ease-out',
        isExpanded && 'ring-2 ring-ring'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: 'var(--flash-color)' }}
            aria-hidden="true"
          />
          <span className="font-medium truncate">
            {batchRenders.length} components re-rendered
          </span>
        </div>
        <ToastActions
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          onDismiss={onDismiss}
        />
      </div>

      {/* Reason summary */}
      <div className="px-3 pb-2">
        <span className="text-sm text-muted-foreground">
          {groupReasonSummary(batchRenders)}
        </span>
      </div>

      {/* Expanded: per-component details */}
      {isExpanded && (
        <div className="border-t px-3 py-2 space-y-1">
          {batchRenders.map((render) => (
            <BatchRenderRow key={render.id} render={render} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Shared expand/collapse + dismiss button group
 */
function ToastActions({
  isExpanded,
  onToggleExpand,
  onDismiss,
}: {
  isExpanded: boolean
  onToggleExpand: () => void
  onDismiss: () => void
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={onToggleExpand}
        className={cn(
          'inline-flex items-center justify-center',
          'min-h-[44px] min-w-[44px] -m-2 rounded-md text-muted-foreground',
          'hover:bg-secondary hover:text-foreground',
          'active:scale-[0.98]',
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

      <button
        type="button"
        onClick={onDismiss}
        className={cn(
          'inline-flex items-center justify-center',
          'min-h-[44px] min-w-[44px] -m-2 rounded-md text-muted-foreground',
          'hover:bg-secondary hover:text-foreground',
          'active:scale-[0.98]',
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
  )
}
