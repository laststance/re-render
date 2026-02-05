import { useState } from 'react'

/**
 * Hook that returns a unique key that changes whenever the watched value changes.
 * Used to trigger CSS animations by forcing element re-creation.
 *
 * Uses React 19's pattern of updating state during render when props change
 * (the recommended replacement for getDerivedStateFromProps).
 *
 * @param value - The value to watch for changes
 * @returns flashKey - A string key that changes on value change (for CSS animation trigger)
 */
export function useFlashOnChange<T>(value: T): string {
  const [state, setState] = useState({ prevValue: value, key: 0 })

  // React 19 pattern: update state during render when props change
  // This is the recommended approach and does NOT cause extra renders
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  if (state.prevValue !== value) {
    setState({ prevValue: value, key: state.key + 1 })
  }

  return `flash-${state.key}`
}
