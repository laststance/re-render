import { useCallback } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { beginSuppressToasts, endSuppressToasts } from '@/store'

/**
 * Returns a wrapper that suppresses re-render toast notifications
 * during a state update and the subsequent render cycle.
 *
 * Use this for UI chrome actions (view mode switch, overlay toggle)
 * that cause re-renders but are not meaningful for the educational
 * re-render visualization.
 *
 * @returns Function that wraps a callback with toast suppression
 *
 * @example
 * ```tsx
 * const withSuppressToasts = useSuppressToasts()
 * <button onClick={withSuppressToasts(() => setViewMode('live'))}>Live</button>
 * ```
 */
export function useSuppressToasts() {
  const dispatch = useAppDispatch()

  return useCallback(
    (action: () => void) => {
      dispatch(beginSuppressToasts())
      action()
      // End suppression after the cascade render cycle fully completes.
      // useRenderTracker uses double-setTimeout(0) for dispatch + flag clear,
      // so we need to wait beyond that window. A nested setTimeout(0) × 3
      // ensures all cascade renders and their dispatches complete before
      // re-enabling toasts.
      setTimeout(() => {
        setTimeout(() => {
          setTimeout(() => {
            dispatch(endSuppressToasts())
          }, 0)
        }, 0)
      }, 0)
    },
    [dispatch]
  )
}
