import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/navigation'
import { ToastContainer } from '@/components/ui'
import { useReRenderToasts } from '@/hooks'
import { useIsDesktop } from '@/hooks/useMediaQuery'

/**
 * Main application layout with sidebar navigation.
 * - Desktop: Fixed sidebar + content area
 * - Mobile: Top header bar + full-width content (with padding for header)
 */
export function AppLayout() {
  useReRenderToasts()
  const isDesktop = useIsDesktop()

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <main
        className={`flex-1 overflow-y-auto ${isDesktop ? '' : 'pt-14'}`}
      >
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  )
}
