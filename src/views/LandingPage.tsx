import Link from 'next/link'
import { exampleCategories, getDefaultExample } from '@/data/examples'

/**
 * Landing page explaining the site's purpose with quick navigation.
 * Provides:
 * - Clear headline explaining site purpose
 * - Quick start link to first example
 * - Overview of available categories
 * - Visual preview of the interface
 */
export function LandingPage() {
  const { categoryId, exampleId } = getDefaultExample()
  const quickStartPath = `/${categoryId}/${exampleId}`

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Hero Section */}
        <header className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            React Re-render Visualizer
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[var(--muted-foreground)]">
            Learn when and why React components re-render through interactive
            examples. Visualize component trees, trigger re-renders, and
            understand optimization techniques.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={quickStartPath}
              className="inline-flex min-h-[44px] items-center rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
            >
              Start Learning
            </Link>
            <a
              href="https://react.dev/learn/render-and-commit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-[var(--border)] px-6 py-3 font-medium transition-colors hover:bg-[var(--secondary)]"
            >
              React Docs
            </a>
          </div>
        </header>

        {/* Interface Preview */}
        <section className="mb-16">
          <h2 className="mb-6 text-center text-2xl font-semibold">
            Interactive Learning Environment
          </h2>
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--secondary)] px-4 py-2">
              <div className="h-3 w-3 rounded-full bg-red-500/60"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/60"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/60"></div>
              <span className="ml-2 text-sm text-[var(--muted-foreground)]">
                re-render visualizer
              </span>
            </div>
            <div className="grid md:grid-cols-2">
              {/* Code Pane Preview */}
              <div className="border-b border-[var(--border)] p-4 md:border-b-0 md:border-r">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  Code Editor
                </div>
                <div className="space-y-1.5 font-mono text-sm">
                  <div>
                    <span className="text-purple-500">const</span>{' '}
                    <span className="text-blue-500">[count, setCount]</span> ={' '}
                    <span className="text-yellow-600">useState</span>(0)
                  </div>
                  <div className="text-[var(--muted-foreground)]">
                    // Every click triggers a re-render
                  </div>
                  <div>
                    <span className="text-purple-500">return</span> (
                  </div>
                  <div className="pl-4">
                    &lt;<span className="text-green-600">button</span>{' '}
                    <span className="text-blue-500">onClick</span>=
                    {'{'}...{'}'}&gt;
                  </div>
                </div>
              </div>
              {/* Visualization Pane Preview */}
              <div className="p-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  Component Tree
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--secondary)] p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">App</span>
                      <span className="rounded-full bg-[var(--flash-color)] px-2 py-0.5 text-xs font-medium text-white">
                        2
                      </span>
                    </div>
                    <div className="ml-4 mt-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Counter</span>
                        <span className="rounded-full bg-[var(--flash-color)] px-2 py-0.5 text-xs font-medium text-white">
                          2
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Overview */}
        <section className="mb-16">
          <h2 className="mb-6 text-center text-2xl font-semibold">
            Explore by Topic
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {exampleCategories.map((category) => (
              <div
                key={category.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
              >
                <h3 className="mb-2 text-lg font-semibold">{category.name}</h3>
                <p className="mb-4 text-sm text-[var(--muted-foreground)]">
                  {getCategoryDescription(category.id)}
                </p>
                <ul className="space-y-1.5">
                  {category.examples.slice(0, 3).map((example) => (
                    <li key={example.id}>
                      <Link
                        href={`/${category.id}/${example.id}`}
                        className="text-sm text-[var(--primary)] underline-offset-2 hover:underline"
                      >
                        {example.title}
                      </Link>
                    </li>
                  ))}
                  {category.examples.length > 3 && (
                    <li className="text-sm text-[var(--muted-foreground)]">
                      +{category.examples.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Key Concepts */}
        <section className="mb-16">
          <h2 className="mb-6 text-center text-2xl font-semibold">
            Key Concepts You'll Learn
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {keyConcepts.map((concept, index) => (
              <div
                key={index}
                className="flex gap-4 rounded-lg border border-[var(--border)] p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)] text-xl">
                  {concept.icon}
                </div>
                <div>
                  <h3 className="font-medium">{concept.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {concept.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-8">
            <h2 className="mb-2 text-xl font-semibold">Ready to Start?</h2>
            <p className="mb-4 text-[var(--muted-foreground)]">
              Explore every re-render condition, then learn optimization techniques to prevent unnecessary renders.
            </p>
            <Link
              href={quickStartPath}
              className="inline-flex min-h-[44px] items-center rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
            >
              Start with State Changes
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

/**
 * Get a brief description for each category.
 */
function getCategoryDescription(categoryId: string): string {
  switch (categoryId) {
    case 'conditions':
      return 'All the conditions that trigger React re-renders: state changes, props, context, parent re-renders, and more.'
    case 'optimization':
      return 'Skip unnecessary re-renders with React.memo, useCallback, useMemo, and composition patterns.'
    default:
      return ''
  }
}

/**
 * Key concepts shown on the landing page.
 */
const keyConcepts = [
  {
    icon: '🔄',
    title: 'Re-render Triggers',
    description:
      'State changes, prop changes, and parent re-renders cause components to update.',
  },
  {
    icon: '🌳',
    title: 'Component Trees',
    description:
      'Visualize how re-renders propagate through your component hierarchy.',
  },
  {
    icon: '⚡',
    title: 'Optimization',
    description:
      'Learn when and how to use memo, useCallback, and useMemo effectively.',
  },
  {
    icon: '🎯',
    title: 'Best Practices',
    description:
      'Composition patterns, context splitting, and deferred rendering for smooth UIs.',
  },
]
