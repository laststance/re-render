# Tailwind CSS 4 @theme Color Registration Pattern

## Critical Finding (2026-02-20)

In Tailwind CSS 4, utility classes like `bg-background`, `text-foreground`, `border-border` 
require corresponding `--color-*` entries in `@theme` to resolve. Variables defined only in 
`:root`/`.dark` are NOT automatically available to Tailwind utility classes.

### The Bug Pattern
```css
/* `:root` variables alone are NOT enough for Tailwind 4 utilities */
:root { --background: oklch(100% 0 0); }

/* This resolves to transparent (rgba(0,0,0,0))! */
<div class="bg-background">

/* Must add to @theme: */
@theme { --color-background: var(--background); }
```

### Blast Radius
This affected 207 occurrences across 16 files in re-render, including:
- Mobile sidebar `bg-background` → transparent backdrop (Issue #23)
- `hover:bg-accent/50` → invisible hover states (Issue #25)
- All `ring-ring` → `ring-[var(--ring)]` workarounds (PR #22)

### Fix Applied
Added 19 `--color-*` registrations to `@theme` in `globals.css`:
```css
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-border: var(--border);
  /* ... all 19 shadcn/ui color tokens */
}
```

### Related
- PR #27: Bulk fix for all 4 UX gap issues
- PR #22: ring-ring workaround (now superseded by @theme fix)
