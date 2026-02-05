import { useEffect, useRef } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { addToast } from '@/store'

/**
 * Hook that subscribes to render events and creates toast notifications.
 *
 * Should be called once at the app level (e.g., in App.tsx or main.tsx).
 * Only creates toasts for re-renders (not initial renders).
 */
export function useReRenderToasts(): void {
  const dispatch = useAppDispatch()
  const lastRender = useAppSelector((state) => state.renderTracker.lastRender)

  // Track the last processed render ID to avoid duplicate toasts
  const lastProcessedIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Skip if no render event
    if (!lastRender) return

    // Skip if we've already processed this render event
    if (lastProcessedIdRef.current === lastRender.id) return

    // Skip initial renders - only show toasts for re-renders
    if (lastRender.reason === 'initial') {
      lastProcessedIdRef.current = lastRender.id
      return
    }

    // Mark as processed before dispatching
    lastProcessedIdRef.current = lastRender.id

    // Create toast for this re-render
    dispatch(addToast(lastRender))
  }, [lastRender, dispatch])
}
