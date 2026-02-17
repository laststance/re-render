import { useRef, useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { recordRender } from '@/store'
import type {
  RenderInfo,
  RenderReason,
  TrackableDeps,
  RenderTrackerResult,
  ChangedValue,
} from '@/types'

/**
 * Generate a unique ID for render events
 */
function generateRenderEventId(): string {
  return `render-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Determine the type category of a value for display purposes
 */
function getValueType(value: unknown): ChangedValue['valueType'] {
  if (value === undefined) return 'undefined'
  if (value === null) return 'primitive'
  if (typeof value === 'function') return 'function'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  return 'primitive'
}

/**
 * Serialize a value to a display string (with truncation for large values)
 */
function serializeValue(value: unknown, maxLength = 50): string {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'function') {
    const name = value.name || 'anonymous'
    return `ƒ ${name}()`
  }
  if (typeof value === 'string') {
    const truncated = value.length > maxLength ? value.slice(0, maxLength) + '…' : value
    return `"${truncated}"`
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    if (value.length <= 3) {
      const items = value.map((v) => serializeValue(v, 20)).join(', ')
      return `[${items}]`
    }
    return `[…${value.length} items]`
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 0) return '{}'
    if (keys.length <= 2) {
      const items = keys.map((k) => `${k}: ${serializeValue((value as Record<string, unknown>)[k], 15)}`).join(', ')
      return `{${items}}`
    }
    return `{…${keys.length} keys}`
  }
  return String(value)
}

/**
 * Shallow compare two objects and return the keys that differ
 */
function getChangedKeys(
  prev: Record<string, unknown> | undefined,
  current: Record<string, unknown> | undefined
): string[] {
  if (!prev || !current) return []

  const changedKeys: string[] = []
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(current)])

  for (const key of allKeys) {
    if (!Object.is(prev[key], current[key])) {
      changedKeys.push(key)
    }
  }

  return changedKeys
}

/**
 * Get detailed changes with previous/current values
 */
function getChangedValues(
  prev: Record<string, unknown> | undefined,
  current: Record<string, unknown> | undefined
): ChangedValue[] {
  if (!prev || !current) return []

  const changes: ChangedValue[] = []
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(current)])

  for (const key of allKeys) {
    const prevValue = prev[key]
    const currValue = current[key]
    if (!Object.is(prevValue, currValue)) {
      changes.push({
        key,
        previousValue: serializeValue(prevValue),
        currentValue: serializeValue(currValue),
        valueType: getValueType(currValue),
      })
    }
  }

  return changes
}

/**
 * Determine why a component re-rendered based on dependency changes
 */
function determineRenderReason(
  isInitialRender: boolean,
  changedProps: string[],
  changedState: string[],
  forceUpdate?: boolean
): RenderReason {
  if (isInitialRender) {
    return 'initial'
  }

  if (forceUpdate) {
    return 'force-update'
  }

  if (changedState.length > 0) {
    return 'state-change'
  }

  if (changedProps.length > 0) {
    return 'props-change'
  }

  // No props or state changed, but component still re-rendered
  // This happens when parent re-renders and component isn't memoized
  return 'parent-rerender'
}

/**
 * Hook that tracks and reports component re-renders.
 *
 * Detects initial render vs. re-renders and determines the reason
 * for re-rendering (props change, state change, parent re-render, etc.).
 *
 * Dispatches render events to the Redux store for visualization.
 *
 * @param componentName - Unique name for this component
 * @param deps - Optional dependencies to track (props and/or state)
 * @returns Object containing render count and current render info
 *
 * @example
 * ```tsx
 * function MyComponent(props: Props) {
 *   const [count, setCount] = useState(0)
 *
 *   const { renderCount, renderInfo } = useRenderTracker('MyComponent', {
 *     props,
 *     state: { count }
 *   })
 *
 *   return <div>Rendered {renderCount} times</div>
 * }
 * ```
 */
export function useRenderTracker(
  componentName: string,
  deps?: TrackableDeps
): RenderTrackerResult {
  const dispatch = useAppDispatch()

  // Track total render invocations — increments on EVERY React render including
  // cascade renders from Redux updates. Used solely as a useEffect dependency
  // to detect when a new render occurred.
  const renderCountRef = useRef(0)

  // Track meaningful (non-cascade) renders — this is the count users see.
  // Only incremented inside the dispatch callback, after confirming the render
  // is genuine (not a cascade artifact from our own Redux dispatch).
  const meaningfulCountRef = useRef(0)

  // Track previous props and state for comparison
  const prevDepsRef = useRef<TrackableDeps | undefined>(undefined)

  // Store the latest render info for deferred dispatch
  const pendingInfoRef = useRef<RenderInfo | null>(null)

  // Timer ref for debounced dispatch
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Tracks whether we have a dispatch in flight. When true, subsequent
  // 'parent-rerender' renders are cascade artifacts and should be skipped.
  const dispatchInFlightRef = useRef(false)

  // Holds the committed (first-render) reason within a StrictMode render batch.
  // StrictMode calls the render function twice. On the 1st call we detect the
  // correct reason (e.g. 'state-change') and capture it here. On the 2nd call,
  // prevDepsRef has already been updated so getChangedKeys returns [], giving us
  // 'parent-rerender'. We use this ref to preserve the 1st call's reason.
  // The ref is reset to null in useEffect after we consume it.
  const committedReasonRef = useRef<RenderReason | null>(null)
  const committedChangesRef = useRef<{
    changedProps: string[]
    changedState: string[]
    propChanges: ChangedValue[]
    stateChanges: ChangedValue[]
  } | null>(null)

  // Increment on every render for useEffect dependency tracking
  renderCountRef.current += 1
  const renderCount = renderCountRef.current

  // Determine if this is the initial render
  const isInitialRender = renderCount === 1

  // Calculate what changed since last render
  const changedProps = getChangedKeys(prevDepsRef.current?.props, deps?.props)
  const changedState = getChangedKeys(prevDepsRef.current?.state, deps?.state)

  // Get detailed changes with values
  const propChanges = getChangedValues(prevDepsRef.current?.props, deps?.props)
  const stateChanges = getChangedValues(prevDepsRef.current?.state, deps?.state)

  // Determine the reason for this render
  const rawReason = determineRenderReason(
    isInitialRender,
    changedProps,
    changedState
  )

  // StrictMode double-render fix: if rawReason detected real changes (not
  // parent-rerender), commit it. If rawReason is parent-rerender BUT we already
  // committed a better reason (from the 1st StrictMode render), keep the committed one.
  if (rawReason !== 'parent-rerender' || committedReasonRef.current === null) {
    committedReasonRef.current = rawReason
    committedChangesRef.current = { changedProps, changedState, propChanges, stateChanges }
  }
  const reason = committedReasonRef.current
  const changes = committedChangesRef.current!

  // Update previous deps for next render comparison.
  // This runs during the render phase so the next render sees correct baselines.
  //
  // Concurrent rendering note: if React aborts this render (e.g. due to
  // startTransition), prevDepsRef will already hold the new deps. When the
  // render retries, getChangedKeys returns [] and rawReason becomes
  // 'parent-rerender'. However, committedReasonRef still holds the correct
  // reason from the first (aborted) render attempt, so the final `reason`
  // used for dispatch is correct. The effect only runs for committed renders,
  // so no stale data reaches Redux.
  prevDepsRef.current = deps
    ? {
        props: deps.props ? { ...deps.props } : undefined,
        state: deps.state ? { ...deps.state } : undefined,
      }
    : undefined

  // Create render info object — renderCount uses the current meaningful count.
  // It gets overwritten with the incremented value at dispatch time inside setTimeout.
  const renderInfo: RenderInfo = {
    id: generateRenderEventId(),
    componentName,
    renderCount: meaningfulCountRef.current,
    reason,
    timestamp: Date.now(),
    ...(changes.changedProps.length > 0 && { changedProps: changes.changedProps }),
    ...(changes.changedState.length > 0 && { changedState: changes.changedState }),
    ...(changes.propChanges.length > 0 && { propChanges: changes.propChanges }),
    ...(changes.stateChanges.length > 0 && { stateChanges: changes.stateChanges }),
  }

  // Dispatch to Redux store using a debounced pattern that prevents infinite loops.
  //
  // The problem: dispatching recordRender → Redux update → ExamplePage re-renders
  // (via useComponentTreeWithCounts subscription) → child LivePreviewWrapper re-renders
  // → renderCountRef increments → useEffect fires → dispatch again → infinite loop.
  //
  // The solution: when we have a dispatch in flight (pending setTimeout), skip
  // cascade renders (reason='parent-rerender'). These are artifacts of our own
  // dispatch updating Redux and causing the parent to re-render. Only genuine
  // renders (initial, state-change, props-change) or the first parent-rerender
  // after user interaction should trigger a new dispatch.
  useEffect(() => {
    // Skip cascade renders caused by our own dispatch still in flight.
    // When a dispatch is pending or just completed, Redux notifies subscribers
    // which re-renders the parent (ExamplePage via useComponentTreeWithCounts),
    // cascading to this component. These are artifacts, not user-triggered renders.
    if (dispatchInFlightRef.current && reason === 'parent-rerender') {
      return
    }

    pendingInfoRef.current = renderInfo

    // Reset committed reason so the next render batch starts fresh
    committedReasonRef.current = null
    committedChangesRef.current = null

    // Clear any pending dispatch — only the latest render info will be dispatched
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }

    dispatchInFlightRef.current = true

    timerRef.current = setTimeout(() => {
      timerRef.current = null
      if (pendingInfoRef.current) {
        // Increment the meaningful count only when we actually dispatch —
        // this excludes all cascade renders that were skipped above.
        meaningfulCountRef.current += 1
        pendingInfoRef.current = {
          ...pendingInfoRef.current,
          renderCount: meaningfulCountRef.current,
        }
        dispatch(recordRender(pendingInfoRef.current))
        pendingInfoRef.current = null
      }
      // Keep the flag true through the synchronous cascade that follows
      // dispatch (Redux → subscriber re-render → child re-render). Clear
      // in the next macrotask so cascade renders (which happen synchronously
      // after Redux notifies) are all skipped.
      setTimeout(() => {
        dispatchInFlightRef.current = false
      }, 0)
    }, 0)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderCount])

  return {
    renderCount: meaningfulCountRef.current,
    renderInfo,
  }
}
