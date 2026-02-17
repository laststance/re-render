import { test, expect } from '../fixtures/app.fixture.js'
import { sel } from '../helpers/selectors.js'

test.describe('Navigation', () => {
  test('comparison matrix grid is visible on load', async ({ app, page }) => {
    await app.goto('/')
    // Matrix grid is always visible with conditions rows
    const matrix = page.locator(sel.matrixGrid)
    await expect(matrix).toBeVisible()
    // First example row should be visible (conditions are always expanded)
    await expect(
      page.locator(sel.sidebarExampleLink('conditions', 'state-change'))
    ).toBeVisible()
  })

  test('optimization section collapse and expand', async ({ app, page }) => {
    await app.goto('/')
    const toggle = page.locator(sel.optimizationToggle)

    // Optimization starts collapsed on home page
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    // Expand
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(
      page.locator(sel.sidebarExampleLink('optimization', 'usecallback'))
    ).toBeVisible()

    // Collapse again
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('navigate via sidebar link', async ({ app, page }) => {
    await app.goto('/')
    await page.locator(sel.sidebarExampleLink('conditions', 'props-change')).click()
    await expect(page).toHaveURL(/\/conditions\/props-change/)
    await expect(page.locator(sel.exampleTitle)).toContainText('Props Change')
  })

  test('active example row is highlighted', async ({ app, page }) => {
    await app.gotoExample('conditions', 'state-change')
    const activeRow = page.locator(sel.sidebarExampleRow('conditions', 'state-change'))
    await expect(activeRow).toHaveClass(/bg-accent/)
  })

  test('navigate between examples preserves sidebar', async ({ app, page }) => {
    await app.gotoExample('conditions', 'state-change')
    await page.locator(sel.sidebarExampleLink('conditions', 'props-change')).click()
    await expect(page).toHaveURL(/\/conditions\/props-change/)
    // Sidebar is still visible
    await expect(page.locator(sel.nav)).toBeVisible()
    // New example row is active
    await expect(
      page.locator(sel.sidebarExampleRow('conditions', 'props-change'))
    ).toHaveClass(/bg-accent/)
  })

  test('Home link navigates to landing page', async ({ app, page }) => {
    await app.gotoExample('conditions', 'state-change')
    await page.locator(sel.homeLink).click()
    await expect(page).toHaveURL('/')
  })

  test('direct URL navigation works', async ({ app, page }) => {
    await app.gotoExample('optimization', 'usecallback')
    await expect(page.locator(sel.exampleTitle)).toContainText('useCallback')
  })

  test('invalid route shows empty content', async ({ page }) => {
    await page.goto('/invalid/invalid')
    // No redirect — page stays at invalid URL
    await expect(page).toHaveURL('/invalid/invalid')
    // No example title should render (ExamplePage returns null)
    await expect(page.locator(sel.exampleTitle)).not.toBeVisible()
  })
})
