import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RenderInfo, RenderReason } from '@/types'

/**
 * State for tracking component renders across the application.
 * Pure data recording — toast signaling lives in toastSlice.
 */
interface RenderTrackerState {
  /** Map of component name to array of render events */
  renderHistory: Record<string, RenderInfo[]>
  /** Map of component name to current render count */
  renderCounts: Record<string, number>
  /** Map of component name to per-reason render counts.
   * Used by useMemoizedTreeWithCounts to compute counts excluding parent-rerender. */
  renderCountsByReason: Record<string, Partial<Record<RenderReason, number>>>
}

const initialState: RenderTrackerState = {
  renderHistory: {},
  renderCounts: {},
  renderCountsByReason: {},
}

/**
 * Redux slice for tracking component re-renders.
 * Records render events, counts, and per-reason breakdowns.
 * Toast creation is handled separately by listenerMiddleware + toastSlice.
 */
export const renderTrackerSlice = createSlice({
  name: 'renderTracker',
  initialState,
  reducers: {
    /**
     * Record a new render event for a component.
     * Toast creation is handled by listenerMiddleware (not this reducer).
     */
    recordRender: (state, action: PayloadAction<RenderInfo>) => {
      const { componentName, reason } = action.payload

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

      // Track per-reason counts for memoized tree simulation
      if (!state.renderCountsByReason[componentName]) {
        state.renderCountsByReason[componentName] = {}
      }
      const byReason = state.renderCountsByReason[componentName]
      byReason[reason] = (byReason[reason] ?? 0) + 1
    },

    /**
     * Clear all render tracking data
     */
    clearRenderHistory: (state) => {
      state.renderHistory = {}
      state.renderCounts = {}
      state.renderCountsByReason = {}
    },

    /**
     * Clear render history for a specific component
     */
    clearComponentHistory: (state, action: PayloadAction<string>) => {
      const componentName = action.payload
      delete state.renderHistory[componentName]
      delete state.renderCounts[componentName]
      delete state.renderCountsByReason[componentName]
    },
  },
})

export const {
  recordRender,
  clearRenderHistory,
  clearComponentHistory,
} = renderTrackerSlice.actions

export default renderTrackerSlice.reducer
