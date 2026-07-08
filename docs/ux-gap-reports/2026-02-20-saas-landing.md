# UX Gap Report: Re-Render vs SaaS Landing Page Tier

**Date**: 2026-02-20
**Target**: http://localhost:3219
**References**: Linear (linear.app), Vercel (vercel.com), Raycast (raycast.com)
**Category**: SaaS Landing Page

## Overall Score: 66/100

| Dimension | Score | Verdict |
|-----------|-------|---------|
| Typography & Spacing | 16/25 | Needs Work |
| Interactive States | 17/25 | Good |
| Content Hierarchy | 17/25 | Good |
| Loading & Error UX | 16/25 | Needs Work |

> **Context**: Re-Render is an educational developer tool, not a marketing SaaS product. This comparison against multi-million-dollar marketing pages (Linear, Vercel, Raycast) is intentionally aspirational. Scores reflect the gap honestly; recommendations are proportionate to the project's scope.

---

## Moderate Gaps (Score 50-75)

### 1. Missing Footer Section (Typography & Spacing / Content Hierarchy)

**Reference (Linear)**:
- 5-column footer grid: Product, Features, Company, Resources, Connect
- Legal links at bottom (Privacy, Terms, DPA)
- Consistent typography and spacing

**Reference (Vercel)**:
- 6+ column footer with Frameworks, SDKs, Use Cases, Company, Community
- "NEW" badges on recent products
- System status indicator + theme toggle

**Reference (Raycast)**:
- Multi-column links with external indicators (↗)
- Newsletter subscription form with email input
- Social media links

**Your Product**:
- No footer at all. Landing page ends abruptly after the preview card.

**Gap**: All 3 reference sites invest heavily in footers as navigation aids, trust signals, and engagement touchpoints. The target has zero footer content.

**Fix**: Add a minimal footer with:
```tsx
<footer className="border-t border-border bg-background px-6 py-8 mt-auto">
  <div className="mx-auto max-w-4xl flex justify-between text-sm text-muted-foreground">
    <div>
      <p className="font-medium text-foreground">Re-Render</p>
      <p>React re-render visualizer</p>
    </div>
    <div className="flex gap-6">
      <a href="https://github.com/laststance/re-render">GitHub</a>
      <a href="https://react.dev">React Docs</a>
    </div>
  </div>
</footer>
```

---

### 2. Hero Visual Impact (Content Hierarchy)

**Reference (Linear)**:
- Full-bleed dark background with 3D icon grid animation
- 64px heading with -1.4px letter-spacing
- Dramatic visual depth with layered feature icons

**Reference (Vercel)**:
- Colorful prismatic gradient visual below hero text
- 48px heading with -2.3px letter-spacing
- Grid overlay animation in background

**Reference (Raycast)**:
- Full-screen gradient background with diagonal light streaks
- 64px heading with product screenshot in macOS chrome
- Immersive visual experience

**Your Product**:
- Plain white background with text-only hero
- No background visual, gradient, or animation
- Hero heading is large but lacks the visual drama of references

**Gap**: All reference sites use dramatic dark backgrounds with gradient/animated visuals to create immediate visual impact. The target's hero feels flat and academic by comparison.

**Fix**: Add subtle visual interest without over-engineering:
```css
/* Add to landing page hero section */
.hero-section {
  background: linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%);
}
```
Consider a subtle CSS grid pattern or gradient background behind the hero text. Even a simple radial gradient adds depth.

---

### 3. 404 Page Layout Bug (Loading & Error UX)

**Reference**: All reference sites have 404 pages that use the full viewport width without layout constraints.

**Your Product**:
- 404 page renders inside the AppShell layout with sidebar visible
- Sidebar (320px) constrains the 404 content area
- Description text "The page you're looking for doesn't exist..." wraps word-by-word due to narrow available width

**Gap**: The 404 content area is squeezed by the sidebar, creating an awkward word-per-line text wrap that looks broken.

**Fix**: Either:
1. Add `max-w-md` to the description `<p>` tag to constrain text width (already present, but parent flex container needs `text-center` alignment fix)
2. Or render 404 page outside the sidebar layout for a full-width branded experience

```tsx
// In not-found.tsx — ensure flex container centers properly
<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
```

---

### 4. Typography Scale Refinement (Typography & Spacing)

**Reference sites' heading patterns:**
| Site | H1 Size | Weight | Letter-spacing |
|------|---------|--------|----------------|
| Linear | 64px | 510 | -1.408px |
| Vercel | 48px | 600 | -2.309px |
| Raycast | 64px | 600 | normal |

**Your Product:**
- Landing hero heading: ~40-48px estimated (large)
- Sidebar H1: 18px (same as body text on reference sites)
- No negative letter-spacing on headings

**Gap**: Reference sites use tight negative letter-spacing (-1.4 to -2.3px) on large headings for professional polish. Your headings use default letter-spacing.

**Fix**: Add tracking classes to large headings:
```tsx
// Landing page hero
<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
  React Re-render Visualizer
</h1>
```
Tailwind's `tracking-tight` adds `-0.025em` letter-spacing, which at 48px = -1.2px (close to Linear's -1.4px).

---

## Strengths (Score > 75%)

### 1. Interactive States — Hover & Focus (17/25)

Your product has solid interactive states:
- `hover:bg-accent/50` on sidebar items (visible since @theme fix)
- `active:scale-[0.98]` micro-interaction on buttons
- `focus-visible:ring-2 ring-ring` for keyboard accessibility
- Smooth `transition-colors` on all interactive elements
- Toast expand/collapse with animation

### 2. CTA Hierarchy (4/5 in Content Hierarchy)

Clean primary/secondary button pattern:
- "Start Learning" — dark filled button (primary)
- "React Docs" — outline button (secondary)
- Clear visual weight distinction between the two

### 3. Mobile Responsive Design

- Hamburger menu at mobile breakpoints
- Stacked layout works well on 375px viewport
- Touch targets meet Apple HIG 44px minimum

### 4. Fast Initial Load

- Static export (SSG) means instant page loads
- No loading spinners needed
- Content appears immediately

---

## Recommendations Summary

| Priority | Gap | Estimated Effort |
|----------|-----|-----------------|
| Moderate | Add minimal footer with GitHub + React Docs links | Small (1 component) |
| Moderate | Add subtle hero background gradient/visual | Small (CSS only) |
| Moderate | Fix 404 page layout when sidebar is visible | Small (CSS tweak) |
| Moderate | Add `tracking-tight` to hero headings | Trivial (1 class) |
