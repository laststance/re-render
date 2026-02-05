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
      // End suppression after the React render cycle completes.
      // requestAnimationFrame fires after React commits the update,
      // ensuring all useEffect-dispatched recordRender calls are suppressed.
      requestAnimationFrame(() => {
        dispatch(endSuppressToasts())
      })
    },
    [dispatch]
  )
}
