# QA Report: Functional Correctness - Demo Accuracy

**Tester**: functional-tester
**Date**: 2026-02-17
**Scope**: All 17 examples across 2 categories
**Method**: Playwright browser testing + source code analysis
**Severity Levels**: P0 (critical), P1 (major), P2 (minor)

---

## Executive Summary

**Overall Functional Score: 55% (significant issues found)**

The user's concern is validated: *"re-renderされないはずのコンポーネントがre-renderされていたり、Toastの内容が正しいのかも怪しい"* (Components that shouldn't re-render ARE re-rendering, and toast content accuracy is questionable).

Three **P0 critical** issues and three **P1 major** issues were identified. The core problem is that render counts displayed to users are inflated by Redux cascade renders, and toast "reason" labels often misattribute the cause of re-renders.

---

## P0 Critical Issues

### P0-1: Render Count Inflation (All 17 Examples)

**Impact**: Every example shows inflated render counts that do not match the educational intent.

**Evidence**: On Example 1 (state-change), after a single trigger click:
- **Expected**: App: 1->2, Heading: 1->2, Button: 1->2 (one re-render per component)
- **Actual**: All components jumped from 1 to **9** in a single click

**Root Cause** (`src/hooks/useRenderTracker.ts` line 196):
```typescript
renderCountRef.current += 1  // Increments on EVERY render invocation
```

The `renderCountRef` counts ALL renders, including:
1. **React StrictMode double-invocation** (dev mode only, `reactStrictMode: true` in `next.config.ts`) -- doubles every render count
2. **Redux cascade renders**: `recordRender` dispatch -> Redux store update -> `useComponentTreeWithCounts` subscription fires -> ExamplePage re-renders -> all LivePreviewWrappers cascade re-render
3. **Multiple dispatch cascades**: Each of N components dispatches independently, each causing a new cascade

The `dispatchInFlightRef` guard (line 256) only filters cascade renders within a *single* wrapper's lifecycle, but N wrappers each dispatch separately, so each wrapper's dispatch causes cascading re-renders in the other N-1 wrappers.

**Consequence**: Users see numbers like 9 or 13 when they expect 2. This undermines the educational purpose of the tool, making it impossible to trust the visualization.

### P0-2: Toast Reason Misattribution (Most Examples)

**Impact**: Toast notifications display incorrect render reasons.

**Evidence**: On Example 1 (state-change):
- **Expected toast**: "App re-rendered (state-change)" or "3 components re-rendered" with reason "state-change"
- **Actual toast**: "3 components re-rendered" with sub-text "Parent Re-rendered (3)"

**Root Cause** (`src/hooks/useRenderTracker.ts` lines 120-145):
```typescript
function determineRenderReason(isInitialRender, changedProps, changedState) {
  if (changedState.length > 0) return 'state-change'
  if (changedProps.length > 0) return 'props-change'
  return 'parent-rerender'  // Falls through to this for most components
}
```

The `deps` argument to `useRenderTracker` is only provided in `LivePreviewWrapper` when it has explicit `deps` prop. Looking at `StateChangePreview` in `livePreviewExamples.tsx`:
- Only `App` wrapper has `deps={{ state: { count } }}` -- correctly detects "state-change"
- `Heading` and `Button` wrappers have **no deps** -- they fall through to "parent-rerender"
- Since the batch toast shows the last render event, and Heading/Button fire last, the toast displays "parent-rerender" as the reason

**But this is also technically correct** -- Heading and Button DO re-render because their parent re-rendered. The issue is that the *batch toast* shows the wrong *summary*. It should highlight the root cause (App: state-change) rather than the cascade effect (Heading/Button: parent-rerender).

### P0-3: Intermittent Page Redirect on Trigger Click

**Impact**: Clicking trigger buttons sometimes causes navigation to `/` (landing page).

**Evidence**: During Playwright testing, clicking "Trigger State Change" caused the URL to change from `/conditions/state-change` to `/`. This happened intermittently.

**Root Cause** (`src/views/ExamplePage.tsx` lines 89-92):
```typescript
if (!example) {
  const { categoryId: defaultCat, exampleId: defaultEx } = getDefaultExample()
  redirect(`/${defaultCat}/${defaultEx}`)
}
```

`redirect()` is called during render when `example` is null. With `useParams()` from `next/navigation`, the params can be temporarily unavailable during client-side re-renders triggered by Redux state updates. When multiple rapid state changes occur (trigger -> Redux dispatch -> cascade), there may be a render where `useParams()` returns stale/undefined values, causing `getExample()` to return null and triggering the redirect.

**Note**: This issue is non-deterministic and depends on timing. It was reproduced multiple times during testing.

---

## P1 Major Issues

### P1-1: `<MemoizedChild />` Tree Shows Same Counts as `<Child />` (13 of 17 Examples)

**Impact**: The dual-tree comparison (the core differentiator of this tool) fails to demonstrate memo's effect.

**Root Cause** (`src/views/ExamplePage.tsx` lines 68-71):
```typescript
const liveTree = useComponentTreeWithCounts(example?.componentTree ?? null)
const memoizedLiveTree = useComponentTreeWithCounts(
  example?.memoizedTree ?? example?.componentTree ?? null
)
```

**No example defines `memoizedTree`** -- they only define `componentTree`. So both trees use the same tree structure. And since both trees read from the same Redux `renderCounts` store (keyed by `componentName`), they always show identical counts.

For the tool to show that `<MemoizedChild />` prevents re-renders in the `parent-rerender` scenario (memoEffect: 'prevents'), the memo tree would need separate component instances with different names (e.g., "MemoizedChild" vs "Child") tracked independently.

**Current behavior**: Both `<Child />` and `<Memo />` trees show the same numbers everywhere, making the comparison meaningless.

### P1-2: Sidebar Matrix Accuracy vs Runtime Behavior

**Impact**: The sidebar comparison matrix correctly defines expected behavior (via `memoEffect`) but runtime never validates it.

The sidebar shows:
| Example | `<Child />` | `<Memo />` |
|---------|-------------|------------|
| parent-rerender | Re-renders | **Prevented by memo** |
| usecallback | Re-renders | **Prevented by memo** |
| usememo | Re-renders | **Prevented by memo** |
| children-pattern | Re-renders | **Prevented by memo** |

But at runtime, both trees show identical counts (see P1-1), so users see the "Prevented by memo" label in the sidebar while the actual tree shows re-renders happening. This is directly the issue the user reported.

### P1-3: Toast Batch Grouping Hides Root Cause

**Impact**: When multiple components re-render together, the batch toast shows the count but attributes the reason to the last event (usually "parent-rerender"), hiding the actual trigger.

**Root Cause** (`src/store/toastSlice.ts` lines 68-85):
```typescript
addBatchToast: (state, action: PayloadAction<RenderInfo[]>) => {
  const renders = action.payload
  const newToast: Toast = {
    id: `toast-batch-${Date.now()}`,
    renderInfo: renders[0],  // Uses FIRST render's info for display
    batchRenders: renders,
    // ...
  }
}
```

The toast displays `renders[0].reason` as the primary reason. Which render arrives first depends on setTimeout timing in `useRenderTracker`, which is non-deterministic.

---

## P2 Minor Issues

### P2-1: Initial Render Count Shows "1" Instead of Being Hidden

On page load, all components show render count badge "1" (initial render). This is technically correct but adds visual noise. Users haven't triggered anything yet, so seeing "1" everywhere may be confusing. Consider hiding the badge until a re-render occurs (count >= 2).

### P2-2: `ref-vs-state` Example -- "Increment Ref" Button Shows Toast

The `ref-vs-state` example (memoEffect: 'not-applicable') correctly demonstrates that ref mutations don't cause re-renders. However, clicking "Increment Ref" triggers NO toast (correct) but also updates a DOM element directly via `refDisplayRef.current.textContent`, bypassing React. This is correct behavior for the demo but could confuse users who expect to see *something* happen in the visualization.

### P2-3: Live Preview Mode Does Not Track Renders in Tree View

When switching between "Tree" and "Live" view modes, the live preview components continue rendering (they're always mounted, just hidden with `h-0 overflow-hidden`). This means render counts continue to increment in the background even when the user is looking at the Tree view.

---

## Per-Example Test Matrix

| # | Example ID | Category | memoEffect | Triggers | Render Count Accurate? | Toast Reason Accurate? | Memo Diff Works? | Notes |
|---|-----------|----------|------------|----------|----------------------|----------------------|-----------------|-------|
| 1 | state-change | conditions | no-effect | increment | FAIL (1->9 per click) | FAIL (shows parent-rerender) | N/A (no-effect) | P0-1, P0-2 |
| 2 | props-change | conditions | no-effect | increment | FAIL (inflated) | FAIL (same issue) | N/A | Same cascade issue |
| 3 | parent-rerender | conditions | prevents | increment | FAIL (inflated) | FAIL | FAIL (both trees same) | P1-1: memo tree should differ |
| 4 | context-change | conditions | no-effect | increment | FAIL (inflated) | QUESTIONABLE | N/A | Context reason may be misattributed |
| 5 | force-update | conditions | no-effect | reset-key, force-rerender | FAIL (inflated) | FAIL (never shows "force-update" reason) | N/A | force-update reason never set |
| 6 | use-reducer | conditions | no-effect | increment, decrement, set-step, reset | FAIL (inflated) | FAIL | N/A | Same cascade issue |
| 7 | use-sync-external-store | conditions | no-effect | increment, decrement | FAIL (inflated) | FAIL | N/A | Same cascade issue |
| 8 | suspense | conditions | no-effect | switch-user | FAIL (inflated) | QUESTIONABLE | N/A | Timer-based loading adds complexity |
| 9 | concurrent | conditions | no-effect | type, clear | FAIL (inflated) | FAIL | N/A | Deferred update adds more cascades |
| 10 | use-effect-deps | conditions | no-effect | increment, type | FAIL (inflated) | FAIL | N/A | Effect deps unrelated to render tracking |
| 11 | ref-vs-state | conditions | not-applicable | increment-state, increment-ref | PARTIAL (ref correctly no re-render) | PARTIAL | N/A | Ref button correctly doesn't trigger toast |
| 12 | compound-component | conditions | no-effect | select-option, toggle-open | FAIL (inflated) | QUESTIONABLE | N/A | Context reason attribution unclear |
| 13 | render-props | conditions | no-effect | move-mouse | FAIL (inflated) | FAIL | N/A | Same cascade issue |
| 14 | usecallback | optimization | prevents | increment, type | FAIL (inflated) | FAIL | FAIL (both trees same) | P1-1: MemoButton should not re-render on "type" |
| 15 | usememo | optimization | prevents | increment, type | FAIL (inflated) | FAIL | N/A | useMemo is about computation, not rendering |
| 16 | react-lazy | optimization | not-applicable | toggle-chart | FAIL (inflated) | QUESTIONABLE | N/A | Lazy loading works but counts inflated |
| 17 | children-pattern | optimization | prevents | change-color | FAIL (inflated) | FAIL | FAIL (both trees same) | P1-1: ExpensiveTree should not re-render |

### Legend
- **Render Count Accurate**: Does the render count increment by exactly 1 per trigger click?
- **Toast Reason Accurate**: Does the toast show the correct root cause reason?
- **Memo Diff Works**: Do `<Child />` and `<MemoizedChild />` trees show different counts when memoEffect is 'prevents'?

---

## Specific Code Analysis: force-update Example

The `force-update` example claims to show force updates, but `determineRenderReason()` never returns `'force-update'` because:
1. The function only checks `forceUpdate` parameter (line 130-132)
2. `useRenderTracker` never passes `forceUpdate: true` to `determineRenderReason()` (line 211-215)
3. The force update in the live preview (`ForceUpdatePreview`) uses `useState` internally (`forceUpdate` is actually just `useState`), so it appears as a `state-change`

The `'force-update'` reason type exists in the type system but is unreachable at runtime.

---

## Root Cause Summary

All issues trace back to one architectural decision: **using `useRenderTracker` inside `LivePreviewWrapper` creates a feedback loop with Redux**.

The flow:
1. User triggers state change in live preview
2. `LivePreviewWrapper` components re-render
3. `useRenderTracker` detects render, dispatches to Redux via setTimeout(0)
4. Redux updates `renderCounts` store
5. `ExamplePage` subscribes via `useComponentTreeWithCounts`, re-renders
6. All `LivePreviewWrapper` children re-render (parent-rerender cascade)
7. `useRenderTracker` detects ANOTHER render
8. Goto step 3 (with `dispatchInFlightRef` guard eventually stopping it)

The guard prevents infinite loops but not the initial cascade. With N components, the first dispatch causes N-1 cascade renders, each potentially dispatching again.

---

## Recommendations (Priority Order)

1. **Decouple render counting from Redux dispatch** -- Use the render count from `renderCountRef` for display, but don't let Redux updates cascade back into the tracked components. Consider using a React context or a separate non-Redux store for render counts.

2. **Implement separate tracking for `<MemoizedChild />` tree** -- Define `memoizedTree` with distinct component names (e.g., prefix with "Memo.") so the two trees can show different counts. This is essential for the tool's core educational value.

3. **Guard against redirect during re-renders** -- Replace `redirect()` with a conditional early return showing a loading state when params are temporarily unavailable:
   ```typescript
   if (!example) {
     return <div>Loading...</div>  // or null
   }
   ```

4. **Fix toast root cause attribution** -- When creating batch toasts, find the render event with the "root cause" reason (state-change > props-change > context-change > parent-rerender) and use that as the primary display reason.

5. **Make `force-update` reason reachable** -- Wire up `useRenderTracker` to detect force updates, or remove the unreachable type.

---

## Verdict: FAIL (55%)

**3 P0 critical issues** and **3 P1 major issues** identified. The core educational purpose of the tool -- showing accurate render counts and demonstrating memo's effect -- is undermined by the Redux cascade feedback loop. The dual-tree comparison (the tool's unique differentiator) does not work at runtime because no example defines `memoizedTree` with separate component instances.

The user's concern is validated: components show inflated render counts, and toast content attributes the wrong render reason. These issues affect all 17 examples.

**Ship readiness**: Not ready for production without addressing P0 issues. The visualization infrastructure is architecturally sound but the render tracking feedback loop must be resolved first.
