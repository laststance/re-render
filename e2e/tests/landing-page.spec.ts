import { test, expect } from '../fixtures/app.fixture.js'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ app }) => {
    await app.goto('/')
  })

  test('renders hero section with title, description, and CTAs', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.locator('h1')).toHaveText('React Re-render Visualizer')
    await expect(main.locator('header p')).toContainText(
      'Learn when and why React components re-render'
    )
    await expect(page.getByRole('link', { name: 'Start Learning' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'React Docs' })).toBeVisible()
  })

  test('"Start Learning" navigates to first example', async ({ page }) => {
    await page.getByRole('link', { name: 'Start Learning' }).click()
    await expect(page).toHaveURL(/\/basics\/state-change/)
  })

  test('shows 3 category cards in "Explore by Topic" section', async ({ page }) => {
    const main = page.locator('main')
    // Use getByRole within main to find category card titles
    await expect(main.getByRole('heading', { name: 'Basics', level: 3 }).first()).toBeVisible()
    await expect(main.getByRole('heading', { name: 'Advanced', level: 3 })).toBeVisible()
  })

  test('category cards show example links and overflow count', async ({ page }) => {
    const main = page.locator('main')
    // Basics has 5 examples: shows 3 links + "+2 more"
    const basicsCard = main.getByRole('heading', { name: 'Basics', level: 3 }).locator('..')
    await expect(basicsCard.getByRole('link')).toHaveCount(3)
    await expect(basicsCard).toContainText('+2 more')
  })

  test('"Ready to Start?" CTA navigates correctly', async ({ page }) => {
    await page.getByRole('link', { name: 'Start with State Changes' }).click()
    await expect(page).toHaveURL(/\/basics\/state-change/)
  })
})
