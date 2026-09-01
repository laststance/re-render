# re-render — Project Overview

## Purpose
Interactive React re-render visualizer — an educational tool helping developers understand when and why React components re-render. Provides live code examples, interactive component tree visualizations with render count tracking, and detailed explanations across 20 examples in 2 categories.

## Tech Stack
- **Framework**: Next.js 16 (App Router, static export) + React 19
- **Language**: TypeScript 5.9 (strict mode)
- **State**: Redux Toolkit (renderTrackerSlice + toastSlice)
- **Styling**: Tailwind CSS 4 + shadcn/ui patterns
- **Editor**: Monaco Editor (read-only code display)
- **Layout**: react-resizable-panels (split pane)
- **Icons**: lucide-react
- **Testing**: Playwright (Chromium-only, 171 E2E tests)
- **Package Manager**: pnpm

## Key Architecture
- Path alias: `@/*` → `./src/*`
- Routes: `/` (LandingPage) and `/[categoryId]/[exampleId]` (ExamplePage)
- Root layout is `'use client'` with Redux Provider + AppShell
- Core hook: `useRenderTracker` — captures render events, detects reason, dispatches to Redux
- Toast pipeline: `useRenderTracker` → Redux `recordRender` → `listenerMiddleware` (300ms debounce batch) → `addToast`/`addBatchToast` → `ToastContainer` (portal, top-right)
- Suppression: `suppressToasts` flag in toastSlice, toggled by `useSuppressToasts` hook (triple-setTimeout for useRenderTracker timing)
- Example data pipeline: `examples.ts` → `livePreviewExamples.tsx` → `livePreviewMap.ts` → `triggerConfig.ts`
- ExamplePage loaded via `next/dynamic({ ssr: false })` to avoid SSR issues with Monaco
- Shared constants: `src/data/renderReasonLabels.ts` — REASON_LABELS, REASON_EXPLANATIONS, REACT_MECHANISMS, REASON_PRIORITY

## Categories (URL structure)
- `/conditions/*` — 13 re-render conditions (5 basic + 8 advanced patterns)
  - Sidebar splits at `BASIC_CONDITIONS_COUNT = 5`: "When does React re-render?" + "Advanced Patterns"
- `/optimization/*` — 7 optimization examples (memo, useCallback, useMemo, etc.)

## Design Tokens
- Theme colors: `--flash-color` (orange/Child), `--flash-color-memo` (blue/MemoizedChild)
- Corner radius: `--radius-xs` (2px), `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px), `--radius-xl` (20px)
- Focus rings: `focus-visible:ring-[var(--ring)]` (NOT `ring-ring` — Tailwind 4 won't resolve it)
- Press feedback: `active:scale-[0.98]` on all interactive elements
- Tap targets: `min-h-[44px] min-w-[44px]` (Apple HIG)
- Heading hierarchy: h1=text-4xl, h2=text-2xl, h3=text-lg

## GitHub
- Repo: `laststance/re-render` (public)
- All issues through #36 CLOSED
- PR #22: 12 semantic review issues resolved (a11y, DRY, CSS consistency, UX)
- PR #32: UX gap fixes (hero visual, footer, tracking-tight, 404 layout)
- PR #37: RTK listener middleware refactor (toast pipeline architecture)

## CRITICAL References
- MUST read: `suggested_commands` for dev/build/test commands
- MUST read: `conventions_and_style` for code patterns
- MUST read: `task_completion_checklist` for verification steps
- MUST read: `pattern_tailwind-css4-focus-ring` for focus ring pattern
