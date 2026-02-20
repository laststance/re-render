import Link from 'next/link'
import { getDefaultExample } from '@/data/examples'

export default function NotFound() {
  let startPath = '/'
  try {
    const { categoryId, exampleId } = getDefaultExample()
    startPath = `/${categoryId}/${exampleId}`
  } catch {
    // fall back to home if examples data is unavailable
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="flex w-full max-w-[28rem] flex-col items-center gap-6 text-center">
        <h1 className="text-6xl font-bold tracking-tighter text-foreground/20">404</h1>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Page not found</h2>
        <p className="text-sm text-muted-foreground">
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
    </div>
  )
}
