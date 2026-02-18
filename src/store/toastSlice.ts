import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { REASON_PRIORITY } from '@/data/renderReasonLabels'
import type { RenderInfo } from '@/types'

/**
 * Toast notification for re-render event(s).
 * A toast may represent a single render or a batch of renders triggered together.
 */
export interface Toast {
  /** Unique ID for this toast */
  id: string
  /** The primary render info (first in batch, or the only one) */
  renderInfo: RenderInfo
  /** All render events in this batch (present when multiple components re-rendered together) */
  batchRenders?: RenderInfo[]
  /** Whether the toast is expanded to show details */
  isExpanded: boolean
  /** Timestamp when the toast was created */
  createdAt: number
}

/**
 * State for managing toast notifications
 */
interface ToastState {
  /** Active toasts, newest first */
  toasts: Toast[]
  /** Maximum number of toasts to display */
  maxToasts: number
}

const initialState: ToastState = {
  toasts: [],
  maxToasts: 10,
}

/**
 * Redux slice for toast notifications
 */
export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    /**
     * Add a single toast notification for a re-render event
     */
    addToast: (state, action: PayloadAction<RenderInfo>) => {
      const newToast: Toast = {
        id: `toast-${action.payload.id}`,
        renderInfo: action.payload,
        isExpanded: false,
        createdAt: Date.now(),
      }

      state.toasts.unshift(newToast)

      if (state.toasts.length > state.maxToasts) {
        state.toasts = state.toasts.slice(0, state.maxToasts)
      }
    },

    /**
     * Add a batch toast consolidating multiple re-render events.
     * @param action.payload - Array of RenderInfo from renders that occurred together
     * @example
     * dispatch(addBatchToast([renderA, renderB, renderC]))
     * // Creates one toast showing "3 components re-rendered"
     */
    addBatchToast: (state, action: PayloadAction<RenderInfo[]>) => {
      const renders = action.payload
      if (renders.length === 0) return

      // Sort by reason priority so the root cause (e.g. state-change) is shown
      // as the primary toast info instead of a cascade artifact (parent-rerender).
      const sorted = [...renders].sort(
        (a, b) => REASON_PRIORITY[a.reason] - REASON_PRIORITY[b.reason]
      )

      const newToast: Toast = {
        id: `toast-batch-${Date.now()}`,
        renderInfo: sorted[0],
        batchRenders: sorted,
        isExpanded: false,
        createdAt: Date.now(),
      }

      state.toasts.unshift(newToast)

      if (state.toasts.length > state.maxToasts) {
        state.toasts = state.toasts.slice(0, state.maxToasts)
      }
    },

    /**
     * Remove a toast by ID
     */
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },

    /**
     * Toggle expanded state of a toast
     */
    toggleToastExpanded: (state, action: PayloadAction<string>) => {
      const toast = state.toasts.find((t) => t.id === action.payload)
      if (toast) {
        toast.isExpanded = !toast.isExpanded
      }
    },

    /**
     * Clear all toasts
     */
    clearAllToasts: (state) => {
      state.toasts = []
    },
  },
})

export const { addToast, addBatchToast, removeToast, toggleToastExpanded, clearAllToasts } =
  toastSlice.actions

export default toastSlice.reducer
