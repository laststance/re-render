import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RenderInfo } from '@/types'

/**
 * Toast notification for a re-render event
 */
export interface Toast {
  /** Unique ID for this toast */
  id: string
  /** The render info that triggered this toast */
  renderInfo: RenderInfo
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
     * Add a new toast notification for a re-render event
     */
    addToast: (state, action: PayloadAction<RenderInfo>) => {
      const newToast: Toast = {
        id: `toast-${action.payload.id}`,
        renderInfo: action.payload,
        isExpanded: false,
        createdAt: Date.now(),
      }

      // Add to beginning (newest first)
      state.toasts.unshift(newToast)

      // Keep only maxToasts
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

export const { addToast, removeToast, toggleToastExpanded, clearAllToasts } =
  toastSlice.actions

export default toastSlice.reducer
