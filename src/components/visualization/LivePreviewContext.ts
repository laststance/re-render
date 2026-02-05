import { createContext, useContext } from 'react'

interface LivePreviewContextValue {
  showOverlays: boolean
}

export const LivePreviewContext = createContext<LivePreviewContextValue>({
  showOverlays: true,
})

/**
 * Hook to access live preview context.
 * Used by LivePreviewWrapper to determine if overlays should be shown.
 */
export function useLivePreview() {
  return useContext(LivePreviewContext)
}
