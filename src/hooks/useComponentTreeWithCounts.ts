import { useMemo } from 'react'
import { useAppSelector } from '@/store/hooks'
import type { ComponentNode } from '@/types'

/**
 * Recursively apply live render counts to a component tree, subtracting 1
 * so the initial render shows 0 (no badge) and the first re-render shows 1.
 *
 * @param node - Static tree node from example data
 * @param counts - Live render count map from Redux store (starts at 1 for initial render)
 * @returns New tree with adjusted renderCount values
 *
 * @example
 * // After initial render: Redux count = 1 → badge shows 0
 * // After first re-render: Redux count = 2 → badge shows 1
 * applyLiveCounts(node, { App: 2 }) // => { ...node, renderCount: 1 }
 */
function applyLiveCounts(
  node: ComponentNode,
  counts: Record<string, number>
): ComponentNode {
  const rawCount = counts[node.name] ?? 0
  return {
    ...node,
    renderCount: Math.max(0, rawCount - 1),
    children: node.children?.map((child) => applyLiveCounts(child, counts)),
  }
}

/**
 * Hook that merges a static ComponentNode tree with live render counts from Redux.
 *
 * The example data defines the tree *structure* (names, hierarchy),
 * while the Redux store tracks the actual render counts at runtime.
 *
 * @param tree - Static component tree from example definition
 * @returns Tree with live renderCount values from the Redux store
 *
 * @example
 * ```tsx
 * const liveTree = useComponentTreeWithCounts(example.componentTree)
 * return <ComponentBoxView tree={liveTree} />
 * ```
 */
export function useComponentTreeWithCounts(tree: ComponentNode | null): ComponentNode | null {
  const renderCounts = useAppSelector((state) => state.renderTracker.renderCounts)

  return useMemo(
    () => (tree ? applyLiveCounts(tree, renderCounts) : null),
    [tree, renderCounts]
  )
}
