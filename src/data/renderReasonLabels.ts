import type { RenderReason } from '@/types'

/**
 * Mapping of render reasons to human-readable display labels.
 * Shared across Toast and ToastContainer components.
 * @example
 * REASON_LABELS['state-change'] // => "State Changed"
 * REASON_LABELS['parent-rerender'] // => "Parent Re-rendered"
 */
export const REASON_LABELS: Record<RenderReason, string> = {
  initial: 'Initial Render',
  'props-change': 'Props Changed',
  'state-change': 'State Changed',
  'context-change': 'Context Changed',
  'parent-rerender': 'Parent Re-rendered',
  'force-update': 'Force Update',
}

/**
 * Mapping of render reasons to human-readable explanations.
 * @example
 * REASON_EXPLANATIONS['props-change']
 * // => "One or more props passed to this component changed."
 */
export const REASON_EXPLANATIONS: Record<RenderReason, string> = {
  initial: 'This was the first render of the component.',
  'props-change': 'One or more props passed to this component changed.',
  'state-change': 'The component\'s internal state was updated.',
  'context-change': 'A React context value this component consumes changed.',
  'parent-rerender': 'The parent component re-rendered, causing this component to re-render.',
  'force-update': 'A force update was triggered on this component.',
}

/**
 * Detailed React mechanism explanations for each re-render cause.
 * Used in toast expanded details to teach React internals.
 * @example
 * REACT_MECHANISMS['parent-rerender']
 * // => "Without React.memo(), a component re-renders whenever its parent renders..."
 */
export const REACT_MECHANISMS: Record<RenderReason, string> = {
  initial: 'React calls the component function for the first time to build the initial virtual DOM tree.',
  'props-change': 'When a parent passes new prop values, React detects the reference change and schedules a re-render. Use React.memo() to skip re-renders when props are shallowly equal.',
  'state-change': 'Calling setState/useState setter enqueues a state update. React batches updates and re-renders the component with the new state.',
  'context-change': 'Context.Provider value changed → all consuming components re-render. Consider splitting contexts or memoizing values to reduce scope.',
  'parent-rerender': 'Without React.memo(), a component re-renders whenever its parent renders, even if props haven\'t changed. This is React\'s default behavior.',
  'force-update': 'Key prop change unmounts/remounts the component. useReducer dispatch or forceUpdate() bypasses normal comparison.',
}
