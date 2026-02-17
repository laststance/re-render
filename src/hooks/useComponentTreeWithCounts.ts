import { useMemo } from 'react'
import { useAppSelector } from '@/store/hooks'
import type { ComponentNode } from '@/types'
import type { RenderReason } from '@/types'

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

/**
 * Render reasons that indicate a genuine trigger — NOT a cascade artifact.
 * Memoized components (React.memo) skip re-renders caused by parent-rerender
 * but still re-render for state-change, props-change, context-change, force-update.
 */
const MEMO_PASSTHROUGH_REASONS: RenderReason[] = [
  'state-change',
  'props-change',
  'context-change',
  'force-update',
]

/**
 * Recursively apply simulated memoized render counts to a component tree.
 * For nodes with `memoProtected: true`, only counts from genuine trigger reasons
 * (state-change, props-change, etc.) are included — parent-rerender is excluded
 * because React.memo would prevent those.
 *
 * @param node - Static tree node, may have `memoProtected: true`
 * @param countsByReason - Per-component per-reason count map from Redux
 * @param counts - Total render counts from Redux (for non-protected nodes)
 * @returns Tree with simulated memo counts
 *
 * @example
 * // Node with memoProtected=true: only counts state-change + props-change
 * // Node without memoProtected: same as applyLiveCounts (all reasons counted)
 */
function applyMemoizedCounts(
  node: ComponentNode,
  countsByReason: Record<string, Partial<Record<RenderReason, number>>>,
  counts: Record<string, number>
): ComponentNode {
  let displayCount: number

  if (node.memoProtected) {
    // Sum only genuine trigger reasons (exclude parent-rerender and initial)
    const byReason = countsByReason[node.name] ?? {}
    const genuineCount = MEMO_PASSTHROUGH_REASONS.reduce(
      (sum, reason) => sum + (byReason[reason] ?? 0),
      0
    )
    displayCount = genuineCount
  } else {
    // Non-protected: same as child tree (subtract 1 for initial render)
    const rawCount = counts[node.name] ?? 0
    displayCount = Math.max(0, rawCount - 1)
  }

  return {
    ...node,
    renderCount: displayCount,
    children: node.children?.map((child) =>
      applyMemoizedCounts(child, countsByReason, counts)
    ),
  }
}

/**
 * Hook that simulates memoized render behavior for the `<MemoizedChild />` tree.
 *
 * Since only ONE live preview exists (not two), the memoized tree's counts
 * are computed by filtering out parent-rerender events for `memoProtected` nodes.
 * This simulates what would happen if React.memo wrapped those components.
 *
 * @param tree - Static component tree with optional `memoProtected` flags
 * @returns Tree with simulated memo counts (protected nodes show 0 for parent-rerender triggers)
 *
 * @example
 * ```tsx
 * const memoizedTree = useMemoizedTreeWithCounts(example.componentTree)
 * return <ComponentBoxView tree={memoizedTree} variant="memoized" />
 * ```
 */
export function useMemoizedTreeWithCounts(tree: ComponentNode | null): ComponentNode | null {
  const renderCounts = useAppSelector((state) => state.renderTracker.renderCounts)
  const renderCountsByReason = useAppSelector((state) => state.renderTracker.renderCountsByReason)

  return useMemo(
    () => (tree ? applyMemoizedCounts(tree, renderCountsByReason, renderCounts) : null),
    [tree, renderCountsByReason, renderCounts]
  )
}
