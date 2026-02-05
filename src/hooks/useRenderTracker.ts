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

  // Track render count across renders (persists but doesn't cause re-renders)
  const renderCountRef = useRef(0)

  // Track previous props and state for comparison
  const prevDepsRef = useRef<TrackableDeps | undefined>(undefined)

  // Increment render count on every render
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
  const reason = determineRenderReason(
    isInitialRender,
    changedProps,
    changedState
  )

  // Create render info object
  const renderInfo: RenderInfo = {
    id: generateRenderEventId(),
    componentName,
    renderCount,
    reason,
    timestamp: Date.now(),
    ...(changedProps.length > 0 && { changedProps }),
    ...(changedState.length > 0 && { changedState }),
    ...(propChanges.length > 0 && { propChanges }),
    ...(stateChanges.length > 0 && { stateChanges }),
  }

  // Update previous deps for next render comparison
  // This must happen during render, not in useEffect, to capture the value
  // at the time of render (before any effects run)
  prevDepsRef.current = deps
    ? {
        props: deps.props ? { ...deps.props } : undefined,
        state: deps.state ? { ...deps.state } : undefined,
      }
    : undefined

  // Dispatch to Redux store after render completes
  useEffect(() => {
    dispatch(recordRender(renderInfo))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderCount]) // Only dispatch when render count changes

  return {
    renderCount,
    renderInfo,
  }
}
