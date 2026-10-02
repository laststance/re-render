import { useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
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
  changedState: string[]
): RenderReason {
  if (isInitialRender) {
    return 'initial'
  }

  if (changedState.length > 0) {
    return 'state-change'
  }

  if (changedProps.length > 0) {
    return 'props-change'
  }

  // No props or state changed, but component still re-rendered.
  // This happens when parent re-renders and component isn't memoized (parent-rerender).
  return 'parent-rerender'
}

/**
 * Hook that tracks and reports component re-renders.
 *
 * Detects initial render vs. re-renders and determines the reason
 * for re-rendering (props-change, state-change, parent-rerender, etc.).
 *
 * Dispatches one recordRender action per committed render. Counting is
 * commit-accurate: a no-deps useEffect runs exactly once per commit, and a
 * render-token dedupes StrictMode's double-invoked mount effects.
 *
 * Render isolation: the Redux subscription for render counts lives inside
 * the visualization tree (ConnectedDualTreeView), NOT in a shared ancestor
 * of the live preview — so a recordRender dispatch never re-renders any
 * tracked component. There is no feedback loop to suppress, and every
 * committed render is counted honestly.
 *
 * Reset handling: clearRenderHistory bumps `renderTracker.generation`. The
 * subscription re-render it causes is instrumentation, not demo code — the
 * commit that observes the generation change is absorbed as a fresh baseline
 * (counted as the new initial render, not dispatched).
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

  // Subscription is scoped to the reset generation — a primitive that changes
  // only on clearRenderHistory — so this hook never re-renders on recordRender.
  const generation = useAppSelector((state) => state.renderTracker.generation)
  const generationRef = useRef(generation)

  // Fresh object token per render invocation. StrictMode double-invokes the
  // component body, so the last invocation's token is what the commit effect
  // sees. Mount-effect replay (StrictMode setup→cleanup→setup) observes the
  // same token and is deduped — one dispatch per commit, never two.
  const renderTokenRef = useRef<object>({})
  renderTokenRef.current = {}
  const countedTokenRef = useRef<object | null>(null)

  // Committed render count for THIS instance — the authoritative number that
  // gets dispatched and displayed. Reset boundaries are absorbed via the
  // generation check below, so it stays in sync with the cleared store.
  const committedCountRef = useRef(0)

  // Snapshot of the deps from the last COMMITTED render. Updated only inside
  // the commit effect — an aborted/concurrent render must not advance it,
  // or the next commit would diff against never-committed values and record
  // changes that never actually happened.
  const prevDepsRef = useRef<TrackableDeps | undefined>(undefined)

  // Whether this commit is the instance's initial render
  const isInitialRender = committedCountRef.current === 0 &&
    countedTokenRef.current === null

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

  // The reason/changes computed above are render-pure: prevDepsRef only
  // advances inside the commit effect, so both StrictMode invocations of a
  // render pass compute identical values — no "first invocation" capture is
  // needed. Keeping them in refs written during render would let an aborted
  // concurrent render leak its reason into the next commit.
  const reason = rawReason

  // Create render info object — renderCount is filled in at dispatch time
  // with the post-increment committed count. `generation` is stamped so the
  // store can drop events rendered before a reset (see renderTrackerSlice).
  const renderInfo: RenderInfo = {
    id: generateRenderEventId(),
    componentName,
    renderCount: committedCountRef.current,
    reason,
    timestamp: Date.now(),
    generation,
    ...(changedProps.length > 0 && { changedProps }),
    ...(changedState.length > 0 && { changedState }),
    ...(propChanges.length > 0 && { propChanges }),
    ...(stateChanges.length > 0 && { stateChanges }),
  }

  // Dispatch exactly once per committed render. Runs after every commit
  // (no dep array) because every commit of this component is a render worth
  // counting. React flushes all of a commit's passive effects before the next
  // render begins, so back-to-back commits each produce their own dispatch.
  useEffect(() => {
    // StrictMode mount dedupe: the same commit re-runs effects with the same
    // render token — count it once.
    if (countedTokenRef.current === renderTokenRef.current) {
      return
    }
    countedTokenRef.current = renderTokenRef.current

    // Reset boundary: clearRenderHistory bumped the generation. Absorb the
    // subscription-driven commit as the new baseline (equivalent to a fresh
    // mount). If the same commit ALSO carried a real demo change (a deferred
    // update batched with the reset), record it as the baseline event so the
    // render isn't silently erased from history.
    if (generation !== generationRef.current) {
      generationRef.current = generation
      committedCountRef.current = 1
      const carriedRealChange =
        renderInfo.reason !== 'initial' &&
        renderInfo.reason !== 'parent-rerender'
      if (carriedRealChange) {
        dispatch(recordRender({ ...renderInfo, renderCount: 1 }))
      }
    } else {
      committedCountRef.current += 1
      dispatch(
        recordRender({ ...renderInfo, renderCount: committedCountRef.current })
      )
    }

    // Advance the committed-deps snapshot — this render's deps are now the
    // committed baseline every future render diffs against.
    prevDepsRef.current = deps
      ? {
          props: deps.props ? { ...deps.props } : undefined,
          state: deps.state ? { ...deps.state } : undefined,
        }
      : undefined
  })

  return {
    renderCount: committedCountRef.current,
    renderInfo,
  }
}
