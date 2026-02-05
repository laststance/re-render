import { test, expect } from '../fixtures/app.fixture.js'
import { sel } from '../helpers/selectors.js'
import { categoryIds } from '../helpers/examples.js'

test.describe('Navigation', () => {
  test('sidebar shows all category toggles', async ({ app, page }) => {
    await app.goto('/')
    for (const id of categoryIds) {
      await expect(page.locator(sel.categoryToggle(id))).toBeVisible()
    }
  })

  test('category collapse and expand', async ({ app, page }) => {
    await app.goto('/')
    const toggle = page.locator(sel.categoryToggle('basics'))
    const list = page.locator(sel.categoryList('basics'))

    // Categories start expanded (basics is expanded by default on home)
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(list).toBeVisible()

    // Collapse
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    // Expand again
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(list).toBeVisible()
  })

  test('navigate via sidebar link', async ({ app, page }) => {
    await app.goto('/')
    // Use scoped sidebar selector to avoid matching landing page links
    await page.locator(sel.sidebarExampleLink('basics', 'props-change')).click()
    await expect(page).toHaveURL(/\/basics\/props-change/)
    await expect(page.locator(sel.exampleTitle)).toContainText('Props Change')
  })

  test('active example is highlighted', async ({ app, page }) => {
    await app.gotoExample('basics', 'state-change')
    const activeLink = page.locator(sel.sidebarExampleLink('basics', 'state-change'))
    await expect(activeLink).toHaveClass(/font-medium/)
  })

  test('navigate between examples preserves sidebar', async ({ app, page }) => {
    await app.gotoExample('basics', 'state-change')
    await page.locator(sel.sidebarExampleLink('basics', 'props-change')).click()
    await expect(page).toHaveURL(/\/basics\/props-change/)
    // Sidebar is still visible
    await expect(page.locator(sel.nav)).toBeVisible()
    // New example is active
    await expect(
      page.locator(sel.sidebarExampleLink('basics', 'props-change'))
    ).toHaveClass(/font-medium/)
  })

  test('Home link navigates to landing page', async ({ app, page }) => {
    await app.gotoExample('basics', 'state-change')
    await page.locator(sel.homeLink).click()
    await expect(page).toHaveURL('/')
  })

  test('direct URL navigation works', async ({ app, page }) => {
    await app.gotoExample('optimization', 'memo')
    await expect(page.locator(sel.exampleTitle)).toContainText('React.memo')
  })

  test('invalid route redirects to default example', async ({ page }) => {
    await page.goto('/invalid/invalid')
    await expect(page).toHaveURL(/\/basics\/state-change/)
  })
})
