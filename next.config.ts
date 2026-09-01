import { codeInspectorPlugin } from 'code-inspector-plugin'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: { unoptimized: true },
  // Option+Shift (Mac) / Alt+Shift (Windows) then click a DOM node to jump to its source.
  turbopack: {
    rules: codeInspectorPlugin({
      bundler: 'turbopack',
      hotKeys: ['altKey']
    }),
  },
}

export default nextConfig
