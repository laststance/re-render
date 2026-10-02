import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SplitPaneLayout } from '@/components/layout'
import { ComponentBoxView, LivePreview } from '@/components/visualization'
import { TriggerPanel, ExplanationPanel } from '@/components/ui'
import { useComponentTreeWithCounts, useMemoizedTreeWithCounts, useSuppressToasts } from '@/hooks'
import { useAppDispatch } from '@/store/hooks'
import { clearRenderHistory, clearAllToasts, beginSuppressToasts, endSuppressToasts } from '@/store'
import { getExample, getAdjacentExamples } from '@/data/examples'
import { livePreviewMap } from '@/data/livePreviewMap'
import { getTriggers } from '@/data/triggerConfig'
import { cn } from '@/lib/utils'
import type { ComponentNode } from '@/types'
import type { ViewMode } from '@/components/layout/VisualizationPane'
import type { LivePreviewHandle } from '@/data/livePreviewExamples'

/**
 * Page component displaying a single re-render example with dual-tree comparison.
 * Shows the same scenario for both `<Child />` (orange) and `<MemoizedChild />` (blue),
 * making it viscerally clear whether React.memo prevents re-renders in each case.
 *
 * @example
 * // URL: /conditions/state-change → shows dual trees for state change scenario
 * // URL: /optimization/usecallback → shows dual trees for useCallback scenario
 */
export function ExamplePage() {
  const params = useParams<{ categoryId: string; exampleId: string }>()
  const categoryId = params.categoryId as string | undefined
  const exampleId = params.exampleId as string | undefined

  const [activeFileId, setActiveFileId] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('box')
  const livePreviewRef = useRef<LivePreviewHandle>(null)
  const withSuppressToasts = useSuppressToasts()
  const dispatch = useAppDispatch()

  // Clear stale render counts when navigating between examples.
  // Keep toasts quiet through the remount window: generation-absorbed
  // commits never dispatch, and initial-mount dispatches are already
  // skipped by the listener middleware, so suppression remains only as a
  // safety net for stray non-initial commits during navigation.
  useEffect(() => {
    dispatch(beginSuppressToasts())
    dispatch(clearRenderHistory())
    // suppression is refcounted, so each begin needs exactly one end: the
    // timer ends on schedule, and cleanup ends early only when the page
    // unmounts (or re-navigates) inside the 100ms window.
    let ended = false
    const end = () => {
      if (ended) return
      ended = true
      dispatch(endSuppressToasts())
    }
    const timer = setTimeout(end, 100)
    return () => {
      clearTimeout(timer)
      end()
      // Events buffered in the listener's 300ms debounce would otherwise flush
      // a ghost toast onto the landing page (or the next example) after this
      // page unmounts — clearAllToasts also purges that pending batch.
      dispatch(clearAllToasts())
    }
  }, [categoryId, exampleId, dispatch])

  // Suppress toasts when switching view mode (UI chrome, not a meaningful re-render)
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => withSuppressToasts(() => setViewMode(mode)),
    [withSuppressToasts]
  )

  // Suppress toasts when switching code file tabs (UI chrome, not a meaningful re-render)
  const handleFileSelect = useCallback(
    (fileId: string) => withSuppressToasts(() => setActiveFileId(fileId)),
    [withSuppressToasts]
  )

  const example = categoryId && exampleId ? getExample(categoryId, exampleId) : null

  // Render-count subscription lives inside ConnectedDualTreeView — NOT here.
  // If this page subscribed to renderTracker, every recordRender dispatch
  // would re-render the whole page including LivePreview, producing cascade
  // renders that corrupt the counts being displayed.

  // Check if this example has a live preview component
  const LivePreviewComponent = exampleId ? livePreviewMap[exampleId] : undefined
  const hasLivePreview = !!LivePreviewComponent

  // Stable element for the tracked preview: page-level state changes
  // (view mode, active file tab) re-render this page, and an identical
  // element reference lets React bail out of the entire preview subtree —
  // chrome actions never count as renders of the demo components.
  const livePreviewContent = useMemo(
    () => (LivePreviewComponent ? <LivePreviewComponent ref={livePreviewRef} /> : null),
    [LivePreviewComponent]
  )

  // Get available triggers for this example
  const triggers = exampleId ? getTriggers(exampleId) : []
  const hasTriggers = triggers.length > 0

  // Keep the selected tab only if the new example actually has that file —
  // a stale id from the previous example would otherwise leave FileTabs with
  // no selection while the editor falls back to files[0] (tab/content mismatch).
  const activeFileExists = example?.files.some((f) => f.id === activeFileId)
  const effectiveActiveFileId = activeFileExists ? activeFileId : (example?.files[0]?.id ?? '')

  // Handle trigger button clicks
  const handleTrigger = (triggerId: string) => {
    livePreviewRef.current?.trigger(triggerId)
  }

  if (!example) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <h2 className="text-2xl font-semibold text-foreground">Example Not Found</h2>
        <p className="max-w-[28rem] text-sm text-muted-foreground">
          {exampleId && categoryId
            ? <>The example &quot;{exampleId}&quot; in category &quot;{categoryId}&quot; could not be found. It may have been moved or removed.</>
            : 'The requested example could not be found. It may have been moved or removed.'
          }
        </p>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Back to Home
        </Link>
      </div>
    )
  }

  const adjacent = categoryId && exampleId
    ? getAdjacentExamples(categoryId, exampleId)
    : null

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">{example.title}</h2>
          {adjacent && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {adjacent.step}/{adjacent.total}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{example.description}</p>
      </header>

      {/* Explanation Panel - Collapsible documentation */}
      {example.explanation && (
        <div className="border-b border-border px-4 py-3">
          <ExplanationPanel explanation={example.explanation} />
        </div>
      )}

      <div className="min-h-[500px] flex-1 overflow-hidden">
        <SplitPaneLayout
          files={example.files}
          activeFileId={effectiveActiveFileId}
          onFileSelect={handleFileSelect}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          hasLivePreview={hasLivePreview}
        >
          {/* Trigger Panel - shared between both tree sections */}
          {hasTriggers && LivePreviewComponent && (
            <TriggerPanel triggers={triggers} onTrigger={handleTrigger} />
          )}

          {/* Dual-tree comparison view — mounted only in box mode so a
              recordRender dispatch doesn't re-render a hidden tree while
              the user is in live mode */}
          {viewMode === 'box' && (
            <ConnectedDualTreeView tree={example.componentTree} />
          )}

          {/* Live preview - always mounted to keep useRenderTracker active */}
          {LivePreviewComponent && (
            <div
              className={cn(
                // h-full lets the live preview fill the pane; h-0 collapses it
                // when hidden (tailwind-merge keeps the last h-* class).
                'h-full',
                viewMode !== 'live' && 'h-0 overflow-hidden pointer-events-none'
              )}
              aria-hidden={viewMode !== 'live'}
              inert={viewMode !== 'live'}
            >
              <LivePreview>{livePreviewContent}</LivePreview>
            </div>
          )}
        </SplitPaneLayout>
      </div>

      {/* Next/Previous navigation */}
      {adjacent && (
        <ExampleNavigation
          prev={adjacent.prev}
          next={adjacent.next}
        />
      )}
    </div>
  )
}

/**
 * Subscribes to live render counts and renders the dual-tree comparison.
 *
 * This component is the ONLY renderTracker subscriber in the example page
 * tree. Keeping the subscription here — below SplitPaneLayout and outside the
 * LivePreview subtree — means a recordRender dispatch re-renders just this
 * view and never cascades into the tracked preview components, so displayed
 * counts match the demo's actual React renders.
 *
 * @param tree - Static component tree from the example definition
 */
function ConnectedDualTreeView({ tree }: { tree: ComponentNode | null }) {
  const liveTree = useComponentTreeWithCounts(tree)
  const memoizedTree = useMemoizedTreeWithCounts(tree)

  return <DualTreeView childTree={liveTree} memoizedTree={memoizedTree} />
}

/**
 * Dual-tree comparison showing `<Child />` and `<MemoizedChild />` side by side vertically.
 * Orange-themed section for unmemoized, blue-themed for memoized.
 * Scrollable vertically when both sections exceed viewport height.
 *
 * @param childTree - Live tree with render counts for the unmemoized variant
 * @param memoizedTree - Live tree with render counts for the memoized variant
 *
 * @example
 * <DualTreeView childTree={liveTree} memoizedTree={memoizedLiveTree} />
 */
function DualTreeView({
  childTree,
  memoizedTree,
}: {
  childTree: ComponentNode | null
  memoizedTree: ComponentNode | null
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Without Memo section — orange accent */}
      <section
        className="rounded-lg border-2 border-[var(--flash-color)]/40 bg-card"
        aria-label="Without memo comparison"
      >
        <div className="flex items-center gap-2 border-b border-[var(--flash-color)]/20 px-4 py-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: 'var(--flash-color)' }}
            aria-hidden="true"
          />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--flash-color)' }}>
            {'<Child />'}
          </h3>
          <span className="text-xs text-muted-foreground">Without React.memo</span>
        </div>
        <div className="p-4">
          {childTree ? (
            <ComponentBoxView tree={childTree} variant="child" />
          ) : (
            <p className="text-sm text-muted-foreground">No component tree</p>
          )}
        </div>
      </section>

      {/* With Memo section — blue accent */}
      <section
        className="rounded-lg border-2 border-[var(--flash-color-memo)]/40 bg-card"
        aria-label="With memo comparison"
      >
        <div className="flex items-center gap-2 border-b border-[var(--flash-color-memo)]/20 px-4 py-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: 'var(--flash-color-memo)' }}
            aria-hidden="true"
          />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--flash-color-memo)' }}>
            {'<MemoizedChild />'}
          </h3>
          <span className="text-xs text-muted-foreground">With React.memo</span>
        </div>
        <div className="p-4">
          {memoizedTree ? (
            <ComponentBoxView tree={memoizedTree} variant="memoized" />
          ) : (
            <p className="text-sm text-muted-foreground">No component tree</p>
          )}
        </div>
      </section>
    </div>
  )
}

/**
 * Previous/Next navigation bar for guided learning flow.
 * Displayed at the bottom of each example page.
 * @param prev - Previous example in learning order, or null if first
 * @param next - Next example in learning order, or null if last
 */
function ExampleNavigation({
  prev,
  next,
}: {
  prev: { categoryId: string; exampleId: string; title: string } | null
  next: { categoryId: string; exampleId: string; title: string } | null
}) {
  return (
    <nav
      className="flex items-center justify-between border-t border-border px-4 py-3"
      aria-label="Previous and next examples"
    >
      {prev ? (
        <Link
          href={`/${prev.categoryId}/${prev.exampleId}`}
          className="flex min-h-[44px] items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/${next.categoryId}/${next.exampleId}`}
          className="flex min-h-[44px] items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <span className="truncate">{next.title}</span>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
