import { createPortal } from 'react-dom'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { removeToast, toggleToastExpanded } from '@/store'
import { Toast } from './Toast'

const REASON_LABELS: Record<string, string> = {
  initial: 'Initial Render',
  'props-change': 'Props Changed',
  'state-change': 'State Changed',
  'context-change': 'Context Changed',
  'parent-rerender': 'Parent Re-rendered',
  'force-update': 'Force Update',
}

/**
 * Container for toast notifications, rendered via portal
 * Displays toasts stacked with newest on top (max 10)
 *
 * Includes a visually-hidden live region for reliable screen reader announcements
 */
export function ToastContainer() {
  const toasts = useAppSelector((state) => state.toast.toasts)
  const dispatch = useAppDispatch()

  const handleDismiss = (id: string) => {
    dispatch(removeToast(id))
  }

  const handleToggleExpand = (id: string) => {
    dispatch(toggleToastExpanded(id))
  }

  // Get the most recent toast for screen reader announcement
  const latestToast = toasts[0]

  return createPortal(
    <>
      {/* Visually-hidden live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {latestToast && (
          <span>
            {latestToast.renderInfo.componentName} re-rendered.{' '}
            {REASON_LABELS[latestToast.renderInfo.reason] || latestToast.renderInfo.reason}.{' '}
            Render count: {latestToast.renderInfo.renderCount}.
          </span>
        )}
      </div>

      {/* Visual toast container */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2"
          aria-label="Notifications"
          role="region"
        >
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              onDismiss={() => handleDismiss(toast.id)}
              onToggleExpand={() => handleToggleExpand(toast.id)}
            />
          ))}
        </div>
      )}
    </>,
    document.body
  )
}
