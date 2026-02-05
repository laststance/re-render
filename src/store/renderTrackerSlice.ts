import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RenderInfo } from '@/types'

/**
 * State for tracking component renders across the application
 */
interface RenderTrackerState {
  /** Map of component name to array of render events */
  renderHistory: Record<string, RenderInfo[]>
  /** Map of component name to current render count */
  renderCounts: Record<string, number>
  /** Most recent render event (for flash animations) */
  lastRender: RenderInfo | null
  /** When true, render events are recorded but don't update lastRender (suppresses toasts) */
  suppressToasts: boolean
}

const initialState: RenderTrackerState = {
  renderHistory: {},
  renderCounts: {},
  lastRender: null,
  suppressToasts: false,
}

/**
 * Redux slice for tracking component re-renders
 */
export const renderTrackerSlice = createSlice({
  name: 'renderTracker',
  initialState,
  reducers: {
    /**
     * Record a new render event for a component.
     * When suppressToasts is true, the event is recorded in history
     * but lastRender is not updated (so toasts won't fire).
     */
    recordRender: (state, action: PayloadAction<RenderInfo>) => {
      const { componentName } = action.payload

      // Initialize history array if needed
      if (!state.renderHistory[componentName]) {
        state.renderHistory[componentName] = []
      }

      // Add to history (keep last 100 events per component)
      state.renderHistory[componentName].push(action.payload)
      if (state.renderHistory[componentName].length > 100) {
        state.renderHistory[componentName].shift()
      }

      // Update render count
      state.renderCounts[componentName] = action.payload.renderCount

      // Track last render for animations — skip when suppressed
      if (!state.suppressToasts) {
        state.lastRender = action.payload
      }
    },

    /**
     * Temporarily suppress toast notifications.
     * Re-renders are still recorded in history but don't trigger toasts.
     * Use before UI chrome actions (view mode switch, overlay toggle).
     */
    beginSuppressToasts: (state) => {
      state.suppressToasts = true
    },

    /**
     * Re-enable toast notifications after suppression.
     */
    endSuppressToasts: (state) => {
      state.suppressToasts = false
    },

    /**
     * Clear all render tracking data
     */
    clearRenderHistory: (state) => {
      state.renderHistory = {}
      state.renderCounts = {}
      state.lastRender = null
    },

    /**
     * Clear render history for a specific component
     */
    clearComponentHistory: (state, action: PayloadAction<string>) => {
      const componentName = action.payload
      delete state.renderHistory[componentName]
      delete state.renderCounts[componentName]
    },
  },
})

export const {
  recordRender,
  beginSuppressToasts,
  endSuppressToasts,
  clearRenderHistory,
  clearComponentHistory,
} = renderTrackerSlice.actions

export default renderTrackerSlice.reducer
