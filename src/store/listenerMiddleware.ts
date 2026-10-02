import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { recordRender, clearRenderHistory } from './renderTrackerSlice'
import { addToast, addBatchToast, clearAllToasts } from './toastSlice'
import type { RootState, AppDispatch } from './index'
import type { RenderInfo } from '@/types'

/**
 * RTK listener middleware that bridges render events to toast notifications.
 *
 * Replaces the former useReRenderToasts hook by reacting directly to
 * recordRender actions at the Redux layer — no React render cycle needed.
 *
 * Collects render events within a 300ms debounce window and dispatches either:
 * - A single toast (for 1 render event)
 * - A batch toast (for 2+ render events triggered together)
 *
 * Skips initial renders and suppressed toasts.
 *
 * @example
 * // Automatically active once the middleware is added to the store.
 * // No hook call required.
 */
export const listenerMiddleware = createListenerMiddleware()

const startAppListening =
  listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()

/** Debounce window — waits for render cascade to settle before creating toast */
const BATCH_DEBOUNCE_MS = 300

/** Module-level buffer for batching render events within the debounce window */
let buffer: RenderInfo[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

startAppListening({
  actionCreator: recordRender,
  effect: (action, { getState, dispatch }) => {
    const { suppressToasts } = getState().toast
    const renderInfo = action.payload

    // Skip initial renders, suppressed toasts, and events rendered under a
    // stale generation (a reset landed between commit and passive dispatch —
    // the reducer drops them too, but the buffer must not see them either).
    if (
      renderInfo.reason === 'initial' ||
      suppressToasts ||
      (renderInfo.generation !== undefined &&
        renderInfo.generation !== getState().renderTracker.generation)
    ) {
      return
    }

    // Buffer the event and reset debounce timer
    buffer.push(renderInfo)
    if (flushTimer) clearTimeout(flushTimer)
    flushTimer = setTimeout(() => {
      const batch = buffer
      buffer = []
      flushTimer = null

      // Re-check suppression at flush time — a UI chrome action may have
      // activated suppression after events were buffered (race condition fix).
      if (getState().toast.suppressToasts) return

      if (batch.length === 1) {
        dispatch(addToast(batch[0]))
      } else if (batch.length > 1) {
        dispatch(addBatchToast(batch))
      }
    }, BATCH_DEBOUNCE_MS)
  },
})

// Drop buffered-but-unflushed render events when the demo resets or toasts
// are cleared — otherwise a stale flush surfaces a "ghost" toast after
// clearAllToasts already ran (observed with the concurrent example's
// deferred transition commit).
startAppListening({
  matcher: isAnyOf(clearRenderHistory, clearAllToasts),
  effect: () => {
    buffer = []
    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
  },
})
