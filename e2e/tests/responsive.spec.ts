import { test, expect } from '../fixtures/app.fixture.js'
import { sel } from '../helpers/selectors.js'

test.describe('Responsive Layout', () => {
  test('mobile: hamburger visible, sidebar hidden', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.locator(sel.hamburger).waitFor({ state: 'visible', timeout: 15_000 })
    await expect(page.locator(sel.hamburger)).toBeVisible()
    // Desktop sidebar (aside element) should not be visible on mobile
    await expect(page.locator('aside')).toHaveCount(0)
  })

  test('mobile: hamburger opens navigation sheet', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.locator(sel.hamburger).waitFor({ state: 'visible', timeout: 15_000 })
    await page.locator(sel.hamburger).click()
    await expect(page.locator(sel.mobileSheet)).toBeVisible()
  })

  test('mobile: sheet link navigates and closes sheet', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.locator(sel.hamburger).waitFor({ state: 'visible', timeout: 15_000 })
    await page.locator(sel.hamburger).click()
    await expect(page.locator(sel.mobileSheet)).toBeVisible()

    // Click an example link in the sheet
    const link = page.locator(sel.mobileSheet).locator('a[href="/conditions/state-change"]')
    await link.click()

    await expect(page).toHaveURL(/\/conditions\/state-change/)
    // Sheet closes via CSS transform (-translate-x-full) after navigation.
    // Check the transform class rather than visibility since the element stays in DOM.
    await expect(page.locator(sel.mobileSheet)).toHaveClass(/-translate-x-full/)
  })

  test('mobile: pane tab bar visible on example page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/conditions/state-change')
    // Wait for the page to load
    await page.locator(sel.exampleTitle).waitFor({ state: 'visible', timeout: 15_000 })
    // Mobile shows Code/Preview pane tabs
    await expect(page.locator(sel.paneTabList)).toBeVisible()
  })

  test('tablet: stacked layout with pane tabs', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 1024 })
    await page.goto('/conditions/state-change')
    await page.locator(sel.exampleTitle).waitFor({ state: 'visible', timeout: 15_000 })
    // Tablet should also show pane tab bar
    await expect(page.locator(sel.paneTabList)).toBeVisible()
  })

  test('desktop: split pane layout without pane tab bar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/conditions/state-change')
    await page.locator(sel.exampleTitle).waitFor({ state: 'visible', timeout: 15_000 })
    // Desktop uses split pane, no tab bar needed
    await expect(page.locator(sel.paneTabList)).toBeHidden()
  })
})
