import { useState, useEffect } from 'react'

/**
 * Hook to detect if a media query matches
 * Used for responsive layout switching between split-pane and stacked modes
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    // Initial sync from browser — required for SSR hydration (server renders false)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(mediaQuery.matches)
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

/**
 * Convenience hook for desktop breakpoint (≥1024px)
 * Returns true on desktop, false on tablet/mobile
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

/**
 * Convenience hook for tablet breakpoint (768-1023px)
 * Returns true on tablet, false on desktop/mobile
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

/**
 * Convenience hook for mobile breakpoint (<768px)
 * Returns true on mobile, false on tablet/mobile
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

/**
 * Returns current device type based on screen width
 * - 'desktop': ≥1024px
 * - 'tablet': 768-1023px
 * - 'mobile': <768px
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

export function useDeviceType(): DeviceType {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 768px)')

  if (isDesktop) return 'desktop'
  if (isTablet) return 'tablet'
  return 'mobile'
}
