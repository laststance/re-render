import { configureStore } from '@reduxjs/toolkit'
import renderTrackerReducer from './renderTrackerSlice'
import toastReducer from './toastSlice'

/**
 * Redux store for the re-render visualization tool
 */
export const store = configureStore({
  reducer: {
    renderTracker: renderTrackerReducer,
    toast: toastReducer,
  },
})

// Infer types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Re-export slice actions for convenience
export {
  recordRender,
  clearRenderHistory,
  clearComponentHistory,
} from './renderTrackerSlice'

export {
  addToast,
  removeToast,
  toggleToastExpanded,
  clearAllToasts,
} from './toastSlice'

export type { Toast } from './toastSlice'
