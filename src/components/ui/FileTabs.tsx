import { FileTab } from './FileTab'
import { cn } from '@/lib/utils'
import type { CodeFile } from '@/types/code'

interface FileTabsProps {
  files: CodeFile[]
  activeFileId: string
  onFileSelect: (fileId: string) => void
  className?: string
}

/**
 * Horizontal tab bar for navigating between code files
 * Handles overflow with horizontal scroll on smaller screens
 */
export function FileTabs({
  files,
  activeFileId,
  onFileSelect,
  className,
}: FileTabsProps) {
  return (
    <div
      className={cn(
        'flex overflow-x-auto border-b border-[var(--border)] bg-[var(--muted)]',
        'scrollbar-thin scrollbar-thumb-[var(--muted-foreground)] scrollbar-track-transparent',
        className
      )}
      role="tablist"
      aria-label="Code files"
    >
      {files.map((file) => (
        <FileTab
          key={file.id}
          filename={file.filename}
          isActive={file.id === activeFileId}
          onClick={() => onFileSelect(file.id)}
        />
      ))}
    </div>
  )
}
