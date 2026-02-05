import Editor from '@monaco-editor/react'
import { cn } from '@/lib/utils'

interface CodeEditorProps {
  code: string
  language?: string
  className?: string
}

/**
 * Read-only Monaco Editor for displaying code examples
 * Supports syntax highlighting for TypeScript/React
 */
export function CodeEditor({
  code,
  language = 'typescript',
  className,
}: CodeEditorProps) {
  return (
    <div className={cn('h-full w-full overflow-hidden', className)}>
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          renderLineHighlight: 'none',
          folding: true,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
          },
        }}
      />
    </div>
  )
}
