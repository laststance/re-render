/**
 * Static map of all 17 examples with route info and trigger labels.
 * Mirrors src/data/triggerConfig.ts for test data.
 */

interface ExampleInfo {
  categoryId: string
  exampleId: string
  title: string
  triggers: string[]
}

export const examples: ExampleInfo[] = [
  // Re-render Conditions (13)
  {
    categoryId: 'conditions',
    exampleId: 'state-change',
    title: 'State Change',
    triggers: ['Trigger State Change'],
  },
  {
    categoryId: 'conditions',
    exampleId: 'props-change',
    title: 'Props Change',
    triggers: ['Trigger Props Change'],
  },
  {
    categoryId: 'conditions',
    exampleId: 'parent-rerender',
    title: 'Parent Re-render',
    triggers: ['Trigger Parent Re-render'],
  },
  {
    categoryId: 'conditions',
    exampleId: 'context-change',
    title: 'Context Change',
    triggers: ['Trigger Context Change'],
  },
  {
    categoryId: 'conditions',
    exampleId: 'force-update',
    title: 'Force Update',
    triggers: ['Reset Timer (Key Change)', 'Force Re-render'],
  },
  {
    categoryId: 'conditions',
    exampleId: 'use-reducer',
    title: 'Reducer Dispatch',
    triggers: [
      'Dispatch Increment',
      'Dispatch Decrement',
      'Toggle Step',
      'Reset State',
    ],
  },
  {
    categoryId: 'conditions',
    exampleId: 'use-sync-external-store',
    title: 'External Store',
    triggers: ['Store Increment', 'Store Decrement'],
  },
  {
    categoryId: 'conditions',
    exampleId: 'suspense',
    title: 'Suspense',
    triggers: ['Switch User'],
  },
  {
    categoryId: 'conditions',
    exampleId: 'concurrent',
    title: 'Concurrent Update',
    triggers: ['Type Character', 'Clear Input'],
  },
  {
    categoryId: 'conditions',
    exampleId: 'use-effect-deps',
    title: 'useEffect Dependencies',
    triggers: ['Increment Count', 'Type Character'],
  },
  {
    categoryId: 'conditions',
    exampleId: 'ref-vs-state',
    title: 'Ref Mutation',
    triggers: ['Increment State', 'Increment Ref'],
  },
  {
    categoryId: 'conditions',
    exampleId: 'compound-component',
    title: 'Compound Component',
    triggers: ['Select Option', 'Toggle Dropdown'],
  },
  {
    categoryId: 'conditions',
    exampleId: 'render-props',
    title: 'Render Props',
    triggers: ['Simulate Mouse Move'],
  },
  // Optimization (4)
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
]

/**
 * Get all example paths for data-driven smoke tests.
 * @returns Array of "/{categoryId}/{exampleId}" strings
 */
export function allExamplePaths(): string[] {
  return examples.map((e) => `/${e.categoryId}/${e.exampleId}`)
}

/** Category IDs in order. */
export const categoryIds = ['conditions', 'optimization'] as const

/** Category display names. */
export const categoryNames: Record<string, string> = {
  'conditions': 'Re-render Conditions',
  'optimization': 'Optimization',
}
