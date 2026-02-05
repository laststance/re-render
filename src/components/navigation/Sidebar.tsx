import { useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ChevronRight, ChevronDown, Menu, X, Home } from 'lucide-react'
import { exampleCategories } from '@/data/examples'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { ThemeToggle } from '@/components/ui'

/**
 * Collapsible category section in the sidebar.
 * Tracks expanded state and highlights active examples.
 */
function CategorySection({
  categoryId,
  categoryName,
  examples,
  defaultExpanded,
}: {
  categoryId: string
  categoryName: string
  examples: { id: string; title: string }[]
  defaultExpanded: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const pathname = usePathname()

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex min-h-[44px] w-full items-center gap-2 rounded-md px-2 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent/50"
        aria-expanded={isExpanded}
        aria-controls={`category-${categoryId}`}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        {categoryName}
      </button>

      <ul
        id={`category-${categoryId}`}
        role="list"
        className={cn(
          'space-y-0.5 overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!isExpanded}
      >
        {examples.map((example) => {
          const href = `/${categoryId}/${example.id}`
          const isActive = pathname === href
          return (
            <li key={example.id}>
              <Link
                href={href}
                className={cn(
                  'group flex min-h-[44px] items-center gap-2 rounded-md px-2 py-2 pl-8 text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-foreground hover:bg-accent/50'
                )}
              >
                <span className="truncate">{example.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Navigation content shared between desktop sidebar and mobile sheet.
 */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const params = useParams<{ categoryId: string }>()
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <>
      <div className="flex items-start justify-between border-b border-border p-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Re-Render</h1>
          <p className="text-xs text-muted-foreground">
            React re-render visualizer
          </p>
        </div>
        <ThemeToggle className="mt-0.5" />
      </div>

      <nav
        className="flex-1 overflow-y-auto p-2"
        aria-label="Example navigation"
        onClick={onNavigate}
      >
        {/* Home link */}
        <Link
          href="/"
          className={cn(
            'mb-2 flex min-h-[44px] items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
            isHome
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-foreground hover:bg-accent/50'
          )}
        >
          <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
          Home
        </Link>

        {/* Category sections */}
        {exampleCategories.map((category) => (
          <CategorySection
            key={category.id}
            categoryId={category.id}
            categoryName={category.name}
            examples={category.examples}
            defaultExpanded={category.id === params.categoryId || (isHome && category.id === 'basics')}
          />
        ))}
      </nav>
    </>
  )
}

/**
 * Mobile sheet overlay for navigation.
 * Slides in from left with backdrop.
 */
function MobileSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-end border-b border-border p-2">
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent onNavigate={onClose} />
      </div>
    </>
  )
}

/**
 * Sidebar navigation showing all categories and examples.
 * - Desktop: Fixed sidebar with collapsible categories
 * - Mobile: Hamburger button opening sheet overlay
 */
export function Sidebar() {
  const isDesktop = useIsDesktop()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Desktop: Render fixed sidebar
  if (isDesktop) {
    return (
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-background">
        <SidebarContent />
      </aside>
    )
  }

  // Mobile: Render hamburger trigger + sheet
  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="ml-3 text-lg font-semibold text-foreground">
            Re-Render
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <MobileSheet
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  )
}
