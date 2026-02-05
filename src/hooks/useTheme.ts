import { useState, useEffect, useCallback } from 'react'

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
  const root = document.documentElement
  if (resolvedTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Hook for managing dark mode theme.
 * - Detects system preference via prefers-color-scheme
 * - Persists manual preference in localStorage
 * - Supports smooth transitions via CSS
 *
 * @returns Theme state and setter, plus resolved theme
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const stored = getStoredTheme()
    return stored === 'system' ? getSystemTheme() : stored
  })

  /**
   * Sets theme preference and persists to localStorage.
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)

    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [])

  /**
   * Toggles between light and dark themes.
   * If currently 'system', uses opposite of current resolved theme.
   */
  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }, [resolvedTheme, setTheme])

  // Apply theme on mount and listen for system preference changes
  useEffect(() => {
    // Apply initial theme
    applyTheme(resolvedTheme)

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if using system theme
      if (theme === 'system') {
        const newResolved = e.matches ? 'dark' : 'light'
        setResolvedTheme(newResolved)
        applyTheme(newResolved)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, resolvedTheme])

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
