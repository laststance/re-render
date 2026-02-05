import { useState, useCallback } from 'react'
import { RotateCcw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppDispatch } from '@/store/hooks'
import { clearRenderHistory, clearAllToasts } from '@/store'
import { useSuppressToasts } from '@/hooks'

/**
 * Button that resets all re-render counters and clears toasts.
 * Provides visual feedback (checkmark) when reset is complete.
 * Suppresses toasts during reset to prevent cascade re-render toasts.
 */
export function ResetButton() {
  const dispatch = useAppDispatch()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const withSuppressToasts = useSuppressToasts()

  const handleReset = useCallback(() => {
    // Suppress toasts during reset — cascade re-renders from clearing
    // render history would otherwise create new toasts immediately
    withSuppressToasts(() => {
      // Clear all render tracking data
      dispatch(clearRenderHistory())
      // Clear all toast notifications
      dispatch(clearAllToasts())
    })

    // Show confirmation feedback
    setShowConfirmation(true)

    // Reset confirmation after animation completes
    setTimeout(() => {
      setShowConfirmation(false)
    }, 1500)
  }, [dispatch, withSuppressToasts])

  return (
    <button
      type="button"
      onClick={handleReset}
      aria-label="Reset all counters"
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-all',
        'min-h-[36px] min-w-[36px] touch-manipulation',
        'border border-border bg-card hover:bg-accent hover:text-accent-foreground',
        'active:scale-[0.98]',
        showConfirmation && 'border-green-500 text-green-600 dark:text-green-400'
      )}
    >
      {showConfirmation ? (
        <>
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Reset</span>
        </>
      ) : (
        <>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Reset</span>
        </>
      )}
    </button>
  )
}
