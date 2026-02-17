'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { Sidebar } from '@/components/navigation'
import { ToastContainer } from '@/components/ui'
import { useReRenderToasts } from '@/hooks'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import './globals.css'

/**
 * Theme initialization script injected into <head>.
 * Runs before paint to prevent flash of wrong theme.
 */
const themeScript = `
(function() {
  var theme = localStorage.getItem('re-render-theme');
  var isDark = theme === 'dark' ||
    (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) document.documentElement.classList.add('dark');
})();
`

/**
 * Inner layout shell containing the sidebar + main content area.
 * Separated so useReRenderToasts is called inside the Redux Provider.
 */
function AppShell({ children }: { children: React.ReactNode }) {
  useReRenderToasts()
  const isDesktop = useIsDesktop()

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <main
        className={`flex-1 overflow-y-auto ${isDesktop ? '' : 'pt-14'}`}
      >
        {children}
      </main>
      <ToastContainer />
    </div>
  )
}

/**
 * Root layout merging:
 * - HTML shell (from old index.html)
 * - Redux Provider (from old main.tsx)
 * - AppLayout (sidebar + main + toasts)
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Re-Render - React Re-render Visualizer</title>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Provider store={store}>
          <AppShell>{children}</AppShell>
        </Provider>
      </body>
    </html>
  )
}
