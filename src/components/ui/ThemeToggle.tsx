import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

/**
 * Theme toggle button that switches between light and dark modes.
 * - Shows Sun icon in dark mode (click to switch to light)
 * - Shows Moon icon in light mode (click to switch to dark)
 * - Animates icon transition smoothly
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-[0.98]',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      <span className="relative h-5 w-5">
        {/* Sun icon - visible in dark mode */}
        <Sun
          className={cn(
            'absolute inset-0 h-5 w-5 transition-all duration-200',
            isDark
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-0 opacity-0'
          )}
          aria-hidden="true"
        />
        {/* Moon icon - visible in light mode */}
        <Moon
          className={cn(
            'absolute inset-0 h-5 w-5 transition-all duration-200',
            isDark
              ? '-rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          )}
          aria-hidden="true"
        />
      </span>
    </button>
  )
}
