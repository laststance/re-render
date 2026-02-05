import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, redirect } from 'next/navigation'
import { SplitPaneLayout } from '@/components/layout'
import { ComponentBoxView, LivePreview } from '@/components/visualization'
import { TriggerPanel, ExplanationPanel } from '@/components/ui'
import { useComponentTreeWithCounts, useSuppressToasts } from '@/hooks'
import { useAppDispatch } from '@/store/hooks'
import { clearRenderHistory } from '@/store'
import { getExample, getDefaultExample } from '@/data/examples'
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

  // Clear stale render counts when navigating between examples
  useEffect(() => {
    dispatch(clearRenderHistory())
  }, [exampleId, dispatch])

  // Suppress toasts when switching view mode (UI chrome, not a meaningful re-render)
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => withSuppressToasts(() => setViewMode(mode)),
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

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold text-foreground">{example.title}</h2>
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
          onFileSelect={setActiveFileId}
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
    </div>
  )
}
