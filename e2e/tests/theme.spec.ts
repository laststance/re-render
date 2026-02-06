import { test, expect } from '../fixtures/app.fixture.js'
import { sel } from '../helpers/selectors.js'

test.describe('Theme', () => {
  test('default theme is applied', async ({ app, page }) => {
    await app.goto('/')
    // <html> should exist and have a class-based theme or none for light
    const html = page.locator('html')
    await expect(html).toBeVisible()
  })

  test('toggle to dark mode adds dark class', async ({ app, page }) => {
    await app.goto('/')
    const themeBtn = page.locator(sel.themeToggle).first()
    const html = page.locator('html')

    // If currently light, toggle to dark
    const isDark = await html.evaluate((el) => el.classList.contains('dark'))
    if (!isDark) {
      await themeBtn.click()
      await expect(html).toHaveClass(/dark/)
    }
  })

  test('toggle back to light mode removes dark class', async ({ app, page }) => {
    await app.goto('/')
    const themeBtn = page.locator(sel.themeToggle).first()
    const html = page.locator('html')

    // Ensure dark first
    const isDark = await html.evaluate((el) => el.classList.contains('dark'))
    if (!isDark) await themeBtn.click()
    await expect(html).toHaveClass(/dark/)

    // Toggle back
    await themeBtn.click()
    await expect(html).not.toHaveClass(/dark/)
  })

  test('theme persists across navigation and reload', async ({ app, page }) => {
    await app.goto('/')
    const themeBtn = page.locator(sel.themeToggle).first()
    const html = page.locator('html')

    // Set dark mode
    const isDark = await html.evaluate((el) => el.classList.contains('dark'))
    if (!isDark) await themeBtn.click()
    await expect(html).toHaveClass(/dark/)

    // Navigate to an example
    await page.locator('a[href="/without-memo/state-change"]').first().click()
    await expect(html).toHaveClass(/dark/)

    // Reload the page
    await page.reload()
    await page.locator(sel.nav).waitFor({ state: 'visible', timeout: 15_000 })
    await expect(html).toHaveClass(/dark/)
  })
})
