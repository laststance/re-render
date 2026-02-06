/**
 * Static map of all 20 examples with route info and trigger labels.
 * Mirrors src/data/triggerConfig.ts for test data.
 */

interface ExampleInfo {
  categoryId: string
  exampleId: string
  title: string
  triggers: string[]
}

export const examples: ExampleInfo[] = [
  // Without memo (13)
  {
    categoryId: 'without-memo',
    exampleId: 'state-change',
    title: 'State Change',
    triggers: ['Trigger State Change'],
  },
  {
    categoryId: 'without-memo',
    exampleId: 'props-change',
    title: 'Props Change',
    triggers: ['Trigger Props Change'],
  },
  {
    categoryId: 'without-memo',
    exampleId: 'parent-rerender',
    title: 'Parent Re-render',
    triggers: ['Trigger Parent Re-render'],
  },
  {
    categoryId: 'without-memo',
    exampleId: 'context-change',
    title: 'Context Change',
    triggers: ['Trigger Context Change'],
  },
  {
    categoryId: 'without-memo',
    exampleId: 'force-update',
    title: 'Force Update',
    triggers: ['Reset Timer (Key Change)', 'Force Re-render'],
  },
  {
    categoryId: 'without-memo',
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
    categoryId: 'without-memo',
    exampleId: 'use-sync-external-store',
    title: 'useSyncExternalStore',
    triggers: ['Store Increment', 'Store Decrement'],
  },
  {
    categoryId: 'without-memo',
    exampleId: 'suspense',
    title: 'Suspense',
    triggers: ['Switch User'],
  },
  {
    categoryId: 'without-memo',
    exampleId: 'concurrent',
    title: 'Concurrent Features',
    triggers: ['Type Character', 'Clear Input'],
  },
  {
    categoryId: 'without-memo',
    exampleId: 'use-effect-deps',
    title: 'useEffect Dependencies',
    triggers: ['Increment Count', 'Type Character'],
  },
  {
    categoryId: 'without-memo',
    exampleId: 'ref-vs-state',
    title: 'Ref vs State',
    triggers: ['Increment State', 'Increment Ref'],
  },
  {
    categoryId: 'without-memo',
    exampleId: 'compound-component',
    title: 'Compound Component',
    triggers: ['Select Option', 'Toggle Dropdown'],
  },
  {
    categoryId: 'without-memo',
    exampleId: 'render-props',
    title: 'Render Props',
    triggers: ['Simulate Mouse Move'],
  },
  // With memo (7)
  {
    categoryId: 'with-memo',
    exampleId: 'memo',
    title: 'React.memo',
    triggers: ['Trigger Parent State Change'],
  },
  {
    categoryId: 'with-memo',
    exampleId: 'usecallback',
    title: 'useCallback',
    triggers: ['Trigger Increment', 'Trigger Text Input'],
  },
  {
    categoryId: 'with-memo',
    exampleId: 'usememo',
    title: 'useMemo',
    triggers: ['Trigger Recomputation', 'Type Without Recomputation'],
  },
  {
    categoryId: 'with-memo',
    exampleId: 'react-lazy',
    title: 'React.lazy',
    triggers: ['Toggle Chart'],
  },
  {
    categoryId: 'with-memo',
    exampleId: 'children-pattern',
    title: 'Children Pattern',
    triggers: ['Change Color'],
  },
  {
    categoryId: 'with-memo',
    exampleId: 'usecallback-comparison',
    title: 'useCallback Comparison',
    triggers: ['Type Text', 'Increment Count'],
  },
  {
    categoryId: 'with-memo',
    exampleId: 'usememo-comparison',
    title: 'useMemo Comparison',
    triggers: ['Type Text', 'Increment Count'],
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
export const categoryIds = ['without-memo', 'with-memo'] as const

/** Category display names. */
export const categoryNames: Record<string, string> = {
  'without-memo': 'Without memo',
  'with-memo': 'With memo',
}
