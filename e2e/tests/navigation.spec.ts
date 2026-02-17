import { test, expect } from '../fixtures/app.fixture.js'
import { sel } from '../helpers/selectors.js'

test.describe('Navigation', () => {
  test('conditions section is always expanded (no toggle)', async ({ app, page }) => {
    await app.goto('/')
    // Conditions section has no collapse toggle — always visible
    const list = page.locator(sel.categoryList('conditions'))
    await expect(list).toBeVisible()
    // No toggle button for conditions
    await expect(page.locator(sel.categoryToggle('conditions'))).toHaveCount(0)
  })

  test('optimization section collapse and expand', async ({ app, page }) => {
    await app.goto('/')
    const toggle = page.locator(sel.categoryToggle('optimization'))
    const list = page.locator(sel.categoryList('optimization'))

    // Optimization starts collapsed on home page
    await expect(toggle).toBeVisible()

    // Expand
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(list).toBeVisible()

    // Collapse again
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('navigate via sidebar link', async ({ app, page }) => {
    await app.goto('/')
    // Use scoped sidebar selector to avoid matching landing page links
    await page.locator(sel.sidebarExampleLink('conditions', 'props-change')).click()
    await expect(page).toHaveURL(/\/conditions\/props-change/)
    await expect(page.locator(sel.exampleTitle)).toContainText('Props Change')
  })

  test('active example is highlighted', async ({ app, page }) => {
    await app.gotoExample('conditions', 'state-change')
    const activeLink = page.locator(sel.sidebarExampleLink('conditions', 'state-change'))
    await expect(activeLink).toHaveClass(/font-medium/)
  })

  test('navigate between examples preserves sidebar', async ({ app, page }) => {
    await app.gotoExample('conditions', 'state-change')
    await page.locator(sel.sidebarExampleLink('conditions', 'props-change')).click()
    await expect(page).toHaveURL(/\/conditions\/props-change/)
    // Sidebar is still visible
    await expect(page.locator(sel.nav)).toBeVisible()
    // New example is active
    await expect(
      page.locator(sel.sidebarExampleLink('conditions', 'props-change'))
    ).toHaveClass(/font-medium/)
  })

  test('Home link navigates to landing page', async ({ app, page }) => {
    await app.gotoExample('conditions', 'state-change')
    await page.locator(sel.homeLink).click()
    await expect(page).toHaveURL('/')
  })

  test('direct URL navigation works', async ({ app, page }) => {
    await app.gotoExample('optimization', 'memo')
    await expect(page.locator(sel.exampleTitle)).toContainText('React.memo')
  })

  test('invalid route redirects to default example', async ({ page }) => {
    await page.goto('/invalid/invalid')
    await expect(page).toHaveURL(/\/conditions\/state-change/)
  })
})
