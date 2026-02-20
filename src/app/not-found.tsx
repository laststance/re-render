import Link from 'next/link'
import { getDefaultExample } from '@/data/examples'

export default function NotFound() {
  const { categoryId, exampleId } = getDefaultExample()
  const startPath = `/${categoryId}/${exampleId}`

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-6xl font-bold text-foreground/20">404</h1>
      <h2 className="text-2xl font-semibold text-foreground">Page not found</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist. Try one of these
        instead:
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Go Home
        </Link>
        <Link
          href={startPath}
          className="inline-flex min-h-[44px] items-center rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
        >
          Start Learning
        </Link>
      </div>
    </div>
  )
}
