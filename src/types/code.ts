/**
 * Represents a code file for display in the editor
 */
export interface CodeFile {
  id: string
  filename: string
  code: string
  language?: string
}
