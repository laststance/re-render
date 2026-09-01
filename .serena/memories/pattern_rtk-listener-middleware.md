## Pattern: RTK Listener Middleware for Redux Side Effects

**Context**: When a React hook bridges two Redux slices (subscribes to slice A, dispatches to slice B), the hook adds a React render cycle to the pipeline. RTK listener middleware eliminates this.

**Solution**: Use `createListenerMiddleware` to intercept actions and dispatch side-effect actions synchronously.

**Example** (from this project):
```typescript
// src/store/listenerMiddleware.ts
import { createListenerMiddleware } from '@reduxjs/toolkit'

export const listenerMiddleware = createListenerMiddleware()
const startAppListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()

startAppListening({
  actionCreator: recordRender,
  effect: (action, { getState, dispatch }) => {
    if (getState().toast.suppressToasts) return
    // buffer + debounce + dispatch addToast/addBatchToast
  },
})

// Store config:
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().prepend(listenerMiddleware.middleware)
```

**Gotcha**: When using debounced dispatch (setTimeout inside effect), re-check state at flush time — the state may have changed since the event was buffered (race condition).

**When to Use**: 
- Hook subscribes to Redux state only to dispatch to another slice
- useEffect-based side effects that don't need React rendering
- Need testable side-effect logic outside of component tree
