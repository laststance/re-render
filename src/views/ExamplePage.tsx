import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useParams, redirect } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SplitPaneLayout } from '@/components/layout'
import { ComponentBoxView, LivePreview } from '@/components/visualization'
import { TriggerPanel, ExplanationPanel } from '@/components/ui'
import { useComponentTreeWithCounts, useSuppressToasts } from '@/hooks'
import { useAppDispatch } from '@/store/hooks'
import { clearRenderHistory, beginSuppressToasts, endSuppressToasts } from '@/store'
import { getExample, getDefaultExample, getAdjacentExamples } from '@/data/examples'
import { livePreviewMap } from '@/data/livePreviewMap'
import { getTriggers } from '@/data/triggerConfig'
import { cn } from '@/lib/utils'
import type { ViewMode } from '@/components/layout/VisualizationPane'
import type { LivePreviewHandle } from '@/data/livePreviewExamples'

/**
 * Page component displaying a single re-render example.
 * Reads category and example IDs from URL params.
 * Supports switching between Component Tree view and Live Preview.
 * Includes trigger panel for intentionally causing re-renders.
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
  // Suppress toasts during the initial mount phase — useRenderTracker dispatches
  // recordRender via setTimeout(0) for each component, and each dispatch causes
  // a Redux update → parent re-render cascade. Without suppression these cascade
  // renders (reason: 'parent-rerender') would trigger a flood of false toasts.
  useEffect(() => {
    dispatch(beginSuppressToasts())
    dispatch(clearRenderHistory())
    const timer = setTimeout(() => {
      dispatch(endSuppressToasts())
    }, 100)
    return () => clearTimeout(timer)
  }, [exampleId, dispatch])

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

  // Merge static tree structure with live Redux render counts
  // Called before early return to satisfy React rules of hooks
  const liveTree = useComponentTreeWithCounts(example?.componentTree ?? null)

  // Check if this example has a live preview component
  const LivePreviewComponent = exampleId ? livePreviewMap[exampleId] : undefined
  const hasLivePreview = !!LivePreviewComponent

  // Get available triggers for this example
  const triggers = exampleId ? getTriggers(exampleId) : []
  const hasTriggers = triggers.length > 0

  // Reset active file when example changes
  const effectiveActiveFileId = activeFileId || example?.files[0]?.id || ''

  // Handle trigger button clicks
  const handleTrigger = (triggerId: string) => {
    livePreviewRef.current?.trigger(triggerId)
  }

  if (!example) {
    const { categoryId: defaultCat, exampleId: defaultEx } = getDefaultExample()
    redirect(`/${defaultCat}/${defaultEx}`)
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
          {/* Trigger Panel - always accessible when triggers exist */}
          {hasTriggers && LivePreviewComponent && (
            <TriggerPanel triggers={triggers} onTrigger={handleTrigger} />
          )}

          {/* Tree view - visible in box mode */}
          <div className={cn(viewMode !== 'box' && 'hidden')}>
            <ComponentBoxView tree={liveTree!} />
          </div>

          {/* Live preview - always mounted to keep useRenderTracker active */}
          {LivePreviewComponent && (
            <div
              className={cn(
                viewMode !== 'live' && 'h-0 overflow-hidden pointer-events-none'
              )}
              aria-hidden={viewMode !== 'live'}
            >
              <LivePreview>
                <LivePreviewComponent ref={livePreviewRef} />
              </LivePreview>
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
