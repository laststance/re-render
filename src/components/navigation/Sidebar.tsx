import { useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ChevronRight, ChevronDown, Menu, X, Home, Check, Minus } from 'lucide-react'
import { exampleCategories } from '@/data/examples'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { ThemeToggle } from '@/components/ui'
import type { MemoEffect } from '@/types'

/**
 * Number of examples in the "basic conditions" group.
 * First 5 = fundamental re-render triggers (state, props, parent, context, force-update).
 * Remaining = advanced patterns involving specific React APIs.
 */
const BASIC_CONDITIONS_COUNT = 5

/**
 * Renders a matrix cell showing whether a component re-renders in this scenario.
 * - 'no-effect': red ✗ (re-renders despite memo)
 * - 'prevents': green ✓ (memo prevents re-render)
 * - 'not-applicable': gray — (no re-render comparison)
 * @param effect - The memoEffect value for this scenario
 * @param isMemoized - Whether this column represents the memoized variant
 * @example
 * <MemoCell effect="prevents" isMemoized={true} />   // green ✓
 * <MemoCell effect="no-effect" isMemoized={false} />  // red ✗
 */
function MemoCell({
  effect,
  isMemoized,
}: {
  effect: MemoEffect
  isMemoized: boolean
}) {
  // For the <Child /> column: always red ✗ unless not-applicable
  // For the <MemoizedChild /> column: depends on memoEffect
  if (effect === 'not-applicable') {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded bg-muted/50">
        <Minus className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Not applicable</span>
      </span>
    )
  }

  if (!isMemoized) {
    // <Child /> column: always re-renders (red ✗) unless not-applicable
    // Special case: children-pattern prevents both
    if (effect === 'prevents') {
      // Some optimization patterns prevent re-render for BOTH (e.g., children pattern)
      // We need to check if this is a "both prevented" scenario
      // For now, <Child /> in 'prevents' optimization scenarios still re-renders
      // except children-pattern where composition avoids re-render entirely
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded bg-red-100 dark:bg-red-950/40">
          <X className="h-3 w-3 text-red-500" aria-hidden="true" />
          <span className="sr-only">Re-renders</span>
        </span>
      )
    }
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded bg-red-100 dark:bg-red-950/40">
        <X className="h-3 w-3 text-red-500" aria-hidden="true" />
        <span className="sr-only">Re-renders</span>
      </span>
    )
  }

  // <MemoizedChild /> column
  if (effect === 'prevents') {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 dark:bg-emerald-950/40">
        <Check className="h-3 w-3 text-emerald-500" aria-hidden="true" />
        <span className="sr-only">Prevented by memo</span>
      </span>
    )
  }

  // no-effect: re-renders despite memo
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-red-100 dark:bg-red-950/40">
      <X className="h-3 w-3 text-red-500" aria-hidden="true" />
      <span className="sr-only">Re-renders</span>
    </span>
  )
}

/**
 * Comparison matrix sidebar showing re-render behavior for <Child /> vs <MemoizedChild />.
 * Uses semantic HTML table with colored ✗/✓ cells.
 * @example
 * <MatrixSidebar onNavigate={() => setOpen(false)} />
 */
function MatrixSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const [optimizationExpanded, setOptimizationExpanded] = useState(false)
  const params = useParams<{ categoryId: string }>()
  const pathname = usePathname()

  const conditionsCategory = exampleCategories.find((c) => c.id === 'conditions')
  const optimizationCategory = exampleCategories.find((c) => c.id === 'optimization')

  // Auto-expand optimization if user is viewing an optimization example
  const isOptimizationActive = params.categoryId === 'optimization'
  const effectiveOptExpanded = optimizationExpanded || isOptimizationActive

  const basicExamples = conditionsCategory?.examples.slice(0, BASIC_CONDITIONS_COUNT) ?? []
  const advancedExamples = conditionsCategory?.examples.slice(BASIC_CONDITIONS_COUNT) ?? []
  const optimizationExamples = optimizationCategory?.examples ?? []

  let stepCounter = 0

  const renderRow = (
    categoryId: string,
    example: { id: string; title: string; memoEffect: MemoEffect },
    stepNumber: number
  ) => {
    const href = `/${categoryId}/${example.id}`
    const isActive = pathname === href
    return (
      <tr
        key={example.id}
        className={cn(
          'group cursor-pointer transition-colors',
          isActive
            ? 'bg-accent'
            : 'hover:bg-accent/50'
        )}
        onClick={() => {
          onNavigate?.()
        }}
      >
        <td className="py-1.5 pl-2 pr-1">
          <Link
            href={href}
            className="flex items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            onClick={() => onNavigate?.()}
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[10px] font-medium text-muted-foreground">
              {stepNumber}
            </span>
            <span
              className={cn(
                'truncate text-xs',
                isActive ? 'font-medium text-accent-foreground' : 'text-foreground'
              )}
            >
              {example.title}
            </span>
          </Link>
        </td>
        <td className="px-1 py-1.5">
          <div className="flex justify-center">
            <MemoCell effect={example.memoEffect} isMemoized={false} />
          </div>
        </td>
        <td className="px-1 py-1.5">
          <div className="flex justify-center">
            <MemoCell effect={example.memoEffect} isMemoized={true} />
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" role="grid" aria-label="Re-render comparison matrix">
        {/* Sticky column header */}
        <thead className="sticky top-0 z-10 bg-background">
          <tr className="border-b border-border">
            <th className="py-2 pl-2 pr-1 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Scenario
            </th>
            <th className="w-16 px-1 py-2 text-center text-[10px] font-medium leading-tight text-red-500">
              {'<Child />'}
            </th>
            <th className="w-16 px-1 py-2 text-center text-[10px] font-medium leading-tight text-blue-500">
              {'<Memo />'}
            </th>
          </tr>
        </thead>

        <tbody>
          {/* Section: Re-render Conditions */}
          <tr>
            <td colSpan={3} className="px-2 pb-1 pt-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              When does React re-render?
            </td>
          </tr>

          {basicExamples.map((ex) => {
            stepCounter++
            return renderRow('conditions', ex, stepCounter)
          })}

          {/* Advanced Patterns sub-header */}
          {advancedExamples.length > 0 && (
            <>
              <tr>
                <td colSpan={3} className="px-2 pb-1 pt-3">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Advanced Patterns
                  </span>
                  <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                    {advancedExamples.length}
                  </span>
                </td>
              </tr>
              {advancedExamples.map((ex) => {
                stepCounter++
                return renderRow('conditions', ex, stepCounter)
              })}
            </>
          )}

          {/* Section: Optimization */}
          {optimizationExamples.length > 0 && (
            <>
              <tr>
                <td colSpan={3} className="px-2 pb-1 pt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setOptimizationExpanded(!effectiveOptExpanded)
                    }}
                    className="flex w-full items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                    aria-expanded={effectiveOptExpanded}
                  >
                    {effectiveOptExpanded ? (
                      <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                    )}
                    Optimization
                    <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                      {optimizationExamples.length}
                    </span>
                  </button>
                </td>
              </tr>
              {effectiveOptExpanded &&
                optimizationExamples.map((ex) => {
                  stepCounter++
                  return renderRow('optimization', ex, stepCounter)
                })}
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Navigation content shared between desktop sidebar and mobile sheet.
 * Renders header + home link + comparison matrix.
 */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
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
      >
        {/* Home link */}
        <Link
          href="/"
          className={cn(
            'mb-2 flex min-h-[44px] items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            isHome
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-foreground hover:bg-accent/50'
          )}
          onClick={onNavigate}
        >
          <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
          Home
        </Link>

        {/* Comparison Matrix */}
        <MatrixSidebar onNavigate={onNavigate} />
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
          'fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-border bg-background transition-transform duration-200',
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
 * Sidebar navigation with comparison matrix showing <Child /> vs <MemoizedChild /> re-render behavior.
 * - Desktop: Fixed sidebar (320px wide) with matrix always visible
 * - Mobile: Hamburger button opening sheet overlay with horizontal scroll
 */
export function Sidebar() {
  const isDesktop = useIsDesktop()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Desktop: Render fixed sidebar
  if (isDesktop) {
    return (
      <aside className="flex h-full w-80 shrink-0 flex-col border-r border-border bg-background">
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
