import { useMemo, useState } from 'react'
import { Panel, Group } from 'react-resizable-panels'
import { Code, Eye } from 'lucide-react'
import { ResizeHandle } from '@/components/ui/ResizeHandle'
import { FileTabs } from '@/components/ui/FileTabs'
import { CodeEditor } from './CodeEditor'
import { VisualizationPane, type ViewMode } from './VisualizationPane'
import { useDeviceType } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import type { CodeFile } from '@/types/code'

/**
 * Minimum pane size as percentage (300px equivalent at typical viewport)
 * Enforces minimum 300px width on both panes
 */
const MIN_PANE_SIZE_PERCENT = 20

interface SplitPaneLayoutProps {
  files: CodeFile[]
  /** Active file ID for controlled state */
  activeFileId: string
  /** Callback when active file changes */
  onFileSelect: (fileId: string) => void
  /** Current view mode (box or live) */
  viewMode?: ViewMode
  /** Callback when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void
  /** Whether live preview is available */
  hasLivePreview?: boolean
  children?: ReactNode
  className?: string
}

/** Pane selector tab for tablet/mobile layouts */
type PaneTab = 'code' | 'preview'

/**
 * Tab bar for switching between Code and Preview panes on tablet/mobile.
 * Meets Apple HIG with 44x44px minimum tap targets.
 */
function PaneTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: PaneTab
  onTabChange: (tab: PaneTab) => void
}) {
  return (
    <div
      className="flex border-b border-border bg-background"
      role="tablist"
      aria-label="Pane selector"
    >
      <button
        id="pane-code-tab"
        role="tab"
        aria-selected={activeTab === 'code'}
        aria-controls="pane-code"
        className={cn(
          'flex min-h-[44px] flex-1 items-center justify-center gap-2 px-4 text-sm font-medium transition-colors',
          activeTab === 'code'
            ? 'border-b-2 border-primary text-primary'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => onTabChange('code')}
      >
        <Code className="h-4 w-4" aria-hidden="true" />
        Code
      </button>
      <button
        id="pane-preview-tab"
        role="tab"
        aria-selected={activeTab === 'preview'}
        aria-controls="pane-preview"
        className={cn(
          'flex min-h-[44px] flex-1 items-center justify-center gap-2 px-4 text-sm font-medium transition-colors',
          activeTab === 'preview'
            ? 'border-b-2 border-primary text-primary'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => onTabChange('preview')}
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
        Preview
      </button>
    </div>
  )
}

/**
 * Split-pane layout with tabbed code editor on left and visualization on right
 *
 * Responsive behavior:
 * - Desktop (≥1024px): Horizontal split with resizable divider
 * - Tablet (768-1023px): Vertical stack with tab bar to focus either pane
 * - Mobile (<768px): Single pane with tabs to switch between Code and Preview
 *
 * File tabs allow switching between multiple code files
 */
export function SplitPaneLayout({
  files,
  activeFileId,
  onFileSelect,
  viewMode = 'box',
  onViewModeChange,
  hasLivePreview = false,
  children,
  className,
}: SplitPaneLayoutProps) {
  const deviceType = useDeviceType()
  const [activePane, setActivePane] = useState<PaneTab>('code')

  const activeFile = useMemo(
    () => files.find((f) => f.id === activeFileId) ?? files[0],
    [files, activeFileId]
  )

  const editorPane = (
    <div className="flex h-full flex-col">
      <FileTabs
        files={files}
        activeFileId={activeFileId}
        onFileSelect={onFileSelect}
      />
      <div className="flex-1 overflow-hidden">
        <CodeEditor
          code={activeFile?.code ?? ''}
          language={activeFile?.language ?? 'typescript'}
        />
      </div>
    </div>
  )

  const previewPane = (
    <VisualizationPane
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      hasLivePreview={hasLivePreview}
    >
      {children}
    </VisualizationPane>
  )

  // Mobile (<768px): Single pane with tabs to switch
  if (deviceType === 'mobile') {
    return (
      <div className={cn('flex h-full flex-col', className)}>
        <PaneTabBar activeTab={activePane} onTabChange={setActivePane} />
        <div className="flex-1 overflow-hidden">
          <div
            id="pane-code"
            role="tabpanel"
            aria-labelledby="pane-code-tab"
            className={cn('h-full', activePane !== 'code' && 'hidden')}
          >
            {editorPane}
          </div>
          <div
            id="pane-preview"
            role="tabpanel"
            aria-labelledby="pane-preview-tab"
            className={cn('h-full', activePane !== 'preview' && 'hidden')}
          >
            {previewPane}
          </div>
        </div>
      </div>
    )
  }

  // Tablet (768-1023px): Stacked layout with tabs
  if (deviceType === 'tablet') {
    return (
      <div className={cn('flex h-full flex-col', className)}>
        <PaneTabBar activeTab={activePane} onTabChange={setActivePane} />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Code pane - prominent when focused, smaller when not */}
          <div
            id="pane-code"
            role="tabpanel"
            aria-labelledby="pane-code-tab"
            className={cn(
              'border-b border-border transition-all duration-200',
              activePane === 'code' ? 'flex-[2] min-h-[200px]' : 'flex-1 min-h-[150px]'
            )}
          >
            {editorPane}
          </div>
          {/* Preview pane - prominent when focused, smaller when not */}
          <div
            id="pane-preview"
            role="tabpanel"
            aria-labelledby="pane-preview-tab"
            className={cn(
              'transition-all duration-200',
              activePane === 'preview' ? 'flex-[2] min-h-[200px]' : 'flex-1 min-h-[150px]'
            )}
          >
            {previewPane}
          </div>
        </div>
      </div>
    )
  }

  // Desktop (≥1024px): Resizable horizontal split
  return (
    <Group
      orientation="horizontal"
      className={cn('h-full', className)}
      id="split-pane-layout"
    >
      <Panel
        id="code-editor"
        defaultSize={50}
        minSize={MIN_PANE_SIZE_PERCENT}
        className="min-w-[300px]"
      >
        {editorPane}
      </Panel>

      <ResizeHandle id="resize-handle" />

      <Panel
        id="visualization"
        defaultSize={50}
        minSize={MIN_PANE_SIZE_PERCENT}
        className="min-w-[300px]"
      >
        {previewPane}
      </Panel>
    </Group>
  )
}
