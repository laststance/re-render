import { useSyncExternalStore } from 'react'

/**
 * Shared breakpoint queries — single source of truth so the hooks below and
 * the SplitPaneLayout device detection can never drift apart.
 */
const DESKTOP_QUERY = '(min-width: 1024px)'
// Bounded so useIsTablet() is false on desktop — useDeviceType short-circuits
// on desktop first, but direct callers must not see tablet=true at ≥1024px.
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023px)'
const MOBILE_QUERY = '(max-width: 767px)'

interface MediaStore {
  subscribe: (onChange: () => void) => () => void
  getSnapshot: () => boolean
  getServerSnapshot: () => boolean
}

/** One store per query — the MediaQueryList is created lazily on first
 * client use and shared between subscribe/getSnapshot (no per-call
 * allocation, no listeners until a component actually subscribes). */
const mediaStores = new Map<string, MediaStore>()

function getMediaStore(query: string): MediaStore {
  let store = mediaStores.get(query)
  if (store) return store

  let mql: MediaQueryList | undefined
  const getMql = () => (mql ??= window.matchMedia(query))
  store = {
    subscribe: (onChange) => {
      const mq = getMql()
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    // Only ever read on the client — React uses getServerSnapshot for SSR
    // and hydration renders instead.
    getSnapshot: () => getMql().matches,
    getServerSnapshot: () => false,
  }
  mediaStores.set(query, store)
  return store
}

/**
 * Hook to detect if a media query matches.
 *
 * Backed by useSyncExternalStore so the real matchMedia value is available
 * on the very first render — the previous useState(false) + useEffect flip
 * rendered mobile markup first on desktop, then swapped the layout in a
 * post-mount commit that could remount subtrees.
 *
 * SSR'd consumers (Sidebar, layout chrome) still get getServerSnapshot's
 * `false` during prerender + hydration and flip to the real value in the
 * post-mount uSES recheck — the store only guarantees first-render accuracy
 * inside client-only subtrees (the ssr:false ExamplePage).
 *
 * @param query - CSS media query string (e.g., '(max-width: 767px)')
 * @returns Whether the media query currently matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 767px)')
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const store = getMediaStore(query)
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  )
}

/**
 * Hook to detect if viewport is desktop size (≥1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY)
}

/**
 * Hook to detect if viewport is tablet size (768px-1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery(TABLET_QUERY)
}

/**
 * Hook to detect if viewport is mobile size (<768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY)
}

/**
 * Returns current device type based on screen width
 * - 'desktop': ≥1024px
 * - 'tablet': 768-1023px
 * - 'mobile': <768px
 *
 * The real media-query value is available on the very first render.
 * {@link SplitPaneLayout} lives inside the ssr:false ExamplePage — a
 * false→true post-mount flip would swap the pane structure and REMOUNT the
 * entire live-preview subtree, resetting every tracked render count.
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

export function useDeviceType(): DeviceType {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const isTablet = useMediaQuery(TABLET_QUERY)

  if (isDesktop) return 'desktop'
  if (isTablet) return 'tablet'
  return 'mobile'
}
