'use client'

import dynamic from 'next/dynamic'

const ExamplePage = dynamic(
  () => import('@/views/ExamplePage').then((mod) => ({ default: mod.ExamplePage })),
  { ssr: false }
)

export default function ExamplePageClient() {
  return <ExamplePage />
}
