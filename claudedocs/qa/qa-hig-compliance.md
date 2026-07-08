# Apple HIG Compliance Report

**Project:** re-render (React Re-render Visualizer)
**Date:** 2026-02-17
**Tester:** hig-tester
**Method:** Code analysis + Playwright visual/programmatic verification

---

## Summary

| HIG Category | Score | Status |
|---|---|---|
| Typography | 90/100 | PASS |
| Tap Areas | 55/100 | FAIL |
| Colors & Contrast | 75/100 | PARTIAL |
| Spacing | 90/100 | PASS |
| Motion | 95/100 | PASS |
| Corner Radius | 95/100 | PASS |
| **Overall Composite** | **83/100** | **PARTIAL** |

---

## 1. Typography (90/100) -- PASS

### Findings

- **Font stack:** `"SF Pro Text", "SF Pro Display", system-ui, -apple-system, sans-serif` -- correctly configured in `globals.css` line 4
- **Heading hierarchy:** Clear size progression (H1: 18px sidebar / 36-40px landing, H2: 24px, H3: 16-18px)
- **Body text:** 14px (`text-sm`) for primary content, 12px (`text-xs`) for secondary/metadata
- **Line heights:** All measured values are readable:
  - H1: 28px (1.56 ratio)
  - H2: 32px (1.33 ratio)
  - Body: 20px/14px (1.43 ratio)
  - XS: 16px/12px (1.33 ratio)
- **Font weights:** 600 (semibold) for headings, 500 (medium) for labels, 400 (regular) for body

### Violations

- **`text-[10px]` usage in sidebar matrix headers and labels** (`Sidebar.tsx` lines 139, 172, 175, 178, 187, 202, 205, 227, 236): 10px text is below the recommended minimum of 11px for legibility, especially on non-Retina displays
- **`text-[9px]` badge count** (`Sidebar.tsx` lines 205, 236): 9px is very small and may be illegible for some users

### Score Rationale
Font stack is ideal for Apple platforms. Typography hierarchy is well-structured. Deducted 10 points for the very small text sizes (9-10px) in the sidebar matrix.

---

## 2. Tap Areas (55/100) -- FAIL

### Findings

**Passing (44x44px minimum):**
- Theme toggle button: 44x44px
- Home navigation link: 303x44px
- File tabs (App.tsx, ui.tsx): 83x44px, 67x44px
- Trigger buttons: min-h-[44px] enforced (`TriggerButton.tsx` line 52)
- Mobile hamburger button: 44x44px
- Mobile close button: 44x44px (h-11 w-11)
- Prev/Next navigation links: min-h-[44px] enforced (`ExamplePage.tsx` line 258)

**Failing -- Critical (sidebar matrix rows):**
All 13+ sidebar navigation links render at only **16px height** (the `<a>` element inside `<tr>`). While the parent `<tr>` row has a 36px height, the actual interactive `<a>` link is only 16px tall. The `<tr>` has `cursor-pointer` and an `onClick`, but the link itself is the semantic interactive target.

| Element | Measured Size | Required | Gap |
|---|---|---|---|
| Sidebar links (x13) | 163x16px | 44x44px | -28px height |
| Optimization toggle | 287x17px | 44x44px | -27px height |
| Doc links (Learn More) | ~142x32px | 44x44px | -12px height |
| Reset button | 75x36px | 44x44px | -8px height |
| View mode tabs (Tree/Live) | ~65x36px | 44x44px | -8px height |
| Toast expand/dismiss buttons | 24x24px (code) | 44x44px | -20px height |

**Partially passing (36px+ but <44px):**
- Reset button: 75x36px
- View mode toggle buttons: 65x36px, 63x36px
- These use `min-h-[36px]` with a comment "Slightly smaller but still accessible"

### Score Rationale
Major violations in the sidebar matrix (primary navigation), toast action buttons, and documentation links. The sidebar is the most-used navigation element and every row fails the 44px minimum. Toast action buttons at 24x24px (`h-6 w-6`) are severely undersized.

---

## 3. Colors & Contrast (75/100) -- PARTIAL

### Light Mode Contrast Ratios

| Element | Foreground | Background | Ratio | AA Required | Status |
|---|---|---|---|---|---|
| Page heading | rgb(10,10,18) | rgb(255,255,255) | 19.72:1 | 3.0 (large) | PASS |
| Description text | rgb(10,10,18) | rgb(255,255,255) | 19.72:1 | 4.5 | PASS |
| Section heading | rgb(10,10,18) | rgb(255,255,255) | 19.72:1 | 4.5 | PASS |
| Muted foreground | rgb(10,10,18) | rgb(255,255,255) | 19.72:1 | 4.5 | PASS |
| Sidebar item text | rgb(10,10,18) | rgb(255,255,255) | 19.72:1 | 4.5 | PASS |
| **Red-500 `<Child />`** | rgb(251,44,54) | rgb(255,255,255) | **3.81:1** | 4.5 | **FAIL** |
| **Blue-500 `<Memo />`** | rgb(43,127,255) | rgb(255,255,255) | **3.76:1** | 4.5 | **FAIL** |

### Color System

- **Role-based colors:** Yes -- uses CSS custom properties with semantic names (`--background`, `--foreground`, `--primary`, `--accent`, `--muted`, `--destructive`)
- **Light/Dark support:** Full implementation with `.dark` class toggle and separate variable sets (`globals.css` lines 20-72)
- **Flash colors:** Separate light/dark variants for orange and blue flash animations

### Violations

- **`text-red-500` in sidebar column header** (`Sidebar.tsx` line 175): `<Child />` header text at 10px size with contrast ratio 3.81:1 fails AA for normal text (requires 4.5:1)
- **`text-blue-500` in sidebar column header** (`Sidebar.tsx` line 178): `<Memo />` header text at 10px size with contrast ratio 3.76:1 fails AA for normal text
- These are the matrix column headers that label the comparison columns -- they are functional, not decorative

### Score Rationale
Excellent color system architecture with proper role-based tokens and light/dark support. The red-500 and blue-500 column headers fail WCAG AA contrast at their small size. Main content text achieves AAA level (19.72:1).

---

## 4. Spacing (90/100) -- PASS

### Findings

- **Grid system:** Custom spacing scale defined in `globals.css` (lines 6-11):
  - `--spacing-xs`: 4px
  - `--spacing-sm`: 8px
  - `--spacing-md`: 16px
  - `--spacing-lg`: 20px
  - `--spacing-xl`: 24px
- **Measured spacing values:**
  - Nav padding: 8px (on 4/8 grid)
  - Content padding (p-4): 16px (on grid)
  - Section padding (px-4): 16px horizontal (on grid)
  - Gap spacing (gap-2): 8px (on grid)
- **Key margins:** Landing page uses `px-6` (24px) and `py-12` (48px) -- on grid
- **Sidebar width:** 320px (w-80) -- divisible by 8

### Violations

- **`py-1.5` (6px) in sidebar rows** (`Sidebar.tsx` line 133): 6px is not on the 4/8 grid (should be 4px or 8px)
- **`gap-1.5` (6px) in sidebar link** (`Sidebar.tsx` line 138): Off-grid spacing
- **`py-0.5` (2px) in badges** (`Sidebar.tsx` line 205): 2px is technically on the 2px sub-grid but not the primary 4/8 grid

### Score Rationale
The spacing system is well-defined and follows the 4/8 grid for major layout elements. Minor off-grid values (6px, 2px) in dense UI areas like the sidebar matrix are acceptable trade-offs for information density.

---

## 5. Motion (95/100) -- PASS

### Findings

- **`prefers-reduced-motion` support:** Fully implemented in `globals.css` (lines 107-114) -- all animations and transitions are reduced to 0.01ms
- **Animation inventory:**
  - `flash-rerender` / `flash-rerender-memo`: 300ms ease-out (meaningful -- indicates re-render event)
  - `toast-slide-in`: 200ms ease-out (meaningful -- draws attention to notification)
  - `view-fade-in`: 200ms ease-out (meaningful -- view mode transition)
  - Theme transition: 200ms ease-out on background/color/border-color
- **All animations are purposeful:** Flash animations communicate re-render events (core educational purpose), toasts communicate state changes, view transitions prevent jarring switches
- **No gratuitous animation:** No decorative particles, bouncing, or attention-seeking motion
- **`focus-visible` support:** Implemented globally (`globals.css` lines 100-104) with ring outline

### Violations

- **Global `html *` transition** (`globals.css` lines 85-90): Applies `background-color`, `color`, and `border-color` transitions to ALL elements. While the intent (smooth theme switching) is valid, this is overly broad and could affect perceived responsiveness of non-theme interactions

### Score Rationale
Strong implementation with proper reduced-motion media query. All animations serve clear communicative purposes. Minor deduction for the overly broad global transition rule.

---

## 6. Corner Radius (95/100) -- PASS

### Findings

- **Radius scale defined in `globals.css`** (lines 13-17):
  - `--radius-sm`: 4px (`rounded` / small elements)
  - `--radius-md`: 8px (`rounded-md` / buttons, inputs)
  - `--radius-lg`: 12px (`rounded-lg` / cards, panels)
  - `--radius-xl`: 20px (`rounded-xl` / landing page cards)
- **Measured computed values match:**
  - `rounded-lg` = 12px
  - `rounded-md` = 8px
  - `rounded-xl` = 20px
  - `rounded-full` = 9999px (pills/badges)
- **Hierarchy-appropriate usage:**
  - Cards/panels: `rounded-lg` (12px)
  - Buttons/inputs: `rounded-md` (8px) or `rounded-lg` (12px)
  - Badges/pills: `rounded-full`
  - Inline code: `rounded` (4px)
- **Component tree boxes use `rounded-lg`** with `border-2` -- clear visual hierarchy

### Violations

- None significant

### Score Rationale
Corner radius system is well-defined and consistently applied following HIG hierarchy principles. The 4/8/12/20px scale matches Apple HIG recommendations exactly.

---

## Recommendations

### Priority 1 -- Tap Target Fixes (Critical)

1. **Sidebar matrix rows** (`Sidebar.tsx`): Add `min-h-[44px]` to the `<td>` cells containing links, or make the `<a>` element fill the full row height with `flex items-center py-3` or similar. Current row height is 36px (close) but the interactive `<a>` is only 16px.

2. **Toast action buttons** (`Toast.tsx` lines 381, 406): Change from `h-6 w-6` (24x24px) to `h-11 w-11` (44x44px) or add padding to create a 44px touch target while keeping the visual icon at 24px.

3. **Doc links** (`ExplanationPanel.tsx` line 112): Add `min-h-[44px]` to the link buttons. Currently 32px height.

### Priority 2 -- Contrast Fixes (Important)

4. **Column headers `<Child />` and `<Memo />`** (`Sidebar.tsx` lines 175-179): Use darker red/blue variants (`text-red-700` / `text-blue-700` in light mode, keep current colors in dark mode) or increase font size above 10px to qualify as decorative/non-essential text.

### Priority 3 -- Typography (Minor)

5. **10px text in sidebar matrix** (`Sidebar.tsx`): Consider bumping `text-[10px]` to `text-[11px]` for improved legibility, especially for the section headers and metadata badges.

6. **9px badge text** (`Sidebar.tsx` line 205): Consider `text-[10px]` minimum.

### Priority 4 -- Motion (Minor)

7. **Global transition scope** (`globals.css` lines 85-90): Consider scoping the theme transition to only the elements that need it (body, sidebar, cards) rather than `html *`.

---

## Verdict:

**Overall HIG Compliance Score: 83/100 -- PARTIAL PASS**

The re-render project demonstrates strong HIG compliance in typography, spacing, motion, and corner radius categories. The color system is architecturally sound with proper role-based tokens and full light/dark mode support.

**Critical issue:** Tap target sizes in the sidebar matrix navigation are the primary compliance gap. The sidebar links (16px height) and toast action buttons (24x24px) fall significantly below the 44x44px minimum. This is the most impactful area to address since the sidebar is the primary navigation mechanism.

**Secondary issue:** The red-500 and blue-500 column header colors fail WCAG AA contrast at their small (10px) size, with ratios of 3.81:1 and 3.76:1 respectively (4.5:1 required).

**Strengths:** SF Pro font stack, comprehensive `prefers-reduced-motion` support, well-defined spacing grid, precise corner radius hierarchy matching Apple HIG exactly, and strong accessibility features (focus-visible, aria attributes, screen reader text).

**Ship readiness:** The app is usable but tap target violations should be prioritized before claiming HIG compliance. The sidebar row heights are close (36px with parent tr) and could be brought to compliance by making the link element fill the full row area.

---

## Screenshots

| Screenshot | Description |
|---|---|
| `hig_landing_light.png` | Landing page, light mode, desktop |
| `hig_example_dark.png` | Example page (State Change), dark mode, desktop |
| `hig_mobile_example.png` | Example page, dark mode, mobile (375x812) |
