# QA Test Plan: re-render

**Platform**: Web (Next.js 16, App Router, static export)
**URL**: http://localhost:3219
**Date**: 2026-02-17
**Status**: Active

---

## 1. Scope

Interactive React re-render visualizer with 17 live examples across 2 categories. Key user concern: **demo accuracy** -- components that should not re-render ARE re-rendering, toast content may be incorrect.

### Example Matrix (17 total)

| # | Category | ID | Title | memoEffect | Triggers |
|---|----------|----|-------|------------|----------|
| 1 | conditions | state-change | State Change | no-effect | increment |
| 2 | conditions | props-change | Props Change | no-effect | increment |
| 3 | conditions | parent-rerender | Parent Re-render | **prevents** | increment |
| 4 | conditions | context-change | Context Change | no-effect | increment |
| 5 | conditions | force-update | Force Update | no-effect | reset-key, force-rerender |
| 6 | conditions | use-reducer | Reducer Dispatch | no-effect | increment, decrement, set-step, reset |
| 7 | conditions | use-sync-external-store | External Store | no-effect | increment, decrement |
| 8 | conditions | suspense | Suspense | no-effect | switch-user |
| 9 | conditions | concurrent | Concurrent Update | no-effect | type, clear |
| 10 | conditions | use-effect-deps | Effect Dependencies | no-effect | increment, type |
| 11 | conditions | ref-vs-state | Ref Mutation | not-applicable | increment-state, increment-ref |
| 12 | conditions | compound-component | Compound Component | no-effect | select-option, toggle-open |
| 13 | conditions | render-props | Render Props | no-effect | move-mouse |
| 14 | optimization | usecallback | useCallback | **prevents** | increment, type |
| 15 | optimization | usememo | useMemo | **prevents** | increment, type |
| 16 | optimization | react-lazy | React.lazy | not-applicable | toggle-chart |
| 17 | optimization | children-pattern | Children Pattern | **prevents** | change-color |

### memoEffect Semantics
- **no-effect**: Both Child and MemoizedChild re-render (memo cannot prevent this trigger)
- **prevents**: Child re-renders, MemoizedChild does NOT (memo successfully prevents)
- **not-applicable**: No re-render comparison applies (e.g., ref mutation, lazy loading)

---

## 2. Test Areas

### 2A. Visual Integrity (25% weight)

**Owner**: visual-tester

| ID | Test Case | Steps | Expected |
|----|-----------|-------|----------|
| V-01 | Landing page loads | Navigate to `/` | Category cards visible, all 17 examples listed |
| V-02 | Sidebar renders correctly | Check sidebar on example page | Comparison matrix with Child/MemoizedChild columns |
| V-03 | Matrix cells match memoEffect | Inspect each row's cells | `no-effect` = red X both columns; `prevents` = red X + green check; `not-applicable` = gray dash |
| V-04 | Step badges 1-20 | Sidebar shows step numbers | Continuous numbering, conditions 1-13, optimization 14-17 |
| V-05 | Example page layout | Visit any example | Split pane: code left, visualization right |
| V-06 | Component tree visualization | Tree tab on example page | Component boxes with render count badges |
| V-07 | Flash animation on re-render | Trigger re-render | Orange flash on re-rendered components |
| V-08 | Theme toggle | Click theme toggle | Light/dark mode switches, all components theme-aware |
| V-09 | Toast positioning | Trigger re-render | Toast appears top-right, no overlap with content |
| V-10 | Monaco editor | Code tab loads | Syntax highlighted code, file tabs functional |
| V-11 | Pattern badge | Compound Component, Render Props | "Pattern" tag visible in sidebar |
| V-12 | Hook subtitles | use-reducer, use-sync-external-store, concurrent, use-effect-deps | Subtitle (useReducer, etc.) shown below title |
| V-13 | Navigation bar | Any example page | Previous/Next navigation with step counter |
| V-14 | Responsive layout | Viewport 375px width | Mobile layout: hamburger menu, stacked panes |

### 2B. Functional Correctness -- Demo Accuracy (30% weight)

**Owner**: functional-tester
**Priority**: HIGHEST -- this is the user's primary concern

#### 2B-1. Re-render Correctness per Example

For each of the 17 examples, verify:

| ID | Test Case | Procedure | Pass Criteria |
|----|-----------|-----------|---------------|
| F-01 | state-change correctness | Reset > Trigger increment | App + children render count increases; toast shows "state-change" reason |
| F-02 | props-change correctness | Reset > Trigger increment | App + Counter + children re-render; toast shows component names |
| F-03 | parent-rerender correctness | Reset > Trigger increment | App re-renders, Child re-renders; if memoizedTree exists, MemoizedChild does NOT |
| F-04 | context-change correctness | Reset > Trigger increment | Context consumers re-render; non-consumers do not |
| F-05 | force-update correctness | Reset > Trigger reset-key | Timer component remounts (count resets to 0) |
| F-06 | force-update force-rerender | Reset > Trigger force-rerender | App re-renders without state change |
| F-07 | use-reducer correctness | Reset > Trigger increment | App re-renders, dispatch causes state change |
| F-08 | use-reducer decrement | Reset > Trigger decrement | Count decreases, re-render occurs |
| F-09 | use-sync-external-store | Reset > Trigger increment | External store drives re-render |
| F-10 | suspense correctness | Reset > Trigger switch-user | Suspense fallback shows, then resolves |
| F-11 | concurrent correctness | Reset > Trigger type | Input responsive, list update deferred |
| F-12 | use-effect-deps increment | Reset > Trigger increment | Count effect fires, re-render occurs |
| F-13 | use-effect-deps type | Reset > Trigger type | Re-render occurs but count effect does NOT fire |
| F-14 | ref-vs-state increment-state | Reset > Trigger increment-state | State section re-renders, UI updates |
| F-15 | ref-vs-state increment-ref | Reset > Trigger increment-ref | NO re-render, UI does NOT update |
| F-16 | compound-component | Reset > Trigger select-option | All sub-components re-render |
| F-17 | render-props | Reset > Trigger move-mouse | MouseTracker + DisplayCoords re-render |
| F-18 | usecallback prevents | Reset > Trigger type | App re-renders, MemoButton does NOT |
| F-19 | usememo prevents | Reset > Trigger type | App re-renders, expensive compute skipped |
| F-20 | react-lazy | Reset > Trigger toggle-chart | Chart lazy-loads with Suspense fallback |
| F-21 | children-pattern prevents | Reset > Trigger change-color | ColorPicker re-renders, ExpensiveTree does NOT |

#### 2B-2. Toast Content Accuracy

| ID | Test Case | Pass Criteria |
|----|-----------|---------------|
| T-01 | Single component toast | Shows component name + render reason (state-change, props-change, etc.) |
| T-02 | Batch toast | Shows "N components re-rendered" with expandable details |
| T-03 | Toast expand/collapse | Expand shows per-component breakdown with reasons |
| T-04 | Toast dismiss | Click dismiss removes toast |
| T-05 | Correct render reason in toast | Reason matches trigger type (e.g., "state-change" for state triggers) |
| T-06 | No false toast on reset | Reset button does NOT produce toast (useSuppressToasts) |
| T-07 | No false toast on tab switch | Switching file tabs does NOT produce toast |

#### 2B-3. Dual-Tree Behavior (memoEffect = 'prevents')

Critical for examples: parent-rerender, usecallback, usememo, children-pattern

| ID | Test Case | Pass Criteria |
|----|-----------|---------------|
| D-01 | Child tree re-renders | Orange flash on Child component after trigger |
| D-02 | MemoizedChild tree prevented | NO flash on MemoizedChild after trigger |
| D-03 | Render count divergence | Child count > MemoizedChild count after multiple triggers |
| D-04 | Sidebar matrix accuracy | Matrix shows red X for Child, green check for MemoizedChild |

### 2C. Apple HIG Compliance (15% weight)

**Owner**: hig-tester

| ID | Check | Criteria |
|----|-------|----------|
| H-01 | Tap targets >= 44x44px | All buttons, links, tabs meet minimum |
| H-02 | Color contrast WCAG AA | Text/background ratio >= 4.5:1 (normal), 3:1 (large) |
| H-03 | Keyboard navigation | Tab through all interactive elements; focus rings visible |
| H-04 | Screen reader labels | All interactive elements have aria-label or text content |
| H-05 | 4/8px grid spacing | Margins and padding align to 4/8px grid |
| H-06 | Corner radius consistency | Consistent 4/8/12/20px radius hierarchy |
| H-07 | Dark mode support | All components properly themed in dark mode |
| H-08 | prefers-reduced-motion | Flash animations respect reduced-motion preference |
| H-09 | Focus management | Focus moves logically after navigation/interaction |
| H-10 | Typography hierarchy | SF Pro (or system font), clear heading/body distinction |

### 2D. Edge Case Testing (15% weight)

**Owner**: edge-tester (blocked by functional)

| ID | Test Case | Steps | Expected |
|----|-----------|-------|----------|
| E-01 | Rapid trigger clicks | Click trigger 10x fast | No crash, counts increment correctly |
| E-02 | Rapid navigation | Click through examples quickly | No broken state, correct example loads |
| E-03 | Reset during animation | Trigger > immediately reset | Counts return to 0, no stuck animations |
| E-04 | Multiple toasts | Trigger several times quickly | Toasts stack correctly, dismiss independently |
| E-05 | Browser back/forward | Navigate to example, back, forward | Correct example restored |
| E-06 | Direct URL access | Enter /conditions/state-change directly | Page loads correctly |
| E-07 | Invalid URL | Enter /conditions/nonexistent | Graceful 404 or redirect |
| E-08 | Resize during interaction | Trigger while resizing | Layout adapts, no crash |
| E-09 | Split pane drag | Drag divider to extremes | Both panes remain usable, min-width respected |
| E-10 | Theme toggle during toast | Change theme while toast visible | Toast re-themes correctly |

### 2E. UX Sensibility Review (15% weight)

**Owner**: ux-reviewer (blocked by visual)

| ID | Check | Criteria |
|----|-------|----------|
| U-01 | Information hierarchy | Most important info (re-render visualization) is prominent |
| U-02 | Cognitive load | No overwhelming UI; progressive disclosure used |
| U-03 | Visual feedback | Actions produce immediate, clear feedback (flash, toast) |
| U-04 | Navigation clarity | User always knows where they are (active state, breadcrumbs) |
| U-05 | Error recovery | Easy to reset, undo, or navigate away |
| U-06 | Consistency | Similar patterns used across all examples |
| U-07 | Loading states | Suspense/lazy examples show proper loading indicators |
| U-08 | Color semantics | Orange = re-rendered, blue = memoized, consistent usage |
| U-09 | Educational value | Explanations are clear, code snippets are relevant |
| U-10 | First-time user experience | Landing page guides user to first example |

---

## 3. Scoring Rubric

| Component | Weight | Pass Threshold | Metric |
|-----------|--------|---------------|--------|
| Visual Integrity | 25% | 95% | % of V-tests passing |
| Functional Correctness | 30% | 95% pass rate, P0=0 | % of F/T/D-tests passing |
| Apple HIG Compliance | 15% | 80/100 | Weighted HIG score |
| Edge Cases | 15% | 0 crashes | % of E-tests passing, no crashes |
| UX Sensibility | 15% | 75/100 | ProductHunt-style visual score |

### Composite Score
- **>= 85**: PASS
- **65-84**: CONDITIONAL PASS (issues to fix before release)
- **< 65**: FAIL

### Severity Levels
- **P0 (Blocker)**: Demo shows incorrect re-render behavior (wrong memoEffect), app crashes
- **P1 (Critical)**: Toast shows wrong component/reason, visual glitch blocks understanding
- **P2 (Major)**: UI inconsistency, minor accessibility issue, edge case failure
- **P3 (Minor)**: Polish issue, cosmetic imperfection

---

## 4. Test Environment

- **Browser**: Chromium (matches Playwright config)
- **Viewport**: Desktop 1280x720 (primary), Mobile 375x667 (secondary)
- **Dev server**: `pnpm dev` on port 3219
- **Existing E2E**: 202 Playwright tests (8 spec files) -- run as baseline

---

## 5. Execution Order

1. Run existing E2E suite (`pnpm test:e2e`) as baseline
2. Visual Integrity (V-01 through V-14) -- screenshot-based
3. Functional Correctness (F-01 through F-21, T-01 through T-07, D-01 through D-04) -- interactive
4. Apple HIG Compliance (H-01 through H-10) -- inspection + audit
5. Edge Case Testing (E-01 through E-10) -- stress + boundary
6. UX Sensibility Review (U-01 through U-10) -- holistic evaluation

---

## 6. Deliverables

Each tester writes to `claudedocs/qa/`:
- `visual-report.md` -- Visual integrity findings
- `functional-report.md` -- Demo accuracy findings
- `hig-report.md` -- HIG compliance findings
- `edge-case-report.md` -- Edge case findings
- `ux-report.md` -- UX sensibility findings
- `qa-summary.md` -- Aggregated by QA lead
- `qa-verdict.md` -- Final PASS/CONDITIONAL/FAIL gate
