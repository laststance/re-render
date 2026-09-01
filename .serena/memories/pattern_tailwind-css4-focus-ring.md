## Pattern: Tailwind CSS 4 Focus Ring with CSS Custom Properties

**Context**: When using CSS custom properties (e.g., `--ring` in `:root`) with Tailwind CSS 4, the utility class `ring-ring` does NOT resolve. Tailwind 4's `ring-ring` looks for a theme color, not `:root` CSS variables.

**Problem**: `focus-visible:ring-ring` produces invisible focus rings (WCAG 2.4.7 violation) when `--ring` is defined only in `:root` and not in `@theme`.

**Solution**: Use arbitrary value syntax: `ring-[var(--ring)]`

**Correct Pattern**:
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1
```

**Wrong Pattern**:
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
```

**When to Use**: Any time you need focus rings with CSS custom property colors in Tailwind CSS 4.
