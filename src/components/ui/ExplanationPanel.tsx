import { cn } from '@/lib/utils'
import type { ExampleExplanation } from '@/types'

interface ExplanationPanelProps {
  explanation: ExampleExplanation
}

/**
 * Always-visible panel showing detailed technical explanation of a re-render condition.
 * Includes key points, code snippets, and links to React documentation.
 * Positioned at the top of the example page for immediate educational context.
 * @example
 * <ExplanationPanel explanation={example.explanation} />
 */
export function ExplanationPanel({
  explanation,
}: ExplanationPanelProps) {
  const { content, keyPoints, codeSnippets, docLinks } = explanation

  return (
    <div className="rounded-lg border bg-card text-card-foreground">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        {/* Book icon */}
        <svg
          className="h-5 w-5 text-muted-foreground shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
        <h3 className="font-medium text-foreground">
          Understanding This Pattern
        </h3>
      </div>

      {/* Content — always visible */}
      <div className="px-4 pb-4 space-y-4">
        {/* Main explanation */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {content}
        </p>

        {/* Key points */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">
            Key Points
          </h4>
          <ul className="space-y-1.5">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                <span
                  className="text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  •
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Code snippets */}
        {codeSnippets && codeSnippets.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Code Pattern
            </h4>
            {codeSnippets.map((snippet, index) => (
              <div key={index}>
                {snippet.caption && (
                  <p className="text-xs text-muted-foreground mb-1.5">
                    {snippet.caption}
                  </p>
                )}
                <pre
                  className={cn(
                    'overflow-x-auto rounded-md',
                    'bg-secondary/50 p-3',
                    'text-xs font-mono text-foreground'
                  )}
                >
                  <code>{snippet.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* Documentation links */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">
            Learn More
          </h4>
          <div className="flex flex-wrap gap-2">
            {docLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center gap-1.5',
                  'px-3 py-1.5 rounded-md',
                  'text-sm text-primary',
                  'bg-secondary hover:bg-secondary/80',
                  'transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
              >
                {link.label}
                {/* External link icon */}
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
