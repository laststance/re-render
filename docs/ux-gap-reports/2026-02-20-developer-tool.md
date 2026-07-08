# UX Gap Report: re-render vs Developer Tool Tier

**Date**: 2026-02-20
**Target**: http://localhost:3219
**References**: TypeScript Playground, Tailwind Play, React.dev
**Category**: Developer Tool / Playground

## Overall Score: 70/100

| Dimension | Score | Verdict |
|-----------|-------|---------|
| Typography & Spacing | 17/25 | Good |
| Interactive States | 17/25 | Good |
| Content Hierarchy | 20/25 | Good |
| Loading & Error UX | 16/25 | Needs Work |

**Overall Verdict**: Good — Competitive quality with specific areas to improve.

---

## Moderate Gaps (Score 50-75)

### 1. Default 404 Page — No Custom Branding (1/4 in Loading & Error UX)

**Reference** (React.dev):
React.dev has a branded 404 page with search suggestions, navigation links, and a "Go back home" button that maintains the site's design language.

**Your Product**:
Default Next.js "404 | This page could not be found." with no branding, no navigation, no helpful suggestions. The sidebar is visible in dark mode but the main content area is a stark black void.

**Gap**: The 404 page provides zero help for lost users. No way to navigate back except the browser back button. No search, no suggested pages, no link to home. This is the most jarring experience gap compared to all three reference sites.

**Fix**:
Create a custom `src/app/not-found.tsx`:
```tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
      <h1 className="text-6xl font-bold text-foreground/20">404</h1>
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground text-center max-w-md">
        The page you're looking for doesn't exist.
        Try one of these instead:
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary">Go Home</Link>
        <Link href="/conditions/state-change" className="btn-secondary">
          Start Learning
        </Link>
      </div>
    </div>
  );
}
```

---

### 2. Mobile Sidebar Overlay — Content Bleed-Through (Bug)

**Reference** (React.dev):
React.dev's mobile sidebar opens with a dark semi-opaque backdrop that dims the main content, providing clear visual separation. The sidebar content is fully readable.

**Your Product**:
The mobile sidebar overlay opens without a proper backdrop. Main content (hero text, CTA buttons, demo mockup) is fully visible behind sidebar items, creating an unreadable overlapping mess. Sidebar navigation text directly overlaps with page content.

**Gap**: This is more than a UX gap — it's a functional bug. Users on mobile cannot effectively use the sidebar navigation because text overlaps make items unreadable and untappable.

**Fix**:
Add an opaque/semi-opaque backdrop behind the mobile sidebar:
```tsx
{/* Mobile sidebar overlay backdrop */}
{isOpen && (
  <div
    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
    onClick={() => setIsOpen(false)}
    aria-hidden="true"
  />
)}
```
Ensure the sidebar itself has `z-50` and a solid background color (not transparent).

---

### 3. Sidebar Nav Items — Missing Hover States (2/5 in Interactive States)

**Reference** (React.dev):
Sidebar nav items highlight with a background color change on hover (`bg-gray-100` in light mode). The active item has an accent-colored left border and bold text. Hover transitions are smooth (~150ms).

**Reference** (TypeScript Playground):
Dropdown menu items highlight with background color on hover. Clear visual feedback on every interactive element.

**Your Product**:
Sidebar navigation items (e.g., "State Change", "Props Change") show NO visible background change on hover. The items are clickable but provide no visual feedback that they're interactive. Only the active item has visual distinction.

**Gap**: Users can't tell which sidebar items are clickable. The lack of hover feedback makes the navigation feel static and unresponsive compared to reference sites.

**Fix**:
Add hover background to sidebar nav links:
```css
/* Sidebar nav item */
.sidebar-nav-item {
  @apply rounded-md px-2 py-1.5
    hover:bg-accent/50
    transition-colors duration-150;
}
```

---

### 4. Very Small Font Sizes — Accessibility Concern (3/5 in Typography)

**Reference** (Tailwind Play):
Minimum font size is 12px for UI text. Most interactive text is 14px.

**Reference** (React.dev):
Minimum font size is 13px. Sidebar section headers use 13px semibold.

**Your Product**:
Sidebar status indicators use **9px** and **10px** font sizes. The `<Child />` and `<Memo />` column headers and the ✕/✓ indicators use extremely small text.

**Gap**: 9-10px text is below the widely recommended 12px minimum for readable UI text. This fails accessibility guidelines and causes readability issues, especially on high-DPI mobile screens.

**Fix**:
Increase minimum font size to 12px across all UI elements:
```css
/* Sidebar status indicators */
.status-indicator { font-size: 12px; }
.column-header { font-size: 12px; font-weight: 600; }
```

---

### 5. No Letter-Spacing on Headings & Labels (1/2 in Typography)

**Reference** (React.dev):
Section headers like "GET STARTED", "LEARN REACT" use uppercase with `letter-spacing: 0.05em` for readability.

**Reference** (Tailwind Play):
The "Generated CSS" label uses tight tracking. Headings use slightly negative letter-spacing for visual tightness.

**Your Product**:
Category headers like "WHEN DOES REACT RE-RENDER?", "ADVANCED PATTERNS", "OPTIMIZATION" use uppercase text with default letter-spacing. Large headings like "React Re-render Visualizer" also use default spacing.

**Gap**: Uppercase labels without letter-spacing appear cramped. Large headings without tighter tracking look less polished than reference sites.

**Fix**:
```css
/* Uppercase section labels */
.section-label {
  @apply uppercase text-xs font-semibold tracking-wider;
  /* tracking-wider = letter-spacing: 0.05em */
}

/* Large headings */
h1.hero-title {
  @apply tracking-tight;
  /* tracking-tight = letter-spacing: -0.025em */
}
```

---

## Strengths (Score > 75)

### 1. Content Hierarchy (20/25 — Good)

The landing page has excellent visual hierarchy:
- Clear primary CTA ("Start Learning" — filled black) vs secondary ("React Docs" — outlined)
- Well-structured sections with "Interactive Learning Environment" demo mockup
- Topic cards with clear category separation
- Example pages have logical flow: explanation → code → visualization

### 2. CTA Design (4/5)

The dual-CTA approach matches reference site patterns perfectly. "Start Learning" as the primary filled button draws the eye first, while "React Docs" as outlined provides a clear secondary path.

### 3. Split Pane Code + Visualization (Unique Strength)

The resizable split pane with Monaco editor on the left and component tree visualization on the right is a strong, unique layout that matches the quality of Tailwind Play and TypeScript Playground's split pane patterns.

### 4. Active Press Feedback (3/3)

The `active:scale-[0.98]` press feedback on interactive elements (added in PR #22) provides satisfying tactile feedback that matches modern UI patterns.

### 5. Focus Ring Implementation (4/5)

Focus-visible rings using `ring-[var(--ring)]` (Tailwind CSS 4 compatible) provide good keyboard navigation support, addressing WCAG 2.4.7.

---

## Recommendations Summary

| Priority | Gap | Estimated Effort | Impact |
|----------|-----|-----------------|--------|
| Critical | Mobile sidebar overlay content bleed-through | Small (CSS fix) | High — broken on mobile |
| Moderate | Default 404 page — no custom branding | Small (new component) | Medium — affects lost users |
| Moderate | Sidebar nav items missing hover states | Small (CSS addition) | Medium — navigation feel |
| Moderate | Very small font sizes (9-10px) | Small (CSS updates) | Medium — accessibility |
| Low | No letter-spacing on headings/labels | Small (CSS tweaks) | Low — polish |

---

## Methodology

### Reference Sites Crawled
1. **TypeScript Playground** (https://www.typescriptlang.org/play) — Split pane editor, toolbar, dropdown navigation
2. **Tailwind Play** (https://play.tailwindcss.com) — Split pane HTML/CSS editor + live preview
3. **React.dev** (https://react.dev/learn) — Sidebar navigation, Sandpack editor, three-column layout

### Target Scenarios Executed
- Landing page impression (desktop)
- Example page (State Change) with split pane layout
- Sidebar navigation hover states
- Trigger button hover states
- 404 page at `/nonexistent-page-404`
- Mobile responsive at 375x812px
- Mobile sidebar overlay

### CSS Metrics Collected
- Typography scales from all 4 sites
- Transition properties from interactive elements
- Font family and weight analysis

### Scoring Rubric
4-dimension system (0-25 each, 0-100 total) based on UX Gap Detector scoring rubric.
