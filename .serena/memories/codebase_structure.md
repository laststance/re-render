# Codebase Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout ('use client', Redux Provider + AppShell)
│   ├── page.tsx            # Landing page route
│   ├── globals.css         # Global styles + Tailwind
│   └── [categoryId]/[exampleId]/
│       ├── page.tsx        # Dynamic route with generateStaticParams()
│       └── ExamplePageClient.tsx
├── components/
│   ├── layout/             # SplitPaneLayout, CodeEditor (Monaco), VisualizationPane
│   ├── navigation/         # Sidebar
│   ├── ui/                 # Toast, TriggerButton, TriggerPanel, ResetButton, ThemeToggle, ExplanationPanel, FileTabs
│   └── visualization/      # ComponentBox, ComponentBoxView, LivePreview, LivePreviewWrapper
├── hooks/                  # useRenderTracker (core), useReRenderToasts, useSuppressToasts, useFlashOnChange, etc.
├── data/                   # Example definitions, live preview components, trigger configs
├── store/                  # Redux: renderTrackerSlice, toastSlice, hooks
├── types/                  # TypeScript type definitions
├── views/                  # ExamplePage, LandingPage
├── lib/                    # cn() utility
└── assets/                 # Static assets

e2e/
├── tests/                  # 9 spec files (landing-page, navigation, example-page, render-tracking, etc.)
├── fixtures/               # AppPage class (Page Object Model)
└── helpers/                # Selectors, example data
```
