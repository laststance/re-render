import { useState, useRef } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { SplitPaneLayout } from '@/components/layout'
import { ComponentBoxView, LivePreview } from '@/components/visualization'
import { TriggerPanel, ExplanationPanel } from '@/components/ui'
import { getExample, getDefaultExample } from '@/data/examples'
import { livePreviewMap } from '@/data/livePreviewMap'
import { getTriggers } from '@/data/triggerConfig'
import type { ViewMode } from '@/components/layout/VisualizationPane'
import type { LivePreviewHandle } from '@/data/livePreviewExamples'

/**
 * Page component displaying a single re-render example.
 * Reads category and example IDs from URL params.
 * Supports switching between Component Tree view and Live Preview.
 * Includes trigger panel for intentionally causing re-renders.
 */
export function ExamplePage() {
  const { categoryId, exampleId } = useParams<{
    categoryId: string
    exampleId: string
  }>()

  const [activeFileId, setActiveFileId] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('box')
  const livePreviewRef = useRef<LivePreviewHandle>(null)

  const example = categoryId && exampleId ? getExample(categoryId, exampleId) : null

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
    return <Navigate to={`/${defaultCat}/${defaultEx}`} replace />
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
          onViewModeChange={setViewMode}
          hasLivePreview={hasLivePreview}
        >
          {viewMode === 'live' && LivePreviewComponent ? (
            <div className="flex h-full flex-col gap-4">
              {/* Trigger Panel - visible when in live preview mode */}
              {hasTriggers && (
                <TriggerPanel triggers={triggers} onTrigger={handleTrigger} />
              )}
              {/* Live Preview Component */}
              <LivePreview>
                <LivePreviewComponent ref={livePreviewRef} />
              </LivePreview>
            </div>
          ) : (
            <ComponentBoxView tree={example.componentTree} />
          )}
        </SplitPaneLayout>
      </div>
    </div>
  )
}
