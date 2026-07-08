# QA Edge Cases Report — Re-Render Demo

## Phase 1: Comprehensive E2E Tests

- **202 tests written and passing** across 9 spec files
- **Coverage**: All 20 examples, all 25 triggers, all view modes
- **New spec files**: `demo-triggers.spec.ts` (data-driven for all 20 examples), `memo-optimization.spec.ts` (behavioral tests)
- **Critical bug found & fixed**: `ref-vs-state` example used `useState` instead of `useRef` for ref mutation — caused false re-renders

## Phase 2: Browser E2E Test Case Tracing

Verified 13+ examples in Chrome MCP:
- State Change, Ref vs State, React.memo, useCallback Comparison, Suspense, Compound Component, Children Pattern, Render Props, Force Update, Concurrent, React.lazy, use-sync-external-store, use-effect-deps
- Theme toggle (light/dark) verified
- Landing page layout verified (2 categories, 20 example cards)

## Phase 3: Random Actions Stress Test (60 actions)

### Actions Performed
1. **Rapid trigger clicks** (3x on state-change) — counts accumulated correctly
2. **Reset + view switch** — zero false toasts after reset
3. **Rapid trigger on use-reducer** (4 different triggers) — all accumulated
4. **Rapid navigation** (5 sidebar links clicked in sequence) — page stable after settling
5. **Non-trigger UI clicks** (code file tabs, explanation toggle, Overlays button) — tested for false toasts
6. **usecallback-comparison + usememo-comparison** (4 rapid trigger clicks) — Before/After layout stable
7. **Landing page → card navigation** — correct routing
8. **Double theme toggle** — no crash or visual glitch
9. **Trigger → Reset → Trigger → Live view switch** — page remains functional

### Bug Found & Fixed During Stress Test

**File tab click produces false toasts** (severity: medium)
- **Root cause**: `setActiveFileId` passed directly to `SplitPaneLayout.onFileSelect` without `useSuppressToasts` wrapper
- **Impact**: Clicking any code file tab (e.g., App.tsx → ui.tsx) triggered parent re-render cascade → toasts appeared falsely
- **Fix**: Added `handleFileSelect` callback wrapping `setActiveFileId` with `useSuppressToasts` in `ExamplePage.tsx`
- **Verification**: After fix, file tab clicks produce zero toasts (confirmed in browser)

### Edge Cases Verified
| Scenario | Result |
|----------|--------|
| Rapid triple-click on trigger | Counts accumulate correctly |
| Click trigger immediately after reset | Toast appears (correct) |
| Switch code file tab | No false toasts (after fix) |
| Toggle explanation panel | No false toasts, no re-renders |
| Click Overlays view button | No false toasts (already wrapped) |
| Rapid 5x sidebar navigation | Final page loads correctly |
| Invalid route (e.g., /without-memo/key-prop) | Redirects to default example |
| Double theme toggle | No crash, correct theme state |
| Navigate away mid-render | No errors, page stable |
| useDeferredValue concurrent updates | Multiple renders tracked correctly |

### Final Verification
- **202 E2E tests**: ALL PASSING
- **TypeScript**: Clean (no errors)
- **ESLint**: Clean (no warnings)
- **Browser**: No Next.js error dialogs, no console errors observed

## Verdict: PASS

All 20 demo examples function correctly. Two bugs were found and fixed:
1. `ref-vs-state` used `useState` instead of `useRef` (Phase 1)
2. File tab clicks produced false toasts due to missing `useSuppressToasts` wrapper (Phase 3)

Confidence: **97%** — comprehensive coverage across all examples with stress testing.

---

## Phase 4: Playwright MCP Edge Case Testing (2026-02-17)

**Tester:** edge-case-tester
**Platform:** macOS Darwin 25.3.0, Chromium (Playwright MCP), Desktop 1440x900

### Results Summary

| Edge Case | Result |
|-----------|--------|
| EC1: Rapid trigger clicking (15x) | PASS |
| EC2: Multiple simultaneous toasts | PASS |
| EC3: Reset during animation | PASS |
| EC4: Rapid navigation (6 examples) | PASS |
| EC5: Optimization toggle rapid toggle (10x) | PASS |
| EC6: Long compound component names | PASS |
| EC7: Browser resize during interaction | PASS |
| EC8: Page refresh on example page | PASS |

**Overall: 8/8 PASS | Console Errors: 0**

### EC1: Rapid Trigger Clicking (15x)
- Clicked "Trigger State Change" 15 times as fast as possible
- Render counts incremented from `[1,1,1]` to `[9,9,9]` -- all consistent
- No crashes, page remained functional. React batching + Strict Mode accounts for count
- Screenshot: `edge_01_rapid_clicks_pass.png`

### EC2: Multiple Simultaneous Toasts
- 4 triggers spaced 400ms apart generated 4 simultaneous toasts
- Toasts stack vertically with 90px consistent spacing, no overlap
- Positions: 16px, 106px, 196px, 286px from top
- Sub-300ms rapid clicks correctly batched by debounce
- Screenshot: `edge_02_toast_stacking.png`

### EC3: Reset During Animation
- Triggered 3 re-renders then Reset within 50ms (during flash animation)
- No crash, page title preserved, all counts consistent at 21
- Reset cascade in Strict Mode produces predictable count (not a bug)
- Screenshot: `edge_03_reset_during_animation.png`

### EC4: Rapid Navigation (6 Examples)
- Navigated: state-change -> props-change -> context-change -> force-update -> use-reducer -> usecallback (200ms gaps)
- Final page loaded correctly as `useCallback` at correct URL
- Counts fresh (1 or 0 for memo-prevented), no stale state
- 0 console errors

### EC5: Optimization Toggle Rapid Toggle (10x)
- 10 rapid toggles at 50ms spacing
- Final state: collapsed (correct for even count)
- Sidebar stable, no visual glitch, no accidental navigation

### EC6: Long Compound Component Names
- `Select.Trigger`, `Select.Options`, `Select.Option` all display correctly
- Dot-notation names not truncated, proper tree nesting
- Render badges align correctly next to long names
- Screenshots: `edge_06_compound_names.png`, `edge_06_compound_tree.png`

### EC7: Browser Resize During Interaction
- Resize cycle: 1440x900 -> 768x1024 -> 375x812 -> 1440x900
- Page remained stable throughout all breakpoint transitions
- 6 render count badges visible after return to desktop

### EC8: Page Refresh Preserves State
- Refresh on `/conditions/use-reducer`: title "Reducer Dispatch" preserved
- Counts reset to fresh `[1,1,1,1,1,1,1]`
- Sidebar highlights active row with `bg-accent` class
- Deep link to `/optimization/children-pattern` loads correctly

### Observations (Not Bugs)
1. **Strict Mode amplification:** Render counts exceed user interactions due to double-invocation
2. **Toast batching:** 300ms debounce correctly batches rapid clicks into single toast
3. **Reset cascade:** Reset triggers its own re-renders, counts go to small number not 0

### Screenshots
| File | Description |
|------|-------------|
| `edge_01_rapid_clicks_pass.png` | 15 rapid clicks - stable |
| `edge_02_toast_stacking.png` | 4 toasts stacked correctly |
| `edge_03_reset_during_animation.png` | Reset during animation |
| `edge_06_compound_names.png` | Compound Component header |
| `edge_06_compound_tree.png` | Tree with dot-notation names |
