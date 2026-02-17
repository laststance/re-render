import type { ReactNode } from 'react'
import type { CodeFile, ComponentNode } from '.'

/**
 * Code snippet for use in explanations
 */
export interface CodeSnippet {
  /** Language for syntax highlighting */
  language: 'typescript' | 'tsx' | 'javascript' | 'jsx'
  /** Code content */
  code: string
  /** Optional caption */
  caption?: string
}

/**
 * External documentation link
 */
export interface DocLink {
  /** Link text */
  label: string
  /** URL to documentation */
  url: string
}

/**
 * Explanation content for an example
 */
export interface ExampleExplanation {
  /** Main explanation text (can include markdown-like formatting) */
  content: string
  /** Key points to highlight */
  keyPoints: string[]
  /** Code snippets showing the pattern */
  codeSnippets?: CodeSnippet[]
  /** Links to official React documentation */
  docLinks: DocLink[]
}

/**
 * Represents a re-render example with code and component tree visualization.
 */
export interface Example {
  /** Unique identifier used in URL path */
  id: string
  /** Display title in navigation */
  title: string
  /** Brief description of what the example demonstrates */
  description: string
  /** Code files to display in the editor */
  files: CodeFile[]
  /** Component tree for visualization */
  componentTree: ComponentNode
  /** Optional live preview JSX wrapped with LivePreviewWrapper components */
  livePreview?: ReactNode
  /** Detailed explanation of the re-render condition */
  explanation?: ExampleExplanation
}

/**
 * Category grouping related examples together.
 */
export interface ExampleCategory {
  /** Category slug used in URL path (e.g., 'conditions') */
  id: string
  /** Display name in navigation */
  name: string
  /** Examples within this category */
  examples: Example[]
}

/**
 * Navigation item for sidebar display.
 */
export interface NavItem {
  /** Category or example ID */
  id: string
  /** Display label */
  label: string
  /** URL path */
  path: string
  /** Child items (for categories) */
  children?: NavItem[]
}
