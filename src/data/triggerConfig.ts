import type { TriggerAction } from '@/components/ui'

/**
 * Trigger configurations for each live preview example.
 * Maps example IDs to available trigger actions.
 */
export const triggerConfigMap: Record<string, TriggerAction[]> = {
  'state-change': [
    {
      id: 'increment',
      label: 'Trigger State Change',
      description: 'Click to increment count and cause re-render',
      variant: 'state',
    },
  ],
  'props-change': [
    {
      id: 'increment',
      label: 'Trigger Props Change',
      description: 'Changes parent state, passing new props to child',
      variant: 'props',
    },
  ],
  'parent-rerender': [
    {
      id: 'increment',
      label: 'Trigger Parent Re-render',
      description: 'Parent re-renders, causing child to re-render too',
      variant: 'parent',
    },
  ],
  'context-change': [
    {
      id: 'increment',
      label: 'Trigger Context Change',
      description: 'Updates context value, re-rendering all consumers',
      variant: 'context',
    },
  ],
  'force-update': [
    {
      id: 'reset-key',
      label: 'Reset Timer (Key Change)',
      description: 'Changes key prop to remount component',
      variant: 'force',
    },
    {
      id: 'force-rerender',
      label: 'Force Re-render',
      description: 'Uses useReducer trick to force re-render',
      variant: 'force',
    },
  ],
  usecallback: [
    {
      id: 'increment',
      label: 'Trigger Increment',
      description: 'Stable callback reference prevents child re-render',
      variant: 'state',
    },
    {
      id: 'type',
      label: 'Trigger Text Input',
      description: 'Typing re-renders parent but not memoized button',
      variant: 'state',
    },
  ],
  usememo: [
    {
      id: 'increment',
      label: 'Trigger Recomputation',
      description: 'Changes count, triggering memoized computation',
      variant: 'state',
    },
    {
      id: 'type',
      label: 'Type Without Recomputation',
      description: 'Text change re-renders but skips expensive compute',
      variant: 'state',
    },
  ],
  'react-lazy': [
    {
      id: 'toggle-chart',
      label: 'Toggle Chart',
      description: 'Lazy loads the chart component with simulated delay',
      variant: 'state',
    },
  ],
  'children-pattern': [
    {
      id: 'change-color',
      label: 'Change Color',
      description: 'Updates color state in ColorPicker (ExpensiveTree unchanged)',
      variant: 'state',
    },
  ],
  'use-reducer': [
    {
      id: 'increment',
      label: 'Dispatch Increment',
      description: 'Dispatches increment action to reducer',
      variant: 'state',
    },
    {
      id: 'decrement',
      label: 'Dispatch Decrement',
      description: 'Dispatches decrement action to reducer',
      variant: 'state',
    },
    {
      id: 'set-step',
      label: 'Toggle Step',
      description: 'Changes step between 1 and 5',
      variant: 'state',
    },
    {
      id: 'reset',
      label: 'Reset State',
      description: 'Dispatches reset action to return to initial state',
      variant: 'state',
    },
  ],
  'use-sync-external-store': [
    {
      id: 'increment',
      label: 'Store Increment',
      description: 'Calls store.increment() to update external state',
      variant: 'state',
    },
    {
      id: 'decrement',
      label: 'Store Decrement',
      description: 'Calls store.decrement() to update external state',
      variant: 'state',
    },
  ],
  suspense: [
    {
      id: 'switch-user',
      label: 'Switch User',
      description: 'Fetches new user data, triggers Suspense fallback',
      variant: 'state',
    },
  ],
  concurrent: [
    {
      id: 'type',
      label: 'Type Character',
      description: 'Adds character to input, deferred update to list',
      variant: 'state',
    },
    {
      id: 'clear',
      label: 'Clear Input',
      description: 'Clears input and deferred value',
      variant: 'state',
    },
  ],
  'use-effect-deps': [
    {
      id: 'increment',
      label: 'Increment Count',
      description: 'Triggers count effect (deps: [count])',
      variant: 'state',
    },
    {
      id: 'type',
      label: 'Type Character',
      description: 'Re-renders but count effect does NOT run',
      variant: 'state',
    },
  ],
  'ref-vs-state': [
    {
      id: 'increment-state',
      label: 'Increment State',
      description: 'setState triggers re-render, UI updates',
      variant: 'state',
    },
    {
      id: 'increment-ref',
      label: 'Increment Ref',
      description: 'ref.current++ does NOT trigger re-render',
      variant: 'force',
    },
  ],
  'compound-component': [
    {
      id: 'select-option',
      label: 'Select Option',
      description: 'Changes selection — all sub-components re-render',
      variant: 'context',
    },
    {
      id: 'toggle-open',
      label: 'Toggle Dropdown',
      description: 'Opens/closes dropdown — all consumers re-render',
      variant: 'context',
    },
  ],
  'render-props': [
    {
      id: 'move-mouse',
      label: 'Simulate Mouse Move',
      description: 'Updates position state — render() creates new JSX',
      variant: 'state',
    },
  ],
}

/**
 * Get triggers for a specific example.
 */
export function getTriggers(exampleId: string): TriggerAction[] {
  return triggerConfigMap[exampleId] ?? []
}
