import { cn } from '@/lib/utils'

interface FileTabProps {
  filename: string
  isActive: boolean
  onClick: () => void
}

/**
 * Individual file tab button for code file navigation
 * Displays filename with active/inactive visual states
 */
export function FileTab({ filename, isActive, onClick }: FileTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex-shrink-0 px-4 py-2 text-sm font-medium transition-colors active:scale-[0.98]',
        'border-r border-[var(--border)] last:border-r-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        'min-w-[44px] min-h-[44px]', // Apple HIG minimum tap target
        isActive
          ? 'bg-[var(--background)] text-[var(--foreground)]'
          : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
      )}
      aria-selected={isActive}
      role="tab"
    >
      {filename}
      {isActive && (
        <span
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"
          aria-hidden="true"
        />
      )}
    </button>
  )
}
