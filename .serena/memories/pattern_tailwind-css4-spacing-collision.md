# Tailwind CSS 4 Spacing Token Collision with Named Utilities

## Critical Finding (2026-02-20)

Custom `--spacing-{name}` tokens in `@theme` override Tailwind v4's named size utilities.

### The Bug
```css
/* globals.css @theme block */
@theme {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;  /* Apple HIG spacing grid */
  --spacing-lg: 20px;
  --spacing-xl: 24px;
}
```

This causes ALL utilities using named sizes to resolve to the custom value:
- `max-w-md` → `max-width: 16px` (expected: 28rem = 448px)
- `w-md` → `width: 16px` (expected: 28rem)
- `gap-md`, `p-md`, `m-md` → all resolve to 16px

### Root Cause
Tailwind CSS v4 uses `--spacing-*` CSS variables as the unified scale for ALL size-related utilities. Named tokens like `md`, `lg`, `xl` overlap with Tailwind's default breakpoint/container sizes.

### Fix Options
1. **Arbitrary values** (applied in PR #32): `max-w-[28rem]` instead of `max-w-md`
2. **Rename tokens** (permanent fix): `--spacing-apple-md: 16px` to avoid collision
3. **Use numeric-only spacing**: `--spacing-4: 16px` (Tailwind's default pattern)

### Affected Files (PR #32)
- `src/app/not-found.tsx`: `max-w-md` → `max-w-[28rem]`
- `src/views/ExamplePage.tsx`: `max-w-md` → `max-w-[28rem]`

### Related
- `pattern_tailwind-css4-theme-colors`: Similar `@theme` registration issue with colors
- PR #32: Applied the arbitrary value fix
- `globals.css` lines 27-32: Where the collision originates
