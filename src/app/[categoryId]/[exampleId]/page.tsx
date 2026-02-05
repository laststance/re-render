import { exampleCategories } from '@/data/examples'
import ExamplePageClient from './ExamplePageClient'

/**
 * Generate all static paths for the example pages.
 * Required for Next.js static export (`output: 'export'`).
 */
export function generateStaticParams() {
  return exampleCategories.flatMap((cat) =>
    cat.examples.map((ex) => ({ categoryId: cat.id, exampleId: ex.id }))
  )
}

export default function Page() {
  return <ExamplePageClient />
}
