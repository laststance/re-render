import { Separator } from 'react-resizable-panels'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

interface ResizeHandleProps {
  className?: string
  id?: string
}

/**
 * Visual resize handle for split-pane layout
 * Shows a grip indicator and changes cursor/appearance on hover
 */
export function ResizeHandle({ className, id }: ResizeHandleProps) {
  return (
    <Separator
      id={id}
      className={cn(
        'relative flex w-2 items-center justify-center bg-border transition-colors',
        'hover:bg-muted-foreground/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'data-[resize-handle-active]:bg-muted-foreground/30',
        className
      )}
      style={{ touchAction: 'none' }}
    >
      <div className="z-10 flex h-8 w-4 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
    </Separator>
  )
}
