/**
 * Reason why a component re-rendered
 */
export type RenderReason =
  | 'initial'
  | 'props-change'
  | 'state-change'
  | 'context-change'
  | 'parent-rerender'
  | 'force-update'

/**
 * Represents a single changed value with before/after comparison
 */
export interface ChangedValue {
  /** The key/name of the changed property */
  key: string
  /** Previous value (serialized for display) */
  previousValue: string
  /** Current value (serialized for display) */
  currentValue: string
  /** Type of the value (for display hints) */
  valueType: 'primitive' | 'object' | 'array' | 'function' | 'undefined'
}

/**
 * Information about a single render event
 */
export interface RenderInfo {
  /** Unique ID for this render event */
  id: string
  /** Name of the component that rendered */
  componentName: string
  /** Total number of times this component has rendered (including initial) */
  renderCount: number
  /** Reason for this render */
  reason: RenderReason
  /** Timestamp when the render occurred */
  timestamp: number
  /** Props that changed (keys only, for privacy) */
  changedProps?: string[]
  /** State keys that changed (if tracked) */
  changedState?: string[]
  /** Detailed prop changes with previous/current values */
  propChanges?: ChangedValue[]
  /** Detailed state changes with previous/current values */
  stateChanges?: ChangedValue[]
}

/**
 * Dependencies that can be tracked for re-render detection
 */
export interface TrackableDeps {
  /** Props object to track for changes */
  props?: Record<string, unknown>
  /** State object to track for changes */
  state?: Record<string, unknown>
}

/**
 * Return type of useRenderTracker hook
 */
export interface RenderTrackerResult {
  /** Total number of renders for this component instance */
  renderCount: number
  /** Information about the current render */
  renderInfo: RenderInfo
}
