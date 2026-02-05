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
}

const initialState: RenderTrackerState = {
  renderHistory: {},
  renderCounts: {},
  lastRender: null,
}

/**
 * Redux slice for tracking component re-renders
 */
export const renderTrackerSlice = createSlice({
  name: 'renderTracker',
  initialState,
  reducers: {
    /**
     * Record a new render event for a component
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

      // Track last render for animations
      state.lastRender = action.payload
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

export const { recordRender, clearRenderHistory, clearComponentHistory } =
  renderTrackerSlice.actions

export default renderTrackerSlice.reducer
