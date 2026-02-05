/**
 * Static map of all 16 examples with route info and trigger labels.
 * Mirrors src/data/triggerConfig.ts for test data.
 */

interface ExampleInfo {
  categoryId: string
  exampleId: string
  title: string
  triggers: string[]
}

export const examples: ExampleInfo[] = [
  // Basics (5)
  {
    categoryId: 'basics',
    exampleId: 'state-change',
    title: 'State Change',
    triggers: ['Trigger State Change'],
  },
  {
    categoryId: 'basics',
    exampleId: 'props-change',
    title: 'Props Change',
    triggers: ['Trigger Props Change'],
  },
  {
    categoryId: 'basics',
    exampleId: 'parent-rerender',
    title: 'Parent Re-render',
    triggers: ['Trigger Parent Re-render'],
  },
  {
    categoryId: 'basics',
    exampleId: 'context-change',
    title: 'Context Change',
    triggers: ['Trigger Context Change'],
  },
  {
    categoryId: 'basics',
    exampleId: 'force-update',
    title: 'Force Update',
    triggers: ['Reset Timer (Key Change)', 'Force Re-render'],
  },
  // Optimization (5)
  {
    categoryId: 'optimization',
    exampleId: 'memo',
    title: 'React.memo',
    triggers: ['Trigger Parent State Change'],
  },
  {
    categoryId: 'optimization',
    exampleId: 'usecallback',
    title: 'useCallback',
    triggers: ['Trigger Increment', 'Trigger Text Input'],
  },
  {
    categoryId: 'optimization',
    exampleId: 'usememo',
    title: 'useMemo',
    triggers: ['Trigger Recomputation', 'Type Without Recomputation'],
  },
  {
    categoryId: 'optimization',
    exampleId: 'react-lazy',
    title: 'React.lazy',
    triggers: ['Toggle Chart'],
  },
  {
    categoryId: 'optimization',
    exampleId: 'children-pattern',
    title: 'Children Pattern',
    triggers: ['Change Color'],
  },
  // Advanced (6)
  {
    categoryId: 'advanced',
    exampleId: 'use-reducer',
    title: 'useReducer',
    triggers: [
      'Dispatch Increment',
      'Dispatch Decrement',
      'Toggle Step',
      'Reset State',
    ],
  },
  {
    categoryId: 'advanced',
    exampleId: 'use-sync-external-store',
    title: 'useSyncExternalStore',
    triggers: ['Store Increment', 'Store Decrement'],
  },
  {
    categoryId: 'advanced',
    exampleId: 'suspense',
    title: 'Suspense',
    triggers: ['Switch User'],
  },
  {
    categoryId: 'advanced',
    exampleId: 'concurrent',
    title: 'Concurrent Features',
    triggers: ['Type Character', 'Clear Input'],
  },
  {
    categoryId: 'advanced',
    exampleId: 'use-effect-deps',
    title: 'useEffect Dependencies',
    triggers: ['Increment Count', 'Type Character'],
  },
  {
    categoryId: 'advanced',
    exampleId: 'ref-vs-state',
    title: 'Ref vs State',
    triggers: ['Increment State', 'Increment Ref'],
  },
]

/**
 * Get all example paths for data-driven smoke tests.
 * @returns Array of "/{categoryId}/{exampleId}" strings
 */
export function allExamplePaths(): string[] {
  return examples.map((e) => `/${e.categoryId}/${e.exampleId}`)
}

/** Category IDs in order. */
export const categoryIds = ['basics', 'optimization', 'advanced'] as const

/** Category display names. */
export const categoryNames: Record<string, string> = {
  basics: 'Basics',
  optimization: 'Optimization',
  advanced: 'Advanced',
}
