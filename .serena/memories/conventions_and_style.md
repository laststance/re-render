# Conventions and Code Style

## Naming & Structure
- Components: PascalCase (React convention)
- Files: PascalCase for components, camelCase for hooks/utils
- Barrel exports: `index.ts` in `hooks/`, `views/`, `components/layout/`, `components/visualization/`, `components/ui/`, `components/navigation/`
- Page views: `src/views/` (NOT `src/pages/` — conflicts with Next.js Pages Router)

## Patterns
- `cn()` utility from `src/lib/utils.ts` (clsx + tailwind-merge) for className composition
- CSS variables for light/dark theme support
- `'use client'` directive where browser APIs are needed
- Browser-only code guarded with `typeof document === 'undefined'`
- `next/dynamic({ ssr: false })` for Monaco Editor pages

## State Management
- Redux Toolkit: typed hooks `useAppDispatch`, `useAppSelector` from `src/store/hooks.ts`
- Two slices: `renderTrackerSlice` (render events) and `toastSlice` (notifications)
- Toast suppression via `useSuppressToasts` hook (triple-setTimeout timing)

## Type System
- All types in `src/types/` with barrel export
- Key types: `RenderReason`, `RenderInfo`, `ComponentNode`, `Example`, `CodeFile`

## Gotchas
- **reactStrictMode** enabled — double-invokes effects in dev
- **useState in tracked components** causes false positive render events — use CSS-only alternatives
- **E2E: Never use `force: true`** on Playwright clicks
- **E2E: Never use `el.remove()`** via `page.evaluate()` — use CSS hiding
- Toast selectors scoped to `div[aria-label="Notifications"]` (Monaco also uses `role="alert"`)
