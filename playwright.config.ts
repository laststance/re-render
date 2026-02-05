import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for re-render E2E tests.
 * Chromium-only, with auto-started dev server.
 */
export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: 'http://localhost:3219',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    port: 3219,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
