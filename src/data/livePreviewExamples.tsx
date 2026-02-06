/**
 * Live preview components for re-render examples.
 *
 * Each preview demonstrates the actual UI described in the code example,
 * wrapped with LivePreviewWrapper components to show component boundaries.
 *
 * Components expose trigger handlers via forwardRef + useImperativeHandle
 * for the TriggerPanel to invoke re-render conditions.
 */
import { useState, forwardRef, useImperativeHandle } from 'react'
import { LivePreviewWrapper } from '@/components/visualization'

/**
 * Handle type for triggering re-renders from parent components.
 */
export interface LivePreviewHandle {
  trigger: (triggerId: string) => void
}

/**
 * State Change example preview.
 * Shows a simple counter that updates state on click.
 */
export const StateChangePreview = forwardRef<LivePreviewHandle>(
  function StateChangePreview(_props, ref) {
    const [count, setCount] = useState(0)

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'increment') {
          setCount((c) => c + 1)
        }
      },
    }))

    return (
      <LivePreviewWrapper componentName="App" deps={{ state: { count } }}>
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Heading">
            <h1 className="text-xl font-semibold">Count: {count}</h1>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Button">
            <button
              onClick={() => setCount(count + 1)}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Increment
            </button>
          </LivePreviewWrapper>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * Props Change example preview.
 * Shows parent-child relationship with prop passing.
 */
export const PropsChangePreview = forwardRef<LivePreviewHandle>(
  function PropsChangePreview(_props, ref) {
    const [count, setCount] = useState(0)

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'increment') {
          setCount((c) => c + 1)
        }
      },
    }))

    return (
      <LivePreviewWrapper componentName="App" deps={{ state: { count } }}>
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Heading">
            <h1 className="text-lg font-medium text-muted-foreground">Parent</h1>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Counter" deps={{ props: { count } }}>
            <div className="space-y-2 rounded border border-border bg-muted/30 p-3">
              <LivePreviewWrapper componentName="Text">
                <p>Count: {count}</p>
              </LivePreviewWrapper>
              <LivePreviewWrapper componentName="Button">
                <button
                  onClick={() => setCount(count + 1)}
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                >
                  Increment
                </button>
              </LivePreviewWrapper>
            </div>
          </LivePreviewWrapper>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * Parent Re-render example preview.
 * Shows how parent state change causes child re-render.
 */
export const ParentRerenderPreview = forwardRef<LivePreviewHandle>(
  function ParentRerenderPreview(_props, ref) {
    const [count, setCount] = useState(0)

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'increment') {
          setCount((c) => c + 1)
        }
      },
    }))

    return (
      <LivePreviewWrapper componentName="App" deps={{ state: { count } }}>
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Heading">
            <h1 className="text-xl font-semibold">Count: {count}</h1>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Button">
            <button
              onClick={() => setCount((c) => c + 1)}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Increment
            </button>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Child">
            <div className="rounded border border-border bg-muted/30 p-3">
              <LivePreviewWrapper componentName="Text">
                <p>Hello, Alice!</p>
              </LivePreviewWrapper>
            </div>
          </LivePreviewWrapper>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * Context Change example preview.
 * Shows context consumers re-rendering on context value change.
 */
export const ContextChangePreview = forwardRef<LivePreviewHandle>(
  function ContextChangePreview(_props, ref) {
    const [count, setCount] = useState(0)

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'increment') {
          setCount((c) => c + 1)
        }
      },
    }))

    return (
      <LivePreviewWrapper componentName="App" deps={{ state: { count } }}>
        <LivePreviewWrapper componentName="CountProvider" deps={{ state: { count } }}>
          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <LivePreviewWrapper componentName="Heading">
              <h1 className="text-lg font-medium">Context Re-renders</h1>
            </LivePreviewWrapper>
            <LivePreviewWrapper componentName="CountDisplay" deps={{ props: { count } }}>
              <div className="rounded border border-border bg-muted/30 p-3">
                <LivePreviewWrapper componentName="Text">
                  <p>Count: {count}</p>
                </LivePreviewWrapper>
              </div>
            </LivePreviewWrapper>
            <LivePreviewWrapper componentName="CountButton">
              <button
                onClick={() => setCount(count + 1)}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              >
                Increment
              </button>
            </LivePreviewWrapper>
          </div>
        </LivePreviewWrapper>
      </LivePreviewWrapper>
    )
  }
)

/**
 * Force Update example preview.
 * Shows key prop and useReducer force update patterns.
 */
export const ForceUpdatePreview = forwardRef<LivePreviewHandle>(
  function ForceUpdatePreview(_props, ref) {
    const [timerId, setTimerId] = useState(1)
    const [forceUpdateCount, forceUpdate] = useState(0)

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'reset-key') {
          setTimerId((id) => id + 1)
        } else if (triggerId === 'force-rerender') {
          forceUpdate((x) => x + 1)
        }
      },
    }))

    return (
      <LivePreviewWrapper componentName="App" deps={{ state: { timerId, forceUpdateCount } }}>
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Heading">
            <h1 className="text-lg font-medium">Force Update Patterns</h1>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Timer" key={timerId}>
            <div className="rounded border border-border bg-muted/30 p-3">
              <LivePreviewWrapper componentName="Text">
                <p>Timer #{timerId}</p>
              </LivePreviewWrapper>
              <LivePreviewWrapper componentName="Text">
                <p className="text-sm text-muted-foreground">
                  Key change unmounts → remounts → state resets
                </p>
              </LivePreviewWrapper>
            </div>
          </LivePreviewWrapper>
          <div className="flex gap-2">
            <LivePreviewWrapper componentName="Button">
              <button
                onClick={() => setTimerId((id) => id + 1)}
                className="rounded-md bg-secondary px-3 py-2 text-secondary-foreground hover:bg-secondary/80"
              >
                Reset Timer (key change)
              </button>
            </LivePreviewWrapper>
            <LivePreviewWrapper componentName="Button">
              <button
                onClick={() => forceUpdate((x) => x + 1)}
                className="rounded-md bg-secondary px-3 py-2 text-secondary-foreground hover:bg-secondary/80"
              >
                Force Re-render
              </button>
            </LivePreviewWrapper>
          </div>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * React.memo example preview.
 * Shows how memo prevents unnecessary re-renders.
 */
export const MemoPreview = forwardRef<LivePreviewHandle>(
  function MemoPreview(_props, ref) {
    const [count, setCount] = useState(0)

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'increment') {
          setCount((c) => c + 1)
        }
      },
    }))

    return (
      <LivePreviewWrapper componentName="App" deps={{ state: { count } }}>
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Heading">
            <h1 className="text-xl font-semibold">Count: {count}</h1>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Button">
            <button
              onClick={() => setCount((c) => c + 1)}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Increment
            </button>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="MemoChild">
            <div className="rounded border border-dashed border-green-500/50 bg-green-50/30 p-3 dark:bg-green-950/30">
              <LivePreviewWrapper componentName="Text">
                <p>Hello, Alice!</p>
              </LivePreviewWrapper>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                ✓ Won't re-render (memo'd)
              </p>
            </div>
          </LivePreviewWrapper>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * useCallback example preview.
 * Shows function reference stabilization.
 */
export const UseCallbackPreview = forwardRef<LivePreviewHandle>(
  function UseCallbackPreview(_props, ref) {
    const [count, setCount] = useState(0)
    const [text, setText] = useState('')

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'increment') {
          setCount((c) => c + 1)
        } else if (triggerId === 'type') {
          setText((t) => t + 'a')
        }
      },
    }))

    return (
      <LivePreviewWrapper componentName="App" deps={{ state: { count, text } }}>
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Input">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type here..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Text">
            <p>Count: {count}</p>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="MemoButton">
            <button
              onClick={() => setCount((c) => c + 1)}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Increment
            </button>
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
              ✓ Stable callback reference
            </p>
          </LivePreviewWrapper>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * useMemo example preview.
 * Shows memoized computation.
 */
export const UseMemoPreview = forwardRef<LivePreviewHandle>(
  function UseMemoPreview(_props, ref) {
    const [count, setCount] = useState(0)
    const [text, setText] = useState('')

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'increment') {
          setCount((c) => c + 1)
        } else if (triggerId === 'type') {
          setText((t) => t + 'a')
        }
      },
    }))

    // Simulated memoized value
    const expensiveValue = count * 100

    return (
      <LivePreviewWrapper componentName="App" deps={{ state: { count, text } }}>
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Input">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type here (no recomputation)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Text">
            <p>
              Expensive value: <strong>{expensiveValue}</strong>
            </p>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Button">
            <button
              onClick={() => setCount((c) => c + 1)}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Increment (triggers recomputation)
            </button>
          </LivePreviewWrapper>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * React.lazy example preview.
 * Demonstrates code splitting with lazy loading and Suspense.
 */
export const ReactLazyPreview = forwardRef<LivePreviewHandle>(
  function ReactLazyPreview(_props, ref) {
    const [showChart, setShowChart] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'toggle-chart') {
          if (!showChart) {
            // Simulate lazy loading delay
            setIsLoading(true)
            setTimeout(() => {
              setIsLoading(false)
              setShowChart(true)
            }, 800)
          } else {
            setShowChart(false)
          }
        }
      },
    }))

    const handleToggle = () => {
      if (!showChart) {
        setIsLoading(true)
        setTimeout(() => {
          setIsLoading(false)
          setShowChart(true)
        }, 800)
      } else {
        setShowChart(false)
      }
    }

    return (
      <LivePreviewWrapper componentName="App" deps={{ state: { showChart, isLoading } }}>
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Heading">
            <h1 className="text-lg font-medium">Code Splitting Demo</h1>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Button">
            <button
              onClick={handleToggle}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              {showChart ? 'Hide' : 'Show'} Chart
            </button>
          </LivePreviewWrapper>
          {(isLoading || showChart) && (
            <LivePreviewWrapper componentName="Suspense">
              <div className="rounded border border-border bg-muted/30 p-4">
                {isLoading ? (
                  <LivePreviewWrapper componentName="Fallback">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading chart...
                    </div>
                  </LivePreviewWrapper>
                ) : (
                  <LivePreviewWrapper componentName="HeavyChart">
                    <div className="space-y-2">
                      <h2 className="font-medium">Heavy Chart Component</h2>
                      <p className="text-sm text-muted-foreground">
                        This component was lazy loaded!
                      </p>
                      <div className="flex h-20 items-center justify-center rounded bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-2xl">
                        📊 Chart visualization
                      </div>
                    </div>
                  </LivePreviewWrapper>
                )}
              </div>
            </LivePreviewWrapper>
          )}
          <p className="text-xs text-muted-foreground">
            💡 The chart chunk only loads when you click "Show Chart"
          </p>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * Children Pattern example preview.
 * Demonstrates composition to prevent unnecessary re-renders.
 */
export const ChildrenPatternPreview = forwardRef<LivePreviewHandle>(
  function ChildrenPatternPreview(_props, ref) {
    const [color, setColor] = useState('blue')
    const [pickerRenderCount, setPickerRenderCount] = useState(1)

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'change-color') {
          const colors = ['blue', 'red', 'green', 'purple', 'orange']
          const currentIndex = colors.indexOf(color)
          const nextColor = colors[(currentIndex + 1) % colors.length]
          setColor(nextColor)
          setPickerRenderCount((c) => c + 1)
        }
      },
    }))

    const handleColorChange = (newColor: string) => {
      setColor(newColor)
      setPickerRenderCount((c) => c + 1)
    }

    return (
      <LivePreviewWrapper componentName="App">
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="ColorPicker">
            <div
              className="space-y-3 rounded border border-border p-3 transition-colors"
              style={{ borderColor: color }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ColorPicker</span>
                <span className="text-xs text-muted-foreground">
                  renders: {pickerRenderCount}
                </span>
              </div>
              <LivePreviewWrapper componentName="Input">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  style={{ color }}
                />
              </LivePreviewWrapper>
              {/* Children passed from parent - won't re-render! */}
              <LivePreviewWrapper componentName="ExpensiveTree">
                <div className="rounded border border-dashed border-green-500/50 bg-green-50/30 p-3 dark:bg-green-950/30">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">ExpensiveTree</span>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      renders: 1
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Complex component tree...
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Item 1</li>
                    <li>• Item 2</li>
                    <li>• Item 3</li>
                  </ul>
                  <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                    ✓ Passed as children - stable reference!
                  </p>
                </div>
              </LivePreviewWrapper>
            </div>
          </LivePreviewWrapper>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * useReducer example preview.
 * Shows complex state management with actions.
 */
export const UseReducerPreview = forwardRef<LivePreviewHandle>(
  function UseReducerPreview(_props, ref) {
    const [count, setCount] = useState(0)
    const [step, setStep] = useState(1)

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        switch (triggerId) {
          case 'increment':
            setCount((c) => c + step)
            break
          case 'decrement':
            setCount((c) => c - step)
            break
          case 'set-step':
            setStep((s) => (s === 1 ? 5 : 1))
            break
          case 'reset':
            setCount(0)
            setStep(1)
            break
        }
      },
    }))

    return (
      <LivePreviewWrapper componentName="App">
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Heading">
            <h1 className="text-xl font-semibold">Count: {count}</h1>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Text">
            <p className="text-muted-foreground">Step: {step}</p>
          </LivePreviewWrapper>
          <div className="flex flex-wrap gap-2">
            <LivePreviewWrapper componentName="Button">
              <button
                onClick={() => setCount((c) => c + step)}
                className="rounded-md bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90"
              >
                +{step}
              </button>
            </LivePreviewWrapper>
            <LivePreviewWrapper componentName="Button">
              <button
                onClick={() => setCount((c) => c - step)}
                className="rounded-md bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90"
              >
                -{step}
              </button>
            </LivePreviewWrapper>
            <LivePreviewWrapper componentName="Input">
              <input
                type="number"
                value={step}
                onChange={(e) => setStep(Number(e.target.value) || 1)}
                className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </LivePreviewWrapper>
            <LivePreviewWrapper componentName="Button">
              <button
                onClick={() => {
                  setCount(0)
                  setStep(1)
                }}
                className="rounded-md bg-secondary px-3 py-2 text-secondary-foreground hover:bg-secondary/80"
              >
                Reset
              </button>
            </LivePreviewWrapper>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Each action dispatches to reducer → new state → re-render
          </p>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * useSyncExternalStore example preview.
 * Shows subscribing to external store.
 */
export const UseSyncExternalStorePreview = forwardRef<LivePreviewHandle>(
  function UseSyncExternalStorePreview(_props, ref) {
    const [count, setCount] = useState(0)

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'increment') {
          setCount((c) => c + 1)
        } else if (triggerId === 'decrement') {
          setCount((c) => c - 1)
        }
      },
    }))

    return (
      <LivePreviewWrapper componentName="App">
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Heading">
            <h1 className="text-lg font-medium">External Store</h1>
          </LivePreviewWrapper>
          <div className="rounded border border-dashed border-blue-500/50 bg-blue-50/30 p-3 dark:bg-blue-950/30">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              📦 store.getSnapshot() → {count}
            </p>
          </div>
          <LivePreviewWrapper componentName="Text">
            <p className="text-xl">Count: {count}</p>
          </LivePreviewWrapper>
          <div className="flex gap-2">
            <LivePreviewWrapper componentName="Button">
              <button
                onClick={() => setCount((c) => c + 1)}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              >
                Increment
              </button>
            </LivePreviewWrapper>
            <LivePreviewWrapper componentName="Button">
              <button
                onClick={() => setCount((c) => c - 1)}
                className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80"
              >
                Decrement
              </button>
            </LivePreviewWrapper>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Store notifies subscribers → getSnapshot() called → re-render if
            changed
          </p>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * Suspense example preview.
 * Shows data fetching with loading states.
 */
export const SuspensePreview = forwardRef<LivePreviewHandle>(
  function SuspensePreview(_props, ref) {
    const [userId, setUserId] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [userData, setUserData] = useState({ name: 'User 1', email: 'user1@example.com' })

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'switch-user') {
          const newId = userId === 1 ? 2 : 1
          setUserId(newId)
          setIsLoading(true)
          setTimeout(() => {
            setUserData({
              name: `User ${newId}`,
              email: `user${newId}@example.com`,
            })
            setIsLoading(false)
          }, 1000)
        }
      },
    }))

    const handleSwitchUser = (id: number) => {
      if (id !== userId) {
        setUserId(id)
        setIsLoading(true)
        setTimeout(() => {
          setUserData({
            name: `User ${id}`,
            email: `user${id}@example.com`,
          })
          setIsLoading(false)
        }, 1000)
      }
    }

    return (
      <LivePreviewWrapper componentName="App">
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Heading">
            <h1 className="text-lg font-medium">Suspense Data Fetching</h1>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="TabBar">
          <div className="flex gap-2">
            <LivePreviewWrapper componentName="Button">
              <button
                onClick={() => handleSwitchUser(1)}
                className={`rounded-md px-4 py-2 ${
                  userId === 1
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                User 1
              </button>
            </LivePreviewWrapper>
            <LivePreviewWrapper componentName="Button">
              <button
                onClick={() => handleSwitchUser(2)}
                className={`rounded-md px-4 py-2 ${
                  userId === 2
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                User 2
              </button>
            </LivePreviewWrapper>
          </div>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Suspense">
            <div className="rounded border border-border bg-muted/30 p-4">
              {isLoading ? (
                <LivePreviewWrapper componentName="Fallback">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading user...
                  </div>
                </LivePreviewWrapper>
              ) : (
                <LivePreviewWrapper componentName="UserProfile">
                  <div className="space-y-1">
                    <h2 className="font-medium">{userData.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Email: {userData.email}
                    </p>
                  </div>
                </LivePreviewWrapper>
              )}
            </div>
          </LivePreviewWrapper>
          <p className="text-xs text-muted-foreground">
            💡 Suspense shows fallback while use() promise is pending
          </p>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * Concurrent features example preview.
 * Shows useTransition and useDeferredValue.
 */
export const ConcurrentPreview = forwardRef<LivePreviewHandle>(
  function ConcurrentPreview(_props, ref) {
    const [text, setText] = useState('')
    const [isPending, setIsPending] = useState(false)
    const [deferredText, setDeferredText] = useState('')

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'type') {
          const newText = text + 'a'
          setText(newText)
          setIsPending(true)
          // Simulate deferred update
          setTimeout(() => {
            setDeferredText(newText)
            setIsPending(false)
          }, 300)
        } else if (triggerId === 'clear') {
          setText('')
          setDeferredText('')
        }
      },
    }))

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newText = e.target.value
      setText(newText)
      setIsPending(true)
      // Simulate deferred update
      setTimeout(() => {
        setDeferredText(newText)
        setIsPending(false)
      }, 300)
    }

    return (
      <LivePreviewWrapper componentName="App">
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Heading">
            <h1 className="text-lg font-medium">Concurrent Rendering</h1>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Input">
            <input
              value={text}
              onChange={handleChange}
              placeholder="Type to filter..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </LivePreviewWrapper>
          {isPending && (
            <LivePreviewWrapper componentName="Text">
              <p className="text-sm text-muted-foreground">⏳ Updating...</p>
            </LivePreviewWrapper>
          )}
          <LivePreviewWrapper componentName="SlowList">
            <div className="rounded border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SlowList</span>
                <span className="text-xs text-muted-foreground">
                  deferred: "{deferredText}"
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded bg-secondary/50 px-2 py-1 text-sm">
                    Item {i}: {deferredText || '(empty)'}
                  </div>
                ))}
              </div>
            </div>
          </LivePreviewWrapper>
          <p className="text-xs text-muted-foreground">
            💡 Input updates immediately, list uses deferred value
          </p>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * useEffect dependencies example preview.
 * Shows how effect deps control when effects run.
 */
export const UseEffectDepsPreview = forwardRef<LivePreviewHandle>(
  function UseEffectDepsPreview(_props, ref) {
    const [count, setCount] = useState(0)
    const [text, setText] = useState('')
    const [effectLog, setEffectLog] = useState<string[]>(['Mount effect'])

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'increment') {
          setCount((c) => c + 1)
          setEffectLog((log) => [...log.slice(-4), `Count effect: ${count + 1}`])
        } else if (triggerId === 'type') {
          setText((t) => t + 'a')
          setEffectLog((log) => [...log.slice(-4), 'Every render effect'])
        }
      },
    }))

    const handleIncrement = () => {
      setCount((c) => c + 1)
      setEffectLog((log) => [...log.slice(-4), `Count effect: ${count + 1}`])
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value)
      setEffectLog((log) => [...log.slice(-4), 'Every render effect'])
    }

    return (
      <LivePreviewWrapper componentName="App">
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Heading">
            <h1 className="text-lg font-medium">Effect Dependencies</h1>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Text">
            <p>Count: {count}</p>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Button">
            <button
              onClick={handleIncrement}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Increment (triggers count effect)
            </button>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Input">
            <input
              value={text}
              onChange={handleTextChange}
              placeholder="Type (no count effect)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </LivePreviewWrapper>
          <div className="rounded border border-border bg-muted/30 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Effect Log:
            </p>
            <div className="space-y-1 font-mono text-xs">
              {effectLog.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.includes('Count')
                      ? 'text-blue-600 dark:text-blue-400'
                      : log.includes('Mount')
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-muted-foreground'
                  }
                >
                  → {log}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Count effect only runs when count changes, not on text changes
          </p>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * Refs vs State example preview.
 * Shows that refs don't trigger re-renders.
 */
export const RefVsStatePreview = forwardRef<LivePreviewHandle>(
  function RefVsStatePreview(_props, ref) {
    const [stateCount, setStateCount] = useState(0)
    const [refValue, setRefValue] = useState(0)
    const [renderCount, setRenderCount] = useState(1)

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'increment-state') {
          setStateCount((c) => c + 1)
          setRenderCount((c) => c + 1)
        } else if (triggerId === 'increment-ref') {
          // Simulating ref behavior - no re-render, just log
          setRefValue((v) => v + 1)
        }
      },
    }))

    const handleStateIncrement = () => {
      setStateCount((c) => c + 1)
      setRenderCount((c) => c + 1)
    }

    return (
      <LivePreviewWrapper componentName="App">
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <LivePreviewWrapper componentName="Heading">
              <h1 className="text-lg font-medium">Refs vs State</h1>
            </LivePreviewWrapper>
            <span className="text-xs text-muted-foreground">
              renders: {renderCount}
            </span>
          </div>

          <LivePreviewWrapper componentName="StateSection">
            <div className="rounded border border-blue-500/50 bg-blue-50/30 p-3 dark:bg-blue-950/30">
              <LivePreviewWrapper componentName="Text">
                <p className="font-medium">State count: {stateCount}</p>
              </LivePreviewWrapper>
              <LivePreviewWrapper componentName="Button">
                <button
                  onClick={handleStateIncrement}
                  className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Increment State (re-renders)
                </button>
              </LivePreviewWrapper>
            </div>
          </LivePreviewWrapper>

          <LivePreviewWrapper componentName="RefSection">
            <div className="rounded border border-orange-500/50 bg-orange-50/30 p-3 dark:bg-orange-950/30">
              <LivePreviewWrapper componentName="Text">
                <p className="font-medium">
                  Ref count: <span className="text-muted-foreground">{refValue}</span>
                </p>
              </LivePreviewWrapper>
              <LivePreviewWrapper componentName="Button">
                <button
                  onClick={() => setRefValue((v) => v + 1)}
                  className="mt-2 rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                >
                  Increment Ref (no re-render*)
                </button>
              </LivePreviewWrapper>
              <LivePreviewWrapper componentName="Text">
                <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                  *In real code, this won't update UI until next render!
                </p>
              </LivePreviewWrapper>
            </div>
          </LivePreviewWrapper>

          <p className="text-xs text-muted-foreground">
            💡 Real useRef.current changes don't trigger re-renders
          </p>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * Compound Component example preview.
 * Shows Context-based sub-components re-rendering on shared state changes.
 */
export const CompoundComponentPreview = forwardRef<LivePreviewHandle>(
  function CompoundComponentPreview(_props, ref) {
    const [selected, setSelected] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'select-option') {
          const options = ['React', 'Vue', 'Svelte']
          const currentIndex = options.indexOf(selected)
          const next = options[(currentIndex + 1) % options.length]
          setSelected(next)
          setIsOpen(false)
        } else if (triggerId === 'toggle-open') {
          setIsOpen((o) => !o)
        }
      },
    }))

    return (
      <LivePreviewWrapper componentName="App">
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Heading">
            <h1 className="text-lg font-medium">Compound Component</h1>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="Select" deps={{ state: { selected, isOpen } }}>
            <div className="space-y-2 rounded border border-border bg-muted/30 p-3">
              <LivePreviewWrapper componentName="Select.Trigger" deps={{ props: { selected, isOpen } }}>
                <button
                  onClick={() => setIsOpen((o) => !o)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-left text-sm"
                >
                  {selected || 'Choose...'} {isOpen ? '▲' : '▼'}
                </button>
              </LivePreviewWrapper>
              {isOpen && (
                <LivePreviewWrapper componentName="Select.Options" deps={{ props: { isOpen } }}>
                  <ul className="space-y-1 rounded border border-border bg-background p-1">
                    {['React', 'Vue', 'Svelte'].map((opt) => (
                      <LivePreviewWrapper key={opt} componentName="Select.Option" deps={{ props: { selected } }}>
                        <li
                          onClick={() => {
                            setSelected(opt)
                            setIsOpen(false)
                          }}
                          className={`cursor-pointer rounded px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
                            selected === opt ? 'bg-accent font-medium' : ''
                          }`}
                        >
                          {opt}
                        </li>
                      </LivePreviewWrapper>
                    ))}
                  </ul>
                </LivePreviewWrapper>
              )}
            </div>
          </LivePreviewWrapper>
          <p className="text-xs text-muted-foreground">
            💡 All sub-components re-render when any shared context value changes
          </p>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * Render Props example preview.
 * Shows render function creates new JSX on each call.
 */
export const RenderPropsPreview = forwardRef<LivePreviewHandle>(
  function RenderPropsPreview(_props, ref) {
    const [position, setPosition] = useState({ x: 0, y: 0 })

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'move-mouse') {
          setPosition((p) => ({
            x: Math.min(p.x + 20, 200),
            y: Math.min(p.y + 10, 150),
          }))
        }
      },
    }))

    return (
      <LivePreviewWrapper componentName="App">
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <LivePreviewWrapper componentName="Heading">
            <h1 className="text-lg font-medium">Render Props</h1>
          </LivePreviewWrapper>
          <LivePreviewWrapper componentName="MouseTracker" deps={{ state: { position } }}>
            <div
              className="relative h-40 rounded border border-border bg-muted/30 p-3"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setPosition({
                  x: Math.round(e.clientX - rect.left),
                  y: Math.round(e.clientY - rect.top),
                })
              }}
            >
              <p className="text-xs text-muted-foreground">Move mouse here</p>
              <LivePreviewWrapper componentName="DisplayCoords" deps={{ props: { x: position.x, y: position.y } }}>
                <div className="mt-2 rounded bg-background/80 p-2">
                  <p className="text-sm">
                    Mouse: ({position.x}, {position.y})
                  </p>
                </div>
              </LivePreviewWrapper>
              {/* Visual cursor indicator */}
              <div
                className="pointer-events-none absolute h-2 w-2 rounded-full bg-primary"
                style={{ left: position.x - 4, top: position.y - 4 }}
              />
            </div>
          </LivePreviewWrapper>
          <p className="text-xs text-muted-foreground">
            💡 render() creates new JSX every call — both components re-render
          </p>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * useCallback Comparison example preview.
 * Before/After: useCallback without memo vs with memo.
 */
export const UseCallbackComparisonPreview = forwardRef<LivePreviewHandle>(
  function UseCallbackComparisonPreview(_props, ref) {
    const [count, setCount] = useState(0)
    const [text, setText] = useState('')
    const [beforeButtonRenders, setBeforeButtonRenders] = useState(1)
    const [afterButtonRenders, setAfterButtonRenders] = useState(1)

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'type') {
          setText((t) => t + 'a')
          setBeforeButtonRenders((c) => c + 1)
          // afterButtonRenders stays the same (memo skips)
        } else if (triggerId === 'increment') {
          setCount((c) => c + 1)
          setBeforeButtonRenders((c) => c + 1)
          setAfterButtonRenders((c) => c + 1)
        }
      },
    }))

    const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value)
      setBeforeButtonRenders((c) => c + 1)
    }

    const handleIncrement = () => {
      setCount((c) => c + 1)
      setBeforeButtonRenders((c) => c + 1)
      setAfterButtonRenders((c) => c + 1)
    }

    return (
      <LivePreviewWrapper componentName="Root">
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Before: useCallback without memo */}
            <LivePreviewWrapper componentName="BeforeApp" deps={{ state: { count, text } }}>
              <div className="space-y-2 rounded border border-red-500/30 bg-red-50/20 p-3 dark:bg-red-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">Before</span>
                  <span className="text-xs text-muted-foreground">no memo</span>
                </div>
                <input
                  value={text}
                  onChange={handleType}
                  placeholder="Type..."
                  className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                />
                <p className="text-sm">Count: {count}</p>
                <LivePreviewWrapper componentName="Button">
                  <button
                    onClick={handleIncrement}
                    className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                  >
                    Increment
                  </button>
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    renders: {beforeButtonRenders}
                  </p>
                </LivePreviewWrapper>
              </div>
            </LivePreviewWrapper>

            {/* After: useCallback + memo */}
            <LivePreviewWrapper componentName="AfterApp" deps={{ state: { count, text } }}>
              <div className="space-y-2 rounded border border-green-500/30 bg-green-50/20 p-3 dark:bg-green-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">After</span>
                  <span className="text-xs text-muted-foreground">+ memo</span>
                </div>
                <input
                  value={text}
                  onChange={handleType}
                  placeholder="Type..."
                  className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                />
                <p className="text-sm">Count: {count}</p>
                <LivePreviewWrapper componentName="MemoButton">
                  <button
                    onClick={handleIncrement}
                    className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                  >
                    Increment
                  </button>
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    renders: {afterButtonRenders}
                  </p>
                </LivePreviewWrapper>
              </div>
            </LivePreviewWrapper>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Type text — Before Button re-renders, After MemoButton stays stable
          </p>
        </div>
      </LivePreviewWrapper>
    )
  }
)

/**
 * useMemo Comparison example preview.
 * Before/After: useMemo caches value but child needs memo too.
 */
export const UseMemoComparisonPreview = forwardRef<LivePreviewHandle>(
  function UseMemoComparisonPreview(_props, ref) {
    const [count, setCount] = useState(0)
    const [text, setText] = useState('')
    const [beforeChildRenders, setBeforeChildRenders] = useState(1)
    const [afterChildRenders, setAfterChildRenders] = useState(1)

    const expensiveValue = count * 100

    useImperativeHandle(ref, () => ({
      trigger: (triggerId: string) => {
        if (triggerId === 'type') {
          setText((t) => t + 'a')
          setBeforeChildRenders((c) => c + 1)
          // afterChildRenders stays the same (memo skips)
        } else if (triggerId === 'increment') {
          setCount((c) => c + 1)
          setBeforeChildRenders((c) => c + 1)
          setAfterChildRenders((c) => c + 1)
        }
      },
    }))

    const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value)
      setBeforeChildRenders((c) => c + 1)
    }

    const handleIncrement = () => {
      setCount((c) => c + 1)
      setBeforeChildRenders((c) => c + 1)
      setAfterChildRenders((c) => c + 1)
    }

    return (
      <LivePreviewWrapper componentName="Root">
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Before: useMemo without memo */}
            <LivePreviewWrapper componentName="BeforeApp" deps={{ state: { count, text } }}>
              <div className="space-y-2 rounded border border-red-500/30 bg-red-50/20 p-3 dark:bg-red-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">Before</span>
                  <span className="text-xs text-muted-foreground">no memo</span>
                </div>
                <input
                  value={text}
                  onChange={handleType}
                  placeholder="Type..."
                  className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                />
                <button
                  onClick={handleIncrement}
                  className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                >
                  Increment
                </button>
                <LivePreviewWrapper componentName="Child">
                  <div className="rounded bg-muted/50 p-2">
                    <p className="text-sm">Computed: {expensiveValue}</p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      renders: {beforeChildRenders}
                    </p>
                  </div>
                </LivePreviewWrapper>
              </div>
            </LivePreviewWrapper>

            {/* After: useMemo + memo */}
            <LivePreviewWrapper componentName="AfterApp" deps={{ state: { count, text } }}>
              <div className="space-y-2 rounded border border-green-500/30 bg-green-50/20 p-3 dark:bg-green-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">After</span>
                  <span className="text-xs text-muted-foreground">+ memo</span>
                </div>
                <input
                  value={text}
                  onChange={handleType}
                  placeholder="Type..."
                  className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                />
                <button
                  onClick={handleIncrement}
                  className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                >
                  Increment
                </button>
                <LivePreviewWrapper componentName="MemoChild">
                  <div className="rounded bg-muted/50 p-2">
                    <p className="text-sm">Computed: {expensiveValue}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      renders: {afterChildRenders}
                    </p>
                  </div>
                </LivePreviewWrapper>
              </div>
            </LivePreviewWrapper>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Type text — Before Child re-renders, After MemoChild stays stable
          </p>
        </div>
      </LivePreviewWrapper>
    )
  }
)
