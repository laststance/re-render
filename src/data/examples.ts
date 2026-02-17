import type { ExampleCategory } from '@/types'

/**
 * All re-render examples organized by category.
 * Categories: conditions (re-render triggers), optimization (preventing re-renders with memo/useCallback/useMemo)
 */
export const exampleCategories: ExampleCategory[] = [
  {
    id: 'conditions',
    name: 'Re-render Conditions',
    examples: [
      {
        id: 'state-change',
        title: 'State Change',
        description: 'How useState triggers re-renders in a component',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { useState } from 'react'
import { Heading, Button } from './ui'

function App() {
  const [count, setCount] = useState(0)

  // Every click triggers a re-render
  return (
    <div className="app">
      <Heading>Count: {count}</Heading>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  )
}

export default App`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

export function Button({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'heading', name: 'Heading', renderCount: 0 },
            { id: 'button', name: 'Button', renderCount: 0 },
          ],
        },
        memoEffect: 'no-effect',
        explanation: {
          content:
            'When you call a state setter function (like setCount), React schedules a re-render of that component. During the re-render, the component function runs again from top to bottom, and useState returns the new state value.',
          keyPoints: [
            'Calling setState always schedules a re-render (unless the new value is Object.is equal to the old)',
            'The component function runs completely during each render',
            'React batches multiple setState calls into a single re-render for performance',
            'State updates are asynchronous - the new value is available on the next render',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'State change triggers re-render:',
              code: `const [count, setCount] = useState(0)

// This schedules a re-render
setCount(count + 1)

// Functional update (recommended)
setCount(prev => prev + 1)`,
            },
          ],
          docLinks: [
            {
              label: 'React useState',
              url: 'https://react.dev/reference/react/useState',
            },
            {
              label: 'Queueing State Updates',
              url: 'https://react.dev/learn/queueing-a-series-of-state-updates',
            },
          ],
        },
      },
      {
        id: 'props-change',
        title: 'Props Change',
        description: 'How parent state changes cause child re-renders',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { useState } from 'react'
import { Heading } from './ui'
import { Counter } from './Counter'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <Heading>Parent</Heading>
      {/* Counter re-renders when count changes */}
      <Counter count={count} setCount={setCount} />
    </div>
  )
}

export default App`,
          },
          {
            id: 'counter',
            filename: 'Counter.tsx',
            language: 'typescript',
            code: `import { Text, Button } from './ui'

interface CounterProps {
  count: number
  setCount: (count: number) => void
}

export function Counter({ count, setCount }: CounterProps) {
  // Re-renders when count prop changes
  return (
    <div className="counter">
      <Text>Count: {count}</Text>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  )
}`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

export function Text({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

export function Button({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'heading', name: 'Heading', renderCount: 0 },
            {
              id: 'counter',
              name: 'Counter',
              renderCount: 0,
              children: [
                { id: 'text-count', name: 'Text', renderCount: 0 },
                { id: 'button', name: 'Button', renderCount: 0 },
              ],
            },
          ],
        },
        memoEffect: 'no-effect',
        explanation: {
          content:
            'When a parent component passes props to a child, any change to those props causes the child to re-render. This is fundamental to React\'s data flow: data flows down through props, and when that data changes, the receiving components update.',
          keyPoints: [
            'Child components re-render when their props change',
            'React uses Object.is comparison to detect prop changes',
            'Even if a prop looks the same, a new object/array/function reference counts as a change',
            'This is why memoization (React.memo) can be useful for expensive children',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'Props flow down from parent to child:',
              code: `// Parent owns the state
const [count, setCount] = useState(0)

// Child receives via props
<Counter count={count} setCount={setCount} />`,
            },
          ],
          docLinks: [
            {
              label: 'Passing Props',
              url: 'https://react.dev/learn/passing-props-to-a-component',
            },
            {
              label: 'React.memo',
              url: 'https://react.dev/reference/react/memo',
            },
          ],
        },
      },
      {
        id: 'parent-rerender',
        title: 'Parent Re-render',
        description: 'Why children re-render when parent state changes',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { useState } from 'react'
import { Heading, Button } from './ui'
import { Child } from './Child'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <Heading>Count: {count}</Heading>
      <Button onClick={() => setCount(c => c + 1)}>
        Increment
      </Button>
      {/* Child re-renders even though props don't change! */}
      <Child name="Alice" />
    </div>
  )
}

export default App`,
          },
          {
            id: 'child',
            filename: 'Child.tsx',
            language: 'typescript',
            code: `import { Text } from './ui'

interface ChildProps {
  name: string
}

export function Child({ name }: ChildProps) {
  // This logs on every parent re-render!
  console.log('Child rendered')

  return (
    <div className="child">
      <Text>Hello, {name}!</Text>
    </div>
  )
}`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

export function Text({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

export function Button({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'heading', name: 'Heading', renderCount: 0, memoProtected: true },
            { id: 'button', name: 'Button', renderCount: 0, memoProtected: true },
            {
              id: 'child',
              name: 'Child',
              renderCount: 0,
              memoProtected: true,
              children: [
                { id: 'text-hello', name: 'Text', renderCount: 0, memoProtected: true },
              ],
            },
          ],
        },
        memoEffect: 'prevents',
        explanation: {
          content:
            'This is one of the most important concepts in React: when a parent component re-renders, ALL of its children re-render by default, even if their props haven\'t changed. This is because React can\'t know in advance whether the child\'s output depends on something that changed.',
          keyPoints: [
            'Parent re-render causes all children to re-render by default',
            'This happens even if the child\'s props are unchanged',
            'Use React.memo() to skip re-renders when props are unchanged',
            'This behavior ensures UI consistency but can impact performance',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'Child re-renders even with unchanged props:',
              code: `function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
      {/* Re-renders on every click! */}
      <Child name="Alice" />
    </>
  )
}`,
            },
          ],
          docLinks: [
            {
              label: 'Render and Commit',
              url: 'https://react.dev/learn/render-and-commit',
            },
            {
              label: 'React.memo',
              url: 'https://react.dev/reference/react/memo',
            },
          ],
        },
      },
      {
        id: 'context-change',
        title: 'Context Change',
        description: 'How useContext triggers re-renders when context value updates',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { useState } from 'react'
import { Heading } from './ui'
import { CountProvider } from './CountContext'
import { CountDisplay } from './CountDisplay'
import { CountButton } from './CountButton'

function App() {
  const [count, setCount] = useState(0)

  return (
    <CountProvider value={{ count, setCount }}>
      <div className="app">
        <Heading>Context Re-renders</Heading>
        {/* Both consumers re-render when count changes */}
        <CountDisplay />
        <CountButton />
      </div>
    </CountProvider>
  )
}

export default App`,
          },
          {
            id: 'context',
            filename: 'CountContext.tsx',
            language: 'typescript',
            code: `import { createContext, useContext, ReactNode } from 'react'

interface CountContextValue {
  count: number
  setCount: (count: number) => void
}

const CountContext = createContext<CountContextValue | null>(null)

export function CountProvider({
  children,
  value
}: {
  children: ReactNode
  value: CountContextValue
}) {
  return (
    <CountContext.Provider value={value}>
      {children}
    </CountContext.Provider>
  )
}

export function useCount() {
  const ctx = useContext(CountContext)
  if (!ctx) throw new Error('useCount must be in CountProvider')
  return ctx
}`,
          },
          {
            id: 'display',
            filename: 'CountDisplay.tsx',
            language: 'typescript',
            code: `import { Text } from './ui'
import { useCount } from './CountContext'

export function CountDisplay() {
  const { count } = useCount()

  // Re-renders whenever context value changes
  console.log('CountDisplay rendered')

  return (
    <div className="display">
      <Text>Count: {count}</Text>
    </div>
  )
}`,
          },
          {
            id: 'button',
            filename: 'CountButton.tsx',
            language: 'typescript',
            code: `import { Button } from './ui'
import { useCount } from './CountContext'

export function CountButton() {
  const { count, setCount } = useCount()

  // Also re-renders on context change
  console.log('CountButton rendered')

  return (
    <Button onClick={() => setCount(count + 1)}>
      Increment
    </Button>
  )
}`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

export function Text({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

export function Button({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            {
              id: 'count-provider',
              name: 'CountProvider',
              renderCount: 0,
              children: [
                { id: 'heading', name: 'Heading', renderCount: 0 },
                {
                  id: 'count-display',
                  name: 'CountDisplay',
                  renderCount: 0,
                  children: [
                    { id: 'text-count', name: 'Text', renderCount: 0 },
                  ],
                },
                {
                  id: 'count-button',
                  name: 'CountButton',
                  renderCount: 0,
                  children: [{ id: 'button', name: 'Button', renderCount: 0 }],
                },
              ],
            },
          ],
        },
        memoEffect: 'no-effect',
        explanation: {
          content:
            'Context provides a way to pass data through the component tree without passing props manually at every level. When a context value changes, ALL components that consume that context (via useContext) will re-render, regardless of whether they use the specific piece of data that changed.',
          keyPoints: [
            'All context consumers re-render when the provider value changes',
            'Even if a consumer only uses part of the context, it re-renders on any change',
            'Split context by update frequency to avoid unnecessary re-renders',
            'Consider memoizing the context value object to prevent reference changes',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'Context consumers re-render on any value change:',
              code: `// Provider
<CountProvider value={{ count, setCount }}>
  <CountDisplay />  {/* Re-renders */}
  <CountButton />   {/* Re-renders */}
</CountProvider>

// Consumer
const { count } = useContext(CountContext)`,
            },
          ],
          docLinks: [
            {
              label: 'useContext',
              url: 'https://react.dev/reference/react/useContext',
            },
            {
              label: 'Scaling with Context',
              url: 'https://react.dev/learn/scaling-up-with-reducer-and-context',
            },
          ],
        },
      },
      {
        id: 'force-update',
        title: 'Force Update',
        description: 'Forcing re-renders with key prop changes and useReducer',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { useState, useReducer } from 'react'
import { Heading, Button } from './ui'
import { Timer } from './Timer'

function App() {
  const [timerId, setTimerId] = useState(1)
  // useReducer trick for force update
  const [, forceUpdate] = useReducer(x => x + 1, 0)

  return (
    <div className="app">
      <Heading>Force Update Patterns</Heading>

      {/* Method 1: Key prop change remounts component */}
      <Timer key={timerId} id={timerId} />
      <Button onClick={() => setTimerId(id => id + 1)}>
        Reset Timer (key change)
      </Button>

      {/* Method 2: useReducer force update */}
      <Button onClick={forceUpdate}>
        Force Re-render (useReducer)
      </Button>
    </div>
  )
}

export default App`,
          },
          {
            id: 'timer',
            filename: 'Timer.tsx',
            language: 'typescript',
            code: `import { useState, useEffect } from 'react'
import { Text } from './ui'

interface TimerProps {
  id: number
}

export function Timer({ id }: TimerProps) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    console.log('Timer mounted with id:', id)
    const interval = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)

    return () => {
      console.log('Timer unmounted')
      clearInterval(interval)
    }
  }, [id])

  return (
    <div className="timer">
      <Text>Timer #{id}: {seconds}s</Text>
      <Text className="hint">
        Key change unmounts → remounts → state resets
      </Text>
    </div>
  )
}`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

export function Text({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={className}>{children}</p>
}

export function Button({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'heading', name: 'Heading', renderCount: 0 },
            {
              id: 'timer',
              name: 'Timer',
              renderCount: 0,
              children: [
                { id: 'text-seconds', name: 'Text', renderCount: 0 },
                { id: 'text-hint', name: 'Text', renderCount: 0 },
              ],
            },
            { id: 'btn-reset', name: 'Button', renderCount: 0 },
            { id: 'btn-force', name: 'Button', renderCount: 0 },
          ],
        },
        memoEffect: 'no-effect',
        explanation: {
          content:
            'Sometimes you need to force a component to re-render or reset its state entirely. React provides two patterns: changing the key prop (which unmounts and remounts the component) and using useReducer as a force update mechanism.',
          keyPoints: [
            'Changing the key prop unmounts the old component and mounts a new one',
            'Key change resets all internal state (like a factory reset)',
            'useReducer with a counter pattern forces re-render without state reset',
            'Force updates should be used sparingly - usually there\'s a better pattern',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'Two patterns for forcing updates:',
              code: `// 1. Key change = unmount + remount (state resets)
<Timer key={timerId} id={timerId} />

// 2. useReducer trick = re-render only
const [, forceUpdate] = useReducer(x => x + 1, 0)
<button onClick={forceUpdate}>Force Re-render</button>`,
            },
          ],
          docLinks: [
            {
              label: 'Preserving and Resetting State',
              url: 'https://react.dev/learn/preserving-and-resetting-state',
            },
            {
              label: 'useReducer',
              url: 'https://react.dev/reference/react/useReducer',
            },
          ],
        },
      },
      {
        id: 'use-reducer',
        title: 'Reducer Dispatch',
        subtitle: 'useReducer',
        description: 'Complex state management with useReducer',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { useReducer } from 'react'
import { Heading, Text, Button, Input } from './ui'

interface State {
  count: number
  step: number
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; payload: number }
  | { type: 'reset' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step }
    case 'decrement':
      return { ...state, count: state.count - state.step }
    case 'setStep':
      return { ...state, step: action.payload }
    case 'reset':
      return { count: 0, step: 1 }
    default:
      return state
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 })

  // Every dispatch that changes state triggers re-render
  return (
    <div className="app">
      <Heading>Count: {state.count}</Heading>
      <Text>Step: {state.step}</Text>
      <Button onClick={() => dispatch({ type: 'increment' })}>
        +{state.step}
      </Button>
      <Button onClick={() => dispatch({ type: 'decrement' })}>
        -{state.step}
      </Button>
      <Input
        type="number"
        value={state.step}
        onChange={e => dispatch({
          type: 'setStep',
          payload: Number(e.target.value) || 1
        })}
      />
      <Button onClick={() => dispatch({ type: 'reset' })}>
        Reset
      </Button>
    </div>
  )
}

export default App`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

export function Text({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

export function Button({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}

export function Input({ value, onChange, placeholder, type }: {
  value?: string | number; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string
}) {
  return <input value={value} onChange={onChange} placeholder={placeholder} type={type} />
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'heading', name: 'Heading', renderCount: 0 },
            { id: 'text-step', name: 'Text', renderCount: 0 },
            { id: 'btn-inc', name: 'Button', renderCount: 0 },
            { id: 'btn-dec', name: 'Button', renderCount: 0 },
            { id: 'input', name: 'Input', renderCount: 0 },
            { id: 'btn-reset', name: 'Button', renderCount: 0 },
          ],
        },
        memoEffect: 'no-effect',
        explanation: {
          content:
            'useReducer is an alternative to useState for complex state logic. It triggers re-renders the same way useState does - whenever the returned state object is different (via Object.is comparison). The key difference is that state transitions are centralized in a reducer function.',
          keyPoints: [
            'dispatch() triggers re-render only if reducer returns a new state object',
            'Returning the same state reference (state) from reducer skips re-render',
            'useReducer is ideal when next state depends on previous state',
            'Actions are predictable and can be logged/replayed for debugging',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'Reducer returns new state = re-render:',
              code: `function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      // New object = re-render
      return { ...state, count: state.count + 1 }
    case 'noop':
      // Same reference = no re-render
      return state
  }
}`,
            },
          ],
          docLinks: [
            {
              label: 'useReducer',
              url: 'https://react.dev/reference/react/useReducer',
            },
            {
              label: 'Extracting State Logic',
              url: 'https://react.dev/learn/extracting-state-logic-into-a-reducer',
            },
          ],
        },
      },
      {
        id: 'use-sync-external-store',
        title: 'External Store',
        subtitle: 'useSyncExternalStore',
        description: 'Subscribing to external stores without tearing',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { useSyncExternalStore } from 'react'
import { Heading, Text, Button } from './ui'
import { store } from './store'

function App() {
  // Subscribe to external store
  const count = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot
  )

  return (
    <div className="app">
      <Heading>External Store</Heading>
      <Text>Count: {count}</Text>
      <Button onClick={() => store.increment()}>
        Increment
      </Button>
      <Button onClick={() => store.decrement()}>
        Decrement
      </Button>
    </div>
  )
}

export default App`,
          },
          {
            id: 'store',
            filename: 'store.ts',
            language: 'typescript',
            code: `// Simple external store (like Redux, Zustand, etc.)
type Listener = () => void

let count = 0
const listeners = new Set<Listener>()

export const store = {
  getSnapshot: () => count,

  subscribe: (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  increment: () => {
    count++
    listeners.forEach(l => l())
  },

  decrement: () => {
    count--
    listeners.forEach(l => l())
  },
}`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

export function Text({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

export function Button({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'heading', name: 'Heading', renderCount: 0 },
            { id: 'text-count', name: 'Text', renderCount: 0 },
            { id: 'btn-inc', name: 'Button', renderCount: 0 },
            { id: 'btn-dec', name: 'Button', renderCount: 0 },
          ],
        },
        memoEffect: 'no-effect',
        explanation: {
          content:
            'useSyncExternalStore is the recommended way to subscribe to external data sources (Redux, Zustand, browser APIs). It ensures consistent reads during concurrent rendering, preventing "tearing" where different parts of the UI show different versions of data.',
          keyPoints: [
            'Re-renders when getSnapshot() returns a different value',
            'subscribe() must return an unsubscribe function',
            'Prevents tearing in concurrent rendering mode',
            'Third parameter getServerSnapshot for SSR support',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'The three parts of useSyncExternalStore:',
              code: `const value = useSyncExternalStore(
  subscribe,    // (callback) => unsubscribe
  getSnapshot,  // () => currentValue
  getServerSnapshot // optional, for SSR
)

// Re-renders when getSnapshot() !== previous`,
            },
          ],
          docLinks: [
            {
              label: 'useSyncExternalStore',
              url: 'https://react.dev/reference/react/useSyncExternalStore',
            },
            {
              label: 'Subscribing to External Store',
              url: 'https://react.dev/reference/react/useSyncExternalStore#subscribing-to-an-external-store',
            },
          ],
        },
      },
      {
        id: 'suspense',
        title: 'Suspense',
        description: 'Data fetching with Suspense boundaries',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { Suspense, useState } from 'react'
import { Heading, Button } from './ui'
import { UserProfile } from './UserProfile'

function TabBar({ setUserId }: { setUserId: (id: number) => void }) {
  return (
    <div className="tabs">
      <Button onClick={() => setUserId(1)}>User 1</Button>
      <Button onClick={() => setUserId(2)}>User 2</Button>
    </div>
  )
}

function App() {
  const [userId, setUserId] = useState(1)

  return (
    <div className="app">
      <Heading>Suspense Data Fetching</Heading>
      <TabBar setUserId={setUserId} />

      {/* Suspense shows fallback while data loads */}
      <Suspense fallback={<div>Loading user...</div>}>
        <UserProfile userId={userId} />
      </Suspense>
    </div>
  )
}

export default App`,
          },
          {
            id: 'user-profile',
            filename: 'UserProfile.tsx',
            language: 'typescript',
            code: `import { use } from 'react'
import { Heading, Text } from './ui'
import { fetchUser } from './api'

interface UserProfileProps {
  userId: number
}

export function UserProfile({ userId }: UserProfileProps) {
  // use() suspends while promise is pending
  const user = use(fetchUser(userId))

  // This only renders after data is ready
  return (
    <div className="profile">
      <Heading>{user.name}</Heading>
      <Text>Email: {user.email}</Text>
    </div>
  )
}`,
          },
          {
            id: 'api',
            filename: 'api.ts',
            language: 'typescript',
            code: `interface User {
  id: number
  name: string
  email: string
}

// Simulate API with cache
const cache = new Map<number, Promise<User>>()

export function fetchUser(id: number): Promise<User> {
  if (!cache.has(id)) {
    cache.set(id, new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id,
          name: \`User \${id}\`,
          email: \`user\${id}@example.com\`
        })
      }, 1000)
    }))
  }
  return cache.get(id)!
}`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

export function Text({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

export function Button({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'heading', name: 'Heading', renderCount: 0 },
            {
              id: 'tab-bar',
              name: 'TabBar',
              renderCount: 0,
              children: [
                { id: 'btn-user1', name: 'Button', renderCount: 0 },
                { id: 'btn-user2', name: 'Button', renderCount: 0 },
              ],
            },
            {
              id: 'suspense',
              name: 'Suspense',
              renderCount: 0,
              children: [
                {
                  id: 'user-profile',
                  name: 'UserProfile',
                  renderCount: 0,
                  children: [
                    { id: 'heading-name', name: 'Heading', renderCount: 0 },
                    { id: 'text-email', name: 'Text', renderCount: 0 },
                  ],
                },
              ],
            },
          ],
        },
        memoEffect: 'no-effect',
        explanation: {
          content:
            'Suspense lets you declaratively handle loading states. When a component "suspends" (throws a promise), React shows the nearest Suspense fallback. Once the promise resolves, React re-renders the suspended component with the data.',
          keyPoints: [
            'Suspense catches promises thrown during render',
            'Fallback UI shown until all children finish loading',
            'Multiple Suspense boundaries can nest for granular loading states',
            'use() hook integrates with Suspense for data fetching',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'Suspense with the use() hook:',
              code: `<Suspense fallback={<Loading />}>
  <UserProfile userId={1} />
</Suspense>

function UserProfile({ userId }) {
  // use() suspends if promise is pending
  const user = use(fetchUser(userId))
  return <div>{user.name}</div>
}`,
            },
          ],
          docLinks: [
            {
              label: 'Suspense',
              url: 'https://react.dev/reference/react/Suspense',
            },
            {
              label: 'use() Hook',
              url: 'https://react.dev/reference/react/use',
            },
          ],
        },
      },
      {
        id: 'concurrent',
        title: 'Concurrent Update',
        subtitle: 'useTransition',
        description: 'useTransition and useDeferredValue for non-blocking updates',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { useState, useTransition, useDeferredValue } from 'react'
import { Heading, Input, Text } from './ui'
import { SlowList } from './SlowList'

function App() {
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()

  // Deferred value updates "later" without blocking
  const deferredText = useDeferredValue(text)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Immediate: update input
    setText(e.target.value)
  }

  return (
    <div className="app">
      <Heading>Concurrent Rendering</Heading>
      <Input
        value={text}
        onChange={handleChange}
        placeholder="Type to filter..."
      />
      {isPending && <Text>Updating...</Text>}

      {/* SlowList uses deferred value, won't block typing */}
      <SlowList text={deferredText} />
    </div>
  )
}

export default App`,
          },
          {
            id: 'slow-list',
            filename: 'SlowList.tsx',
            language: 'typescript',
            code: `import { memo } from 'react'
import { ListItem } from './ui'

interface SlowListProps {
  text: string
}

// Memo to skip re-renders when text unchanged
export const SlowList = memo(function SlowList({ text }: SlowListProps) {
  // Simulate slow render
  const items = []
  for (let i = 0; i < 200; i++) {
    items.push(
      <SlowItem key={i} text={text} />
    )
  }

  return <ul>{items}</ul>
})

function SlowItem({ text }: { text: string }) {
  // Artificial slowdown
  const startTime = performance.now()
  while (performance.now() - startTime < 1) {
    // Block for 1ms per item
  }

  return <ListItem>{text}</ListItem>
}`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

export function Text({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

export function Input({ value, onChange, placeholder, type }: {
  value?: string | number; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string
}) {
  return <input value={value} onChange={onChange} placeholder={placeholder} type={type} />
}

export function ListItem({ children }: { children: ReactNode }) {
  return <li>{children}</li>
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'heading', name: 'Heading', renderCount: 0 },
            { id: 'input', name: 'Input', renderCount: 0 },
            { id: 'text-pending', name: 'Text', renderCount: 0 },
            {
              id: 'slow-list',
              name: 'SlowList',
              renderCount: 0,
              children: [
                { id: 'list-item', name: 'ListItem', renderCount: 0 },
              ],
            },
          ],
        },
        memoEffect: 'no-effect',
        explanation: {
          content:
            'Concurrent features let React interrupt expensive renders to keep the UI responsive. useTransition marks updates as non-urgent, while useDeferredValue creates a "lagging" copy of a value that updates during idle time.',
          keyPoints: [
            'useTransition: wrap slow setState in startTransition() to keep UI responsive',
            'useDeferredValue: creates a deferred copy that "lags behind" the real value',
            'Both prevent expensive renders from blocking user input',
            'isPending from useTransition indicates background work in progress',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'useTransition vs useDeferredValue:',
              code: `// useTransition: you control when to defer
const [isPending, startTransition] = useTransition()
startTransition(() => setFilter(value))

// useDeferredValue: React controls deferral
const deferredValue = useDeferredValue(value)
// deferredValue updates "later" during idle time`,
            },
          ],
          docLinks: [
            {
              label: 'useTransition',
              url: 'https://react.dev/reference/react/useTransition',
            },
            {
              label: 'useDeferredValue',
              url: 'https://react.dev/reference/react/useDeferredValue',
            },
          ],
        },
      },
      {
        id: 'use-effect-deps',
        title: 'Effect Dependencies',
        subtitle: 'useEffect',
        description: 'How useEffect dependencies control re-runs',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { useState, useEffect } from 'react'
import { Heading, Text, Button, Input } from './ui'

function App() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  // Effect runs only when count changes
  useEffect(() => {
    console.log('Count effect:', count)
    document.title = \`Count: \${count}\`

    return () => {
      console.log('Count cleanup:', count)
    }
  }, [count]) // Dependency array

  // Effect runs only on mount (empty deps)
  useEffect(() => {
    console.log('Mount effect')
    return () => console.log('Unmount cleanup')
  }, [])

  // Effect runs on EVERY render (no deps array)
  useEffect(() => {
    console.log('Every render effect')
  })

  return (
    <div className="app">
      <Heading>Effect Dependencies</Heading>
      <Text>Count: {count}</Text>
      <Button onClick={() => setCount(c => c + 1)}>
        Increment (triggers count effect)
      </Button>
      <Input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type (no effect)"
      />
    </div>
  )
}

export default App`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

export function Text({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

export function Button({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}

export function Input({ value, onChange, placeholder, type }: {
  value?: string | number; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string
}) {
  return <input value={value} onChange={onChange} placeholder={placeholder} type={type} />
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'heading', name: 'Heading', renderCount: 0 },
            { id: 'text-count', name: 'Text', renderCount: 0 },
            { id: 'button', name: 'Button', renderCount: 0 },
            { id: 'input', name: 'Input', renderCount: 0 },
          ],
        },
        memoEffect: 'no-effect',
        explanation: {
          content:
            'useEffect dependencies control WHEN the effect runs, not whether the component re-renders. The component re-renders whenever state changes, but the effect only re-runs when its dependencies change. This is a common source of confusion.',
          keyPoints: [
            'Component re-renders on ANY state change',
            'Effect only re-runs when dependencies change',
            'Empty deps [] = run once on mount, cleanup on unmount',
            'No deps array = run after every render',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'Three dependency patterns:',
              code: `// Runs when count changes
useEffect(() => { ... }, [count])

// Runs once on mount
useEffect(() => { ... }, [])

// Runs after every render
useEffect(() => { ... })

// Component re-renders regardless of effect deps!`,
            },
          ],
          docLinks: [
            {
              label: 'useEffect',
              url: 'https://react.dev/reference/react/useEffect',
            },
            {
              label: 'Lifecycle of Effects',
              url: 'https://react.dev/learn/lifecycle-of-reactive-effects',
            },
          ],
        },
      },
      {
        id: 'ref-vs-state',
        title: 'Ref Mutation',
        description: 'Why refs don\'t trigger re-renders',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { useState, useRef } from 'react'
import { Heading, Text, Button } from './ui'

function StateSection({ stateCount, onIncrement }: { stateCount: number; onIncrement: () => void }) {
  return (
    <div className="state-box">
      <Text>State count: {stateCount}</Text>
      <Button onClick={onIncrement}>
        Increment State (re-renders)
      </Button>
    </div>
  )
}

function RefSection({ refCount, onIncrement }: { refCount: number; onIncrement: () => void }) {
  return (
    <div className="ref-box">
      <Text>Ref count: {refCount}</Text>
      <Button onClick={onIncrement}>
        Increment Ref (no re-render)
      </Button>
      <Text className="hint">
        Check console - ref changes but UI won't update!
      </Text>
    </div>
  )
}

function App() {
  const [stateCount, setStateCount] = useState(0)
  const refCount = useRef(0)

  const handleStateIncrement = () => {
    setStateCount(c => c + 1) // Triggers re-render
  }

  const handleRefIncrement = () => {
    refCount.current++ // NO re-render!
    console.log('Ref value:', refCount.current)
  }

  console.log('App rendered')

  return (
    <div className="app">
      <Heading>Refs vs State</Heading>
      <StateSection stateCount={stateCount} onIncrement={handleStateIncrement} />
      <RefSection refCount={refCount.current} onIncrement={handleRefIncrement} />
    </div>
  )
}

export default App`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

export function Text({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={className}>{children}</p>
}

export function Button({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'heading', name: 'Heading', renderCount: 0 },
            {
              id: 'state-section',
              name: 'StateSection',
              renderCount: 0,
              children: [
                { id: 'text-state', name: 'Text', renderCount: 0 },
                { id: 'btn-state', name: 'Button', renderCount: 0 },
              ],
            },
            {
              id: 'ref-section',
              name: 'RefSection',
              renderCount: 0,
              children: [
                { id: 'text-ref', name: 'Text', renderCount: 0 },
                { id: 'btn-ref', name: 'Button', renderCount: 0 },
                { id: 'text-hint', name: 'Text', renderCount: 0 },
              ],
            },
          ],
        },
        memoEffect: 'not-applicable',
        explanation: {
          content:
            'useRef creates a mutable container that persists across renders but doesn\'t trigger re-renders when changed. This is fundamentally different from useState - refs are for values you need to track without affecting the UI.',
          keyPoints: [
            'Changing ref.current does NOT trigger re-render',
            'State changes always trigger re-render',
            'Refs persist across renders like state',
            'Use refs for: DOM elements, timers, previous values, instance variables',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'State vs Ref behavior:',
              code: `const [count, setCount] = useState(0)
const countRef = useRef(0)

setCount(1)      // Re-renders component
countRef.current = 1  // No re-render!

// Ref is useful for tracking without UI updates
// e.g., timer IDs, previous values, DOM references`,
            },
          ],
          docLinks: [
            {
              label: 'useRef',
              url: 'https://react.dev/reference/react/useRef',
            },
            {
              label: 'Referencing Values with Refs',
              url: 'https://react.dev/learn/referencing-values-with-refs',
            },
          ],
        },
      },
      {
        id: 'compound-component',
        title: 'Compound Component',
        tag: 'Pattern',
        description: 'Context-based sub-components all re-render when shared state changes',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { Heading } from './ui'
import { Select } from './Select'

function App() {
  return (
    <div className="app">
      <Heading>Compound Component Pattern</Heading>
      <Select>
        <Select.Trigger />
        <Select.Options>
          <Select.Option value="react">React</Select.Option>
          <Select.Option value="vue">Vue</Select.Option>
          <Select.Option value="svelte">Svelte</Select.Option>
        </Select.Options>
      </Select>
    </div>
  )
}

export default App`,
          },
          {
            id: 'select',
            filename: 'Select.tsx',
            language: 'typescript',
            code: `import { createContext, useContext, useState, ReactNode } from 'react'

interface SelectContextValue {
  selected: string
  setSelected: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

function useSelect() {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error('Must be inside <Select>')
  return ctx
}

function Select({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <SelectContext.Provider value={{ selected, setSelected, isOpen, setIsOpen }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  )
}

function Trigger() {
  const { selected, isOpen, setIsOpen } = useSelect()
  // Re-renders on ANY context change (selected OR isOpen)
  console.log('Trigger rendered')
  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      {selected || 'Choose...'} {isOpen ? '▲' : '▼'}
    </button>
  )
}

function Options({ children }: { children: ReactNode }) {
  const { isOpen } = useSelect()
  // Re-renders on ANY context change
  console.log('Options rendered')
  if (!isOpen) return null
  return <ul className="options">{children}</ul>
}

function Option({ value, children }: { value: string; children: ReactNode }) {
  const { selected, setSelected, setIsOpen } = useSelect()
  // Each Option re-renders when ANY context changes
  console.log('Option rendered:', value)
  return (
    <li
      className={selected === value ? 'active' : ''}
      onClick={() => { setSelected(value); setIsOpen(false) }}
    >
      {children}
    </li>
  )
}

Select.Trigger = Trigger
Select.Options = Options
Select.Option = Option

export { Select }`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'heading', name: 'Heading', renderCount: 0 },
            {
              id: 'select',
              name: 'Select',
              renderCount: 0,
              children: [
                { id: 'trigger', name: 'Select.Trigger', renderCount: 0 },
                {
                  id: 'options',
                  name: 'Select.Options',
                  renderCount: 0,
                  children: [
                    { id: 'option-1', name: 'Select.Option', renderCount: 0 },
                    { id: 'option-2', name: 'Select.Option', renderCount: 0 },
                    { id: 'option-3', name: 'Select.Option', renderCount: 0 },
                  ],
                },
              ],
            },
          ],
        },
        memoEffect: 'no-effect',
        explanation: {
          content:
            'This is not a new re-render trigger — it\'s a component pattern where existing triggers (context changes) propagate differently. The Compound Component pattern uses Context to share state between related sub-components (like Select.Trigger, Select.Options, Select.Option). The tradeoff: when ANY piece of shared context changes, ALL consumers re-render, even if they only read part of the context.',
          keyPoints: [
            'All sub-components share a single Context provider',
            'Changing any context value re-renders every consumer',
            'Opening the dropdown re-renders Trigger, Options, AND all Options',
            'Selecting an option re-renders everything too, not just the selected one',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'Context change cascades to all consumers:',
              code: `// Selecting an option changes "selected" in context
setSelected(value)
setIsOpen(false)

// ALL of these re-render:
// - Trigger (reads selected + isOpen)
// - Options (reads isOpen)
// - Every Option (reads selected)`,
            },
          ],
          docLinks: [
            {
              label: 'useContext',
              url: 'https://react.dev/reference/react/useContext',
            },
            {
              label: 'Compound Components Pattern',
              url: 'https://react.dev/learn/passing-data-deeply-with-context',
            },
          ],
        },
      },
      {
        id: 'render-props',
        title: 'Render Props',
        tag: 'Pattern',
        description: 'Render function creates new JSX each call, causing re-renders',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { Heading } from './ui'
import { MouseTracker } from './MouseTracker'
import { DisplayCoords } from './DisplayCoords'

function App() {
  return (
    <div className="app">
      <Heading>Render Props Pattern</Heading>
      <MouseTracker
        render={({ x, y }) => <DisplayCoords x={x} y={y} />}
      />
    </div>
  )
}

export default App`,
          },
          {
            id: 'mouse-tracker',
            filename: 'MouseTracker.tsx',
            language: 'typescript',
            code: `import { useState, ReactNode } from 'react'

interface MousePosition {
  x: number
  y: number
}

interface MouseTrackerProps {
  render: (position: MousePosition) => ReactNode
}

export function MouseTracker({ render }: MouseTrackerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Every mouse move updates state → re-render
  const handleMouseMove = (e: React.MouseEvent) => {
    setPosition({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    })
  }

  console.log('MouseTracker rendered')

  return (
    <div
      className="tracker"
      onMouseMove={handleMouseMove}
      style={{ height: 200, border: '1px solid gray' }}
    >
      {/* render() creates NEW JSX every call */}
      {render(position)}
    </div>
  )
}`,
          },
          {
            id: 'display-coords',
            filename: 'DisplayCoords.tsx',
            language: 'typescript',
            code: `import { Text } from './ui'

interface DisplayCoordsProps {
  x: number
  y: number
}

export function DisplayCoords({ x, y }: DisplayCoordsProps) {
  // Re-renders on every mouse move because
  // parent calls render() which creates new JSX
  console.log('DisplayCoords rendered')

  return (
    <div className="coords">
      <Text>Mouse position: ({x}, {y})</Text>
    </div>
  )
}`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

export function Text({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'heading', name: 'Heading', renderCount: 0 },
            {
              id: 'mouse-tracker',
              name: 'MouseTracker',
              renderCount: 0,
              children: [
                {
                  id: 'display-coords',
                  name: 'DisplayCoords',
                  renderCount: 0,
                  children: [
                    { id: 'text-coords', name: 'Text', renderCount: 0 },
                  ],
                },
              ],
            },
          ],
        },
        memoEffect: 'no-effect',
        explanation: {
          content:
            'This is not a new re-render trigger — it\'s a component pattern where existing triggers (state/props changes) cause re-renders in a specific way. The Render Props pattern passes a function that returns JSX. Because the render function is called on every parent render, it creates new React elements each time. Both the wrapper component and the rendered content re-render together on every state change.',
          keyPoints: [
            'render() is called on every MouseTracker render, creating new JSX',
            'DisplayCoords gets new props each time (even if x,y are same object shape)',
            'Unlike children pattern, render props cannot have stable references',
            'Custom hooks have largely replaced this pattern in modern React',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'Render prop creates new JSX every call:',
              code: `// This arrow function creates NEW JSX each render
<MouseTracker
  render={({ x, y }) => <DisplayCoords x={x} y={y} />}
/>

// Each mouse move:
// 1. MouseTracker re-renders (state change)
// 2. Calls render() → new JSX tree
// 3. DisplayCoords re-renders (new element)`,
            },
          ],
          docLinks: [
            {
              label: 'Render Props',
              url: 'https://react.dev/learn/passing-props-to-a-component',
            },
            {
              label: 'Custom Hooks vs Render Props',
              url: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'optimization',
    name: 'Optimization',
    examples: [
      {
        id: 'usecallback',
        title: 'useCallback',
        description: 'Stabilizing function references for memoized children',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { useState, useCallback } from 'react'
import { Input, Text } from './ui'
import { MemoButton } from './MemoButton'

function App() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  // useCallback stabilizes the function reference
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1)
  }, [])

  return (
    <div className="app">
      <Input value={text} onChange={e => setText(e.target.value)} />
      <Text>Count: {count}</Text>
      {/* Button won't re-render when text changes */}
      <MemoButton onClick={handleIncrement}>Increment</MemoButton>
    </div>
  )
}

export default App`,
          },
          {
            id: 'memo-button',
            filename: 'MemoButton.tsx',
            language: 'typescript',
            code: `import { memo, ReactNode } from 'react'
import { Button } from './ui'

interface MemoButtonProps {
  onClick: () => void
  children: ReactNode
}

export const MemoButton = memo(function MemoButton({
  onClick,
  children
}: MemoButtonProps) {
  console.log('MemoButton rendered')

  return (
    <Button onClick={onClick} className="button">
      {children}
    </Button>
  )
})`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Text({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

export function Button({ onClick, children, className }: { onClick?: () => void; children: ReactNode; className?: string }) {
  return <button onClick={onClick} className={className}>{children}</button>
}

export function Input({ value, onChange, placeholder, type }: {
  value?: string | number; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string
}) {
  return <input value={value} onChange={onChange} placeholder={placeholder} type={type} />
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'input', name: 'Input', renderCount: 0 },
            { id: 'text-count', name: 'Text', renderCount: 0 },
            {
              id: 'memo-button',
              name: 'MemoButton',
              renderCount: 0,
              memoProtected: true,
              children: [
                { id: 'button', name: 'Button', renderCount: 0, memoProtected: true },
              ],
            },
          ],
        },
        memoEffect: 'prevents',
        explanation: {
          content:
            'useCallback memoizes a function reference between renders. This is essential when passing callbacks to memoized children, because without useCallback, each render creates a new function reference, breaking the memo optimization.',
          keyPoints: [
            'Every render creates new function references by default',
            'New function references break memo() optimization',
            'useCallback returns the same function reference if dependencies unchanged',
            'Always pair useCallback with memo() on the receiving component',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'Stabilizing callback references:',
              code: `// Without useCallback: new function every render
const handleClick = () => setCount(c => c + 1)

// With useCallback: same reference if deps unchanged
const handleClick = useCallback(() => {
  setCount(c => c + 1)
}, []) // Empty deps = never changes`,
            },
          ],
          docLinks: [
            {
              label: 'useCallback',
              url: 'https://react.dev/reference/react/useCallback',
            },
            {
              label: 'useCallback vs useMemo',
              url: 'https://react.dev/reference/react/useCallback#how-is-usecallback-related-to-usememo',
            },
          ],
        },
      },
      {
        id: 'usememo',
        title: 'useMemo',
        description: 'Memoizing expensive computations',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { useState, useMemo } from 'react'
import { Input, Text, Button } from './ui'

function App() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  // useMemo caches the result until count changes
  const expensiveValue = useMemo(() => {
    console.log('Computing expensive value...')
    return count * 100
  }, [count])

  return (
    <div className="app">
      <Input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type here (no recomputation)"
      />
      <Text>Expensive value: {expensiveValue}</Text>
      <Button onClick={() => setCount(c => c + 1)}>
        Increment (triggers recomputation)
      </Button>
    </div>
  )
}

export default App`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Text({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

export function Button({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}

export function Input({ value, onChange, placeholder, type }: {
  value?: string | number; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string
}) {
  return <input value={value} onChange={onChange} placeholder={placeholder} type={type} />
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'input', name: 'Input', renderCount: 0 },
            { id: 'text-value', name: 'Text', renderCount: 0, memoProtected: true },
            { id: 'button', name: 'Button', renderCount: 0, memoProtected: true },
          ],
        },
        memoEffect: 'prevents',
        explanation: {
          content:
            'useMemo caches the result of an expensive calculation between renders. The cached value is only recalculated when one of its dependencies changes. This prevents wasteful recalculation when unrelated state changes cause re-renders.',
          keyPoints: [
            'useMemo caches computation results, not components',
            'Only recalculates when dependencies change',
            'Useful for expensive calculations or stable object references',
            'Don\'t overuse - React is fast, measure before optimizing',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'Caching expensive computations:',
              code: `// Without useMemo: runs on every render
const expensiveValue = computeExpensive(count)

// With useMemo: only runs when count changes
const expensiveValue = useMemo(() => {
  return computeExpensive(count)
}, [count])`,
            },
          ],
          docLinks: [
            {
              label: 'useMemo',
              url: 'https://react.dev/reference/react/useMemo',
            },
            {
              label: 'When to use useMemo',
              url: 'https://react.dev/reference/react/useMemo#should-you-add-usememo-everywhere',
            },
          ],
        },
      },
      {
        id: 'react-lazy',
        title: 'React.lazy',
        description: 'Code splitting with lazy loading and Suspense',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { lazy, Suspense, useState } from 'react'
import { Heading, Button } from './ui'

// Lazy load the heavy component
const HeavyChart = lazy(() => import('./HeavyChart'))

function App() {
  const [showChart, setShowChart] = useState(false)

  return (
    <div className="app">
      <Heading>Code Splitting Demo</Heading>
      <Button onClick={() => setShowChart(s => !s)}>
        {showChart ? 'Hide' : 'Show'} Chart
      </Button>

      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          {/* HeavyChart chunk loads only when needed */}
          <HeavyChart />
        </Suspense>
      )}
    </div>
  )
}

export default App`,
          },
          {
            id: 'heavy-chart',
            filename: 'HeavyChart.tsx',
            language: 'typescript',
            code: `import { Heading, Text } from './ui'

// This component is in a separate chunk
// It only loads when first rendered

export default function HeavyChart() {
  // Imagine this imports a large charting library
  console.log('HeavyChart loaded and rendered')

  return (
    <div className="chart">
      <Heading>Heavy Chart Component</Heading>
      <Text>This component was lazy loaded!</Text>
      <Text className="chart-placeholder">
        📊 Chart visualization here
      </Text>
    </div>
  )
}`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

export function Text({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={className}>{children}</p>
}

export function Button({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            { id: 'heading', name: 'Heading', renderCount: 0 },
            { id: 'button', name: 'Button', renderCount: 0 },
            {
              id: 'suspense',
              name: 'Suspense',
              renderCount: 0,
              children: [
                {
                  id: 'heavy-chart',
                  name: 'HeavyChart',
                  renderCount: 0,
                  children: [
                    { id: 'heading-chart', name: 'Heading', renderCount: 0 },
                    { id: 'text-loaded', name: 'Text', renderCount: 0 },
                    { id: 'text-chart', name: 'Text', renderCount: 0 },
                  ],
                },
              ],
            },
          ],
        },
        memoEffect: 'not-applicable',
        explanation: {
          content:
            'React.lazy enables code splitting by loading components on demand. Combined with Suspense, it lets you show a fallback UI while the component code is being downloaded. This reduces initial bundle size and improves load performance.',
          keyPoints: [
            'React.lazy takes a function that returns a dynamic import()',
            'The component only loads when it\'s first rendered',
            'Suspense provides the fallback UI during loading',
            'Error boundaries can catch loading failures',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'Lazy loading with Suspense:',
              code: `const HeavyChart = lazy(() => import('./HeavyChart'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyChart />
    </Suspense>
  )
}`,
            },
          ],
          docLinks: [
            {
              label: 'React.lazy',
              url: 'https://react.dev/reference/react/lazy',
            },
            {
              label: 'Suspense',
              url: 'https://react.dev/reference/react/Suspense',
            },
          ],
        },
      },
      {
        id: 'children-pattern',
        title: 'Children Pattern',
        description: 'Using composition to prevent unnecessary re-renders',
        files: [
          {
            id: 'app',
            filename: 'App.tsx',
            language: 'typescript',
            code: `import { useState } from 'react'
import { ExpensiveTree } from './ExpensiveTree'

// ❌ Bad: ExpensiveTree re-renders on every color change
function BadApp() {
  const [color, setColor] = useState('red')
  return (
    <div style={{ color }}>
      <input value={color} onChange={e => setColor(e.target.value)} />
      <ExpensiveTree />  {/* Re-renders every time! */}
    </div>
  )
}

// ✅ Good: Lift state up and pass children
function ColorPicker({ children }: { children: React.ReactNode }) {
  const [color, setColor] = useState('red')
  return (
    <div style={{ color }}>
      <input value={color} onChange={e => setColor(e.target.value)} />
      {children}  {/* Children don't re-render! */}
    </div>
  )
}

function App() {
  return (
    <ColorPicker>
      <ExpensiveTree />  {/* Stable reference, no re-render */}
    </ColorPicker>
  )
}

export default App`,
          },
          {
            id: 'expensive-tree',
            filename: 'ExpensiveTree.tsx',
            language: 'typescript',
            code: `import { Heading, Text, List, ListItem } from './ui'

// Imagine this is a complex component tree
export function ExpensiveTree() {
  console.log('ExpensiveTree rendered')

  return (
    <div className="expensive">
      <Heading>Expensive Component</Heading>
      <Text>This component has many children...</Text>
      <List>
        <ListItem>Item 1</ListItem>
        <ListItem>Item 2</ListItem>
        <ListItem>Item 3</ListItem>
      </List>
    </div>
  )
}`,
          },
          {
            id: 'ui',
            filename: 'ui.tsx',
            language: 'typescript',
            code: `import { ReactNode } from 'react'

export function Heading({ children }: { children: ReactNode }) {
  return <h2>{children}</h2>
}

export function Text({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

export function Input({ value, onChange, placeholder, type }: {
  value?: string | number; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string
}) {
  return <input value={value} onChange={onChange} placeholder={placeholder} type={type} />
}

export function List({ children }: { children: ReactNode }) {
  return <ul>{children}</ul>
}

export function ListItem({ children }: { children: ReactNode }) {
  return <li>{children}</li>
}`,
          },
        ],
        componentTree: {
          id: 'app',
          name: 'App',
          renderCount: 0,
          children: [
            {
              id: 'color-picker',
              name: 'ColorPicker',
              renderCount: 0,
              children: [
                { id: 'input', name: 'Input', renderCount: 0 },
                {
                  id: 'expensive-tree',
                  name: 'ExpensiveTree',
                  renderCount: 0,
                  memoProtected: true,
                  children: [
                    { id: 'heading', name: 'Heading', renderCount: 0, memoProtected: true },
                    { id: 'text-info', name: 'Text', renderCount: 0, memoProtected: true },
                    {
                      id: 'list',
                      name: 'List',
                      renderCount: 0,
                      memoProtected: true,
                      children: [
                        { id: 'item-1', name: 'ListItem', renderCount: 0, memoProtected: true },
                        { id: 'item-2', name: 'ListItem', renderCount: 0, memoProtected: true },
                        { id: 'item-3', name: 'ListItem', renderCount: 0, memoProtected: true },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        memoEffect: 'prevents',
        explanation: {
          content:
            'The children pattern is a powerful composition technique that avoids unnecessary re-renders without needing memo. When you pass components as children, they\'re created in the parent scope and their reference stays stable, even when the wrapper component re-renders.',
          keyPoints: [
            'Children are created in parent scope = stable references',
            'The wrapper can re-render without re-rendering children',
            'No memo() needed - composition handles optimization naturally',
            'Also known as "lift content up" or "slots" pattern',
          ],
          codeSnippets: [
            {
              language: 'typescript',
              caption: 'Moving state closer with composition:',
              code: `// ❌ Bad: ExpensiveTree re-renders on color change
function App() {
  const [color, setColor] = useState('red')
  return <div><Input /><ExpensiveTree /></div>
}

// ✅ Good: Composition isolates the state
<ColorPicker>
  <ExpensiveTree />  {/* Stable reference! */}
</ColorPicker>`,
            },
          ],
          docLinks: [
            {
              label: 'Passing JSX as Children',
              url: 'https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children',
            },
            {
              label: 'Extracting State Logic',
              url: 'https://react.dev/learn/extracting-state-logic-into-a-reducer',
            },
          ],
        },
      },
    ],
  },
]

/**
 * Get all examples as a flat array.
 */
export function getAllExamples() {
  return exampleCategories.flatMap((cat) => cat.examples)
}

/**
 * Find an example by category and example ID.
 */
export function getExample(categoryId: string, exampleId: string) {
  const category = exampleCategories.find((cat) => cat.id === categoryId)
  return category?.examples.find((ex) => ex.id === exampleId)
}

/**
 * Get the first example for navigation default.
 */
export function getDefaultExample() {
  return {
    categoryId: exampleCategories[0].id,
    exampleId: exampleCategories[0].examples[0].id,
  }
}

/**
 * Get previous and next examples in the recommended learning order.
 * Navigates across category boundaries (conditions → optimization).
 * @param categoryId - Current category
 * @param exampleId - Current example
 * @returns Previous and next example with their category, or null if at boundary
 * @example
 * getAdjacentExamples('conditions', 'props-change')
 * // => { prev: { categoryId: 'conditions', exampleId: 'state-change', title: 'State Change' },
 * //      next: { categoryId: 'conditions', exampleId: 'parent-rerender', title: 'Parent Re-render' } }
 */
export function getAdjacentExamples(categoryId: string, exampleId: string) {
  const allExamples = exampleCategories.flatMap((cat) =>
    cat.examples.map((ex) => ({ categoryId: cat.id, exampleId: ex.id, title: ex.title }))
  )
  const currentIndex = allExamples.findIndex(
    (ex) => ex.categoryId === categoryId && ex.exampleId === exampleId
  )
  if (currentIndex === -1) {
    return { prev: null, next: null, step: 0, total: allExamples.length }
  }
  return {
    prev: currentIndex > 0 ? allExamples[currentIndex - 1] : null,
    next: currentIndex < allExamples.length - 1 ? allExamples[currentIndex + 1] : null,
    step: currentIndex + 1,
    total: allExamples.length,
  }
}
