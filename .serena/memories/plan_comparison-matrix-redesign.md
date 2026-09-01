# Architecture Spec: Comparison Matrix Redesign

## Core Concept
Two protagonists (`<Child />` vs `<MemoizedChild />`) face every scenario side-by-side.
Sidebar = comparison matrix (visual summary). Demo area = dual stacked trees.

## Decisions Made
- HTML `<table>` for sidebar matrix (no ag-grid)
- Same component rendered twice for live preview (memo wrapper auto-applied)
- All 17 examples kept (including N/A ones for completeness)
- Mobile: horizontal scroll on matrix table
- Remove 3 examples: `memo`, `usecallback-comparison`, `usememo-comparison`

## Sidebar Matrix
- Width: w-80 (320px)
- 3 columns: Scenario | `<Child />` | `<MemoizedChild />`
- Cell colors: red bg + ✗ (re-renders), green bg + ✓ (prevented), gray + — (N/A)
- Clickable rows navigate to example page
- Sections: "Re-render Conditions" (5 basic + 8 advanced) + "Optimization" (4)

## Demo Area
- Two stacked sections in right panel
- Top: 🔴 WITHOUT MEMO — orange flash, red accents
- Bottom: 🔵 WITH MEMO — blue flash, blue accents  
- Shared trigger buttons fire both simultaneously
- Scrollable vertically

## CSS Variables
- `--flash-color`: orange (existing, for Child)
- `--flash-color-memo`: blue (new, for MemoizedChild)
- New `.animate-flash-memo` animation class

## Matrix Values (✗=re-renders, ✓=prevented, —=N/A)
1. State Change: ✗/✗
2. Props Change: ✗/✗
3. Parent Re-render: ✗/✓ (KEY)
4. Context Change: ✗/✗
5. Force Update: ✗/✗
6. useReducer: ✗/✗
7. useSyncExternalStore: ✗/✗
8. Suspense: ✗/✗
9. useTransition: ✗/✗
10. Effect Deps: ✗/✗
11. Ref Mutation: —/—
12. Compound Component: ✗/✗
13. Render Props: ✗/✗
14. useCallback: ✗/✓
15. useMemo: ✗/✓
16. React.lazy: —/—
17. Children Pattern: ✓/✓

## Implementation Phases
P1: Type & Data (types + memoEffect + memoizedTree for all 17)
P2: Matrix Sidebar (new MatrixSidebar component)
P3: Dual Demo (comparison view in ExamplePage)
P4: CSS & Flash (variant-specific animations)
P5: Cleanup (remove 3 examples, update maps)
P6: Verify (lint + typecheck + build + E2E)

## New/Modified Components
- NEW: MatrixSidebar (replaces ConditionsSection + OptimizationSection)
- NEW: ComparisonSection (reusable section wrapper for each protagonist)
- MOD: ComponentBox (add variant prop for color theming)
- MOD: ExamplePage (dual tree layout)
- MOD: Sidebar (wider, use MatrixSidebar)
