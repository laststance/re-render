import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'

/** Theme options */
export type Theme = 'light' | 'dark' | 'system'

/** Resolved theme (what's actually applied) */
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 're-render-theme'

/**
 * Determines the system's preferred color scheme.
 * Uses prefers-color-scheme media query for detection.
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Retrieves the stored theme preference from localStorage.
 * Falls back to 'system' if not set or invalid.
 */
function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

/**
 * Applies the resolved theme to the document root.
 * Adds/removes 'dark' class for Tailwind CSS.
 */
function applyTheme(resolvedTheme: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (resolvedTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Resolves the current theme by reading localStorage + system preference.
 * @returns The resolved 'light' or 'dark' theme
 */
function getResolvedSnapshot(): ResolvedTheme {
  const stored = getStoredTheme()
  return stored === 'system' ? getSystemTheme() : stored
}

/** SSR-safe fallback — always 'light' on server */
function getServerSnapshot(): ResolvedTheme {
  return 'light'
}

/**
 * Subscribes to theme-relevant external changes:
 * - localStorage changes (cross-tab sync)
 * - System color scheme preference changes
 * @param callback - Re-render trigger from useSyncExternalStore
 * @returns Cleanup function
 */
function subscribeToTheme(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', callback)
  return () => {
    window.removeEventListener('storage', callback)
    mediaQuery.removeEventListener('change', callback)
  }
}

/**
 * Hook for managing dark mode theme.
 * Uses useSyncExternalStore for hydration-safe external state reading.
 * - Detects system preference via prefers-color-scheme
 * - Persists manual preference in localStorage
 * - Supports smooth transitions via CSS
 *
 * @returns Theme state and setter, plus resolved theme
 */
export function useTheme() {
  const resolvedTheme = useSyncExternalStore(
    subscribeToTheme,
    getResolvedSnapshot,
    getServerSnapshot
  )
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme())

  // Apply theme to DOM whenever resolvedTheme changes
  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  /**
   * Sets theme preference and persists to localStorage.
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
    applyTheme(newTheme === 'system' ? getSystemTheme() : newTheme)
  }, [])

  /**
   * Toggles between light and dark themes.
   * If currently 'system', uses opposite of current resolved theme.
   */
  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }, [resolvedTheme, setTheme])

  return {
    /** User's theme preference ('light', 'dark', or 'system') */
    theme,
    /** Actually applied theme ('light' or 'dark') */
    resolvedTheme,
    /** Set theme preference */
    setTheme,
    /** Toggle between light and dark */
    toggleTheme,
    /** Whether dark mode is currently active */
    isDark: resolvedTheme === 'dark',
  }
}
