/**
 * Represents a component node in the component tree hierarchy
 * Used for visualizing JSX component structure as nested boxes
 */
export interface ComponentNode {
  /** Unique identifier for this node */
  id: string
  /** Component name (e.g., "App", "Counter", "div") */
  name: string
  /** Number of times this component has re-rendered */
  renderCount: number
  /** Child components nested within this component */
  children?: ComponentNode[]
}
