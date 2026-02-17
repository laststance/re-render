import { useEffect, useRef, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { addToast, addBatchToast } from '@/store'
import type { RenderInfo } from '@/types'

/** Debounce window — waits for render cascade to settle before creating toast */
const BATCH_DEBOUNCE_MS = 300

/**
 * Hook that subscribes to render events and creates batched toast notifications.
 *
 * Collects render events within a debounce window (300ms) and dispatches either:
 * - A single toast (for 1 render event)
 * - A batch toast (for 2+ render events triggered together)
 *
 * Should be called once at the app level (e.g., in App.tsx or main.tsx).
 * Only creates toasts for re-renders (not initial renders).
 * @example
 * // In your root component:
 * useReRenderToasts()
 */
export function useReRenderToasts(): void {
  const dispatch = useAppDispatch()
  const lastRender = useAppSelector((state) => state.renderTracker.lastRender)

  const lastProcessedIdRef = useRef<string | null>(null)
  const bufferRef = useRef<RenderInfo[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const flushBuffer = useCallback(() => {
    const batch = bufferRef.current
    bufferRef.current = []

    if (batch.length === 1) {
      dispatch(addToast(batch[0]))
    } else if (batch.length > 1) {
      dispatch(addBatchToast(batch))
    }
  }, [dispatch])

  useEffect(() => {
    if (!lastRender) return
    if (lastProcessedIdRef.current === lastRender.id) return

    // Skip initial renders — only show toasts for re-renders
    if (lastRender.reason === 'initial') {
      lastProcessedIdRef.current = lastRender.id
      return
    }

    lastProcessedIdRef.current = lastRender.id

    // Buffer the event and reset debounce timer
    bufferRef.current.push(lastRender)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(flushBuffer, BATCH_DEBOUNCE_MS)
  }, [lastRender, flushBuffer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
    }
  }, [])
}
