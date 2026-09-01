# Pattern: Debounced Event Batching for Toast Notifications

## Context
When a single user action triggers multiple rapid-fire events (e.g., React render cascade where 5+ components re-render), creating individual toasts for each event floods the UI.

## Solution
Buffer events in a `useRef` array with a debounced `setTimeout`. After the debounce window expires (no new events), flush the buffer as a single batch.

```typescript
const bufferRef = useRef<Event[]>([])
const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

const flushBuffer = useCallback(() => {
  const batch = bufferRef.current
  bufferRef.current = []
  if (batch.length === 1) dispatch(addSingle(batch[0]))
  else if (batch.length > 1) dispatch(addBatch(batch))
}, [dispatch])

useEffect(() => {
  if (!event) return
  bufferRef.current.push(event)
  clearTimeout(timerRef.current)
  timerRef.current = setTimeout(flushBuffer, 300)
}, [event, flushBuffer])
```

## Key Details
- 300ms debounce works well for React render cascades
- Redux Toast type extended with optional `batchItems?: Item[]`
- UI split into `SingleView`/`BatchView` (explicit variant pattern, not boolean flags)
- Cleanup: clear timeout on unmount

## When to Use
- Multiple events triggered by a single user action
- Events arrive one-by-one through a reactive pipeline (Redux selector, event listener)
- Individual notifications would be noise; consolidated summary is more useful
