# QA UX Sensibility Report -- Re-Render Demo

**Tester**: ux-tester (Playwright MCP browser testing)
**Date**: 2026-02-17
**Evidence**: 14 screenshots (ux_01 through ux_14), interactive browser testing in light/dark modes
**Method**: Full user journey walkthrough at desktop (1440x900) and mobile (375x812), both themes
**Platform**: macOS Darwin 25.3.0, Chromium, localhost:3219

---

## Summary

**Overall UX Sensibility Score: 78/100**

The application demonstrates strong design fundamentals with a clear educational purpose. The landing page effectively introduces the tool, and the split-pane layout is well-suited for code + visualization side-by-side learning. The dual-tree comparison (`<Child />` vs `<MemoizedChild />`) is a compelling educational pattern. However, critical interaction bugs (theme toggle and view mode causing unintended navigation) significantly undermine the user experience and must be addressed.

---

## V1: First Impression (16/20)

### Strengths
- Landing page clearly communicates purpose with "React Re-render Visualizer" heading and descriptive subtitle
- The sidebar comparison matrix immediately shows the educational structure (scenarios vs Child/Memo columns)
- The mock UI preview ("Interactive Learning Environment" section) gives a tangible preview of what to expect with a clickable link
- "Start Learning" CTA is prominent and leads directly to the first example
- "Explore by Topic" section provides clear category breakdown (Re-render Conditions + Optimization) with linked examples
- "Key Concepts You'll Learn" cards provide approachable summaries

### Issues
- **[V1-1] Sidebar matrix is dense on first load** -- The full 13-row + 4-row matrix table is information-heavy for a first-time user. Column headers `<Child />` and `<Memo />` use JSX syntax which may not be immediately obvious to beginners
- **[V1-2] No onboarding hint** -- There is no tooltip or overlay explaining what the red X / green checkmark / dash icons mean in the matrix. A first-time user must infer the meaning from context
- **[V1-3] "Advanced Patterns 8" section header** -- The number "8" appended to "Advanced Patterns" represents the count of examples in the section, but its placement after the title looks like a formatting artifact rather than a count badge

**Score: 16/20**

---

## V2: Visual Hierarchy (17/20)

### Strengths
- Clear distinction between `<Child />` (orange dot) and `<MemoizedChild />` (blue dot) in the dual-tree layout
- Step numbers (1-17) provide clear sequencing with a counter badge (e.g., "14/17") in the page header
- The split-pane layout (code editor left, visualization right) is a well-established IDE pattern
- Explanation panel at the top with clear structure: Understanding This Pattern > Key Points > Code Pattern > Learn More
- Tab-based file navigation (App.tsx, MemoButton.tsx, ui.tsx) is intuitive for developers
- Trigger buttons section has a clear "Trigger Re-renders" header with descriptive labels and subtitles
- "Without React.memo" and "With React.memo" labels clearly identify each tree's role

### Issues
- **[V2-1] Initial render counts add cognitive noise** -- All components show render count "1" before any interaction. The difference between Child and MemoizedChild only becomes apparent after triggering. A visual hint ("click to see the difference") would improve discoverability
- **[V2-2] Tree/Live toggle is easy to miss** -- The view mode toggle tabs are small and positioned to the far right of the "Component Tree" header
- **[V2-3] Previous/Next navigation asymmetry** -- On the first example (State Change), only "Props Change >" appears on the far right with no left element, creating visual imbalance

**Score: 17/20**

---

## V3: Interaction Feedback (14/20)

### Strengths
- Toast notifications fire after triggering re-renders with clear messaging: "3 components re-rendered" with subtitle "Parent Re-rendered (3)"
- Toast has expand/dismiss buttons (chevron + X) for detail control
- Render count badges update correctly on each trigger
- Notifications region is properly labeled with `aria-label="Notifications"` for screen readers
- Live Preview section shows real interactive components (buttons, inputs) that respond to user actions

### Issues
- **[V3-1] CRITICAL: Theme toggle causes unintended navigation** -- Clicking the sun/moon theme toggle on any example page navigates the user to `/conditions/state-change`, losing their current context. Confirmed on Parent Re-render and useCallback pages. Root cause appears to be a re-render cascade during theme switching that resets navigation state. This was the most frequently triggered bug during testing.
- **[V3-2] CRITICAL: Viewport resize causes navigation** -- Resizing the browser window (which triggers responsive breakpoint changes) also causes unintended navigation to a different example page. Observed when switching between desktop and mobile viewports.
- **[V3-3] Toast accumulation** -- Multiple toasts stack in the notification area. After several triggers + navigations, 4 identical "3 components re-rendered" toasts were visible simultaneously, overwhelming the notification area. Auto-dismiss or deduplication would help.
- **[V3-4] Flash animation is transient** -- The CSS flash animation highlighting re-rendered components is extremely brief. If the user is not watching the tree at the exact moment of the trigger, they miss it. No replay mechanism exists.
- **[V3-5] No "skipped render" feedback** -- When `<MemoizedChild />` prevents a re-render (the key educational insight), there is no explicit visual signal. The component simply stays unchanged. A subtle "skipped" indicator or grayed-out pulse would make the optimization effect much more obvious.

**Score: 14/20**

---

## V4: Consistency (16/20)

### Strengths
- Orange/blue color coding for `<Child />` vs `<MemoizedChild />` is consistent across all 17 examples in both sidebar matrix and component tree
- Matrix icon system (red X = re-renders, green checkmark = prevented by memo, gray dash = N/A) is used consistently
- Code editor (Monaco) has consistent syntax highlighting in both light and dark modes
- Explanation panel structure is identical across all examples
- Step numbering (1-17) is continuous across categories (conditions 1-13, optimization 14-17)
- All trigger buttons use the same visual pattern with icon + title + description

### Issues
- **[V4-1] Matrix text overflow** -- "Prevented by memo" cells contain more text than "Re-renders" cells, causing slight visual misalignment in sidebar rows
- **[V4-2] Optimization section collapse behavior** -- Starts collapsed on conditions examples, expanded on optimization examples. Correct behavior but the transition is not animated, making it feel abrupt
- **[V4-3] Mobile sidebar as overlay** -- On mobile, the navigation appears as a dialog overlay with the full matrix table. The table is functional but cramped at 375px width

**Score: 16/20**

---

## V5: Information Density (15/20)

### Strengths
- Each example page provides a well-structured learning progression: explanation (theory) -> code editor (implementation) -> component tree (visualization) -> live preview (interaction)
- Key Points are concise bullet lists (4 items per example)
- Code snippets in the explanation panel are short and focused on the essential pattern
- External "Learn More" links (React docs) provide escape hatches for deeper learning
- The dual-tree comparison keeps the core educational contrast always visible
- Multiple code file tabs (App.tsx, Child.tsx, etc.) let users explore the full example

### Issues
- **[V5-1] Explanation panel takes significant viewport space** -- On desktop at 1440px, the explanation panel occupies roughly 60% of the viewport height before the code editor and tree become visible. No way to collapse or minimize it for returning users
- **[V5-2] Redundant title display** -- Example title and description appear in both the page header ("State Change 1/17") and the sidebar matrix row. Minor visual noise
- **[V5-3] Live Preview below Tree view** -- In Tree mode, the Live Preview section also appears below the component tree, making the separate "Live" tab feel partially redundant
- **[V5-4] Mobile code truncation** -- On mobile (375px), Monaco editor renders code lines that are truncated with horizontal scrolling. For short educational examples, read-only word-wrapped display might be more appropriate
- **[V5-5] No progress tracking** -- With 17 examples, there is no visual progress bar or completion tracking. The "14/17" counter is numeric-only; a progress bar would give a better sense of learning journey

**Score: 15/20**

---

## Critical Issues Summary

| ID | Severity | Description | Reproduced |
|----|----------|-------------|------------|
| V3-1 | CRITICAL | Theme toggle causes navigation to state-change, losing user context | Yes, multiple times |
| V3-2 | CRITICAL | Viewport resize causes unintended navigation | Yes, desktop to mobile transition |
| V3-3 | MODERATE | Toasts accumulate without auto-dismiss, stacking 4+ notifications | Yes |
| V3-5 | MODERATE | No visual feedback when memo prevents re-render (key learning point) | Yes |
| V5-1 | MODERATE | Explanation panel not collapsible, pushes interactive content below fold | Yes |
| V1-2 | MINOR | No onboarding for matrix icon meanings (X/checkmark/dash) | Observed |
| V5-5 | MINOR | No progress tracking across 17-step learning journey | Observed |
| V3-4 | MINOR | Flash animation too brief to reliably observe | Observed |

---

## Recommendations

1. **Fix theme toggle / resize navigation bug (V3-1, V3-2)** -- Root cause is likely in the layout/shell component where theme state changes trigger a re-render cascade that remounts the dynamic route component, losing the current path. This is the highest priority fix as it breaks the most basic user flow (changing theme while learning).

2. **Add "skipped" indicator for memo optimization (V3-5)** -- When a memoized component skips re-render, show a brief visual indicator (e.g., a subtle gray pulse, a small "skipped" badge, or a brief border highlight in a neutral color). This is the core educational value of the tool.

3. **Implement toast auto-dismiss with deduplication (V3-3)** -- Toasts should auto-dismiss after 3-5 seconds. Identical consecutive toasts should be deduplicated or show a count ("x3").

4. **Make explanation panel collapsible (V5-1)** -- Add a collapse/expand toggle so returning users can focus on the interactive elements immediately.

5. **Add progress bar (V5-5)** -- A thin visual progress indicator would enhance the learning journey feel. This was previously identified as deferred work.

---

## Score Summary

| Criterion | Score | Weight |
|-----------|-------|--------|
| V1: First Impression | 16/20 | Clear purpose, dense sidebar |
| V2: Visual Hierarchy | 17/20 | Strong layout, minor discoverability gaps |
| V3: Interaction Feedback | 14/20 | Critical navigation bugs, weak skip feedback |
| V4: Consistency | 16/20 | Strong color/layout consistency |
| V5: Information Density | 15/20 | Good structure, needs collapsibility |
| **Total** | **78/100** | |

---

## Verdict: CONDITIONAL PASS (78/100)

The UX design is fundamentally sound with strong visual design, clear navigation structure, and good educational information architecture. The landing page, dual-tree comparison, and sidebar matrix are all well-executed UX patterns.

However, the critical navigation bugs (V3-1, V3-2) break the most basic user interaction -- switching themes or resizing the browser causes loss of context. Combined with the lack of explicit "skip" feedback for memo optimization (V3-5), the core user experience needs improvement.

**Ship readiness**: The UX framework is solid. Fixing the navigation stability bugs and adding memo-skip feedback would likely raise the score to 85+.

---

## Screenshots Reference

| File | Description |
|------|-------------|
| `ux_01_landing_dark_full.png` | Landing page, dark mode, full page (desktop) |
| `ux_02_landing_light_full.png` | Landing page, light mode, full page (desktop) |
| `ux_03_example_state_change_light.png` | State Change example, light mode, full viewport |
| `ux_04_after_trigger_light.png` | After trigger click, light mode |
| `ux_05_parent_rerender_after_trigger.png` | Parent Re-render after trigger with toast notification |
| `ux_06_parent_rerender_multi_trigger.png` | Multiple triggers showing toast accumulation |
| `ux_07_parent_rerender_dark.png` | Dark mode example (demonstrates navigation bug on theme toggle) |
| `ux_08_optimization_usecallback_dark.png` | useCallback optimization example, dark mode |
| `ux_09_usecallback_full_dark.png` | useCallback full page, dark mode |
| `ux_11_last_example_full.png` | Children Pattern (17/17) last example with navigation |
| `ux_12_mobile_375.png` | Mobile viewport (375px), light mode, explanation panel |
| `ux_13_mobile_full_page.png` | Mobile full page view |
| `ux_14_landing_light_desktop.png` | Landing page, light mode, desktop viewport |
