# Re-Render

An interactive React re-render visualizer that helps developers understand when and why components re-render. Explore live code examples, watch component trees light up on each render, and learn optimization techniques — all in the browser.

## Features

- **20 interactive examples** across 2 categories (Without Memo / With Memo)
- **Live code editor** — Monaco Editor with syntax-highlighted, read-only example code
- **Component tree visualization** — recursive tree with render count badges and flash-on-render animation
- **Render tracking** — detects render reason (state change, props change, parent re-render, context, etc.)
- **Toast notifications** — real-time feedback when components re-render
- **Dark / Light theme** — system preference detection with manual toggle
- **Responsive layout** — resizable split panes on desktop, stacked on mobile

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, static export) |
| UI | React 19 + TypeScript 5.9 (strict) |
| State | Redux Toolkit |
| Styling | Tailwind CSS 4 + shadcn/ui patterns |
| Editor | Monaco Editor |
| Layout | react-resizable-panels |
| Testing | Playwright (202 E2E tests) |

## Getting Started

```bash
# Clone
git clone https://github.com/laststance/re-render.git
cd re-render

# Install dependencies
pnpm install

# Start dev server (port 3219)
pnpm dev
```

Open [http://localhost:3219](http://localhost:3219) to start learning.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack (port 3219) |
| `pnpm build` | Static export build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript strict check |
| `pnpm test:e2e` | Playwright E2E tests |

## Examples

### Without Memo (14 examples)

Default rendering behavior — understand how React re-renders propagate.

| Example | What You'll Learn |
|---------|------------------|
| State Change | `useState` triggers re-renders in the owning component |
| Props Change | New prop values cause child re-renders |
| Parent Re-render | Children re-render when parents do, even without prop changes |
| Context Change | Context value updates re-render all consumers |
| Force Update | Manually triggering re-renders with `useReducer` hack |
| useReducer | Dispatch-driven state and re-render behavior |
| useSyncExternalStore | Subscribing to external stores without tearing |
| Suspense | How Suspense boundaries affect render lifecycle |
| Concurrent Features | `useTransition` and `useDeferredValue` in action |
| Effect Dependencies | How `useEffect` deps relate to re-renders |
| Refs vs State | Why `useRef` mutations don't trigger re-renders |
| Compound Component | Shared state via context in compound patterns |
| Render Props | Re-render behavior with render prop callbacks |

### With Memo (7 examples)

Optimization techniques — skip unnecessary re-renders.

| Example | What You'll Learn |
|---------|------------------|
| React.memo | Memoize components to skip re-renders on same props |
| useCallback | Stabilize function references for memoized children |
| useMemo | Cache expensive computations between renders |
| React.lazy | Code splitting and lazy-loaded component behavior |
| Children Pattern | Composition as an alternative to `React.memo` |
| useCallback Comparison | Before/after: with vs without `useCallback` |
| useMemo Comparison | Before/after: with vs without `useMemo` |

## Project Structure

```
src/
├── app/              # Next.js App Router (routes + layout)
├── components/
│   ├── layout/       # SplitPaneLayout, CodeEditor, VisualizationPane
│   ├── navigation/   # Sidebar
│   ├── ui/           # Toast, TriggerButton, ExplanationPanel, FileTabs
│   └── visualization/# ComponentBox, LivePreview
├── data/             # Example definitions, live previews, trigger configs
├── hooks/            # useRenderTracker (core), useReRenderToasts, etc.
├── store/            # Redux slices (renderTracker, toast)
├── types/            # TypeScript type definitions
└── views/            # ExamplePage, LandingPage
```

## License

MIT - [Laststance.io](https://github.com/laststance)
