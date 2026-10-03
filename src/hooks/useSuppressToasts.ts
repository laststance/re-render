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
      try {
        action()
      } finally {
        // Suppression is refcounted — a throwing action must still schedule
        // its end dispatch or the leaked session silences all future toasts.
        //
        // End suppression once the action's commits + passive effects settle.
        // A recordRender dispatched while suppression is active is dropped by
        // the listener middleware outright, so this window only needs to cover
        // useRenderTracker's per-commit effect — three macrotasks is ample.
        // It deliberately does NOT span the middleware's 300ms batch debounce;
        // events already buffered when suppression begins are instead dropped
        // by the buffer purge that fires on clearRenderHistory/clearAllToasts.
        setTimeout(() => {
          setTimeout(() => {
            setTimeout(() => {
              dispatch(endSuppressToasts())
            }, 0)
          }, 0)
        }, 0)
      }
    },
    [dispatch]
  )
}
