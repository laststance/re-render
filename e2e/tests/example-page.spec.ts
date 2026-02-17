import { test, expect } from '../fixtures/app.fixture.js'
import { sel } from '../helpers/selectors.js'
import { examples } from '../helpers/examples.js'

test.describe('Example Page', () => {
  test('displays title and description', async ({ app, page }) => {
    await app.gotoExample('conditions', 'state-change')
    await expect(page.locator(sel.exampleTitle)).toHaveText('State Change')
    await expect(page.locator(sel.exampleDescription)).toContainText(
      'How useState triggers re-renders'
    )
  })

  test('code editor loads with file tabs', async ({ app, page }) => {
    await app.gotoExample('conditions', 'state-change')
    await expect(page.locator(sel.fileTabList)).toBeVisible()
    // At least one file tab
    const tabCount = await page.locator(`${sel.fileTabList} button[role="tab"]`).count()
    expect(tabCount).toBeGreaterThanOrEqual(1)
  })

  test('file tabs switch content in multi-file example', async ({ app, page }) => {
    // context-change has multiple files (app, context, display, button)
    await app.gotoExample('conditions', 'context-change')
    const tabs = page.locator(`${sel.fileTabList} button[role="tab"]`)
    const tabCount = await tabs.count()

    // Should have multiple file tabs
    expect(tabCount).toBeGreaterThan(1)

    // First tab is selected by default
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')

    // Click second tab
    await tabs.nth(1).click()
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'false')
  })

  test('explanation panel is always visible', async ({ app, page }) => {
    await app.gotoExample('conditions', 'state-change')
    const panel = page.locator(sel.explanationPanel)
    await expect(panel).toBeVisible()
  })

  test('explanation shows key points', async ({ app, page }) => {
    await app.gotoExample('conditions', 'state-change')
    const panel = page.locator(sel.explanationPanel)
    await expect(panel).toContainText('Key Points')
  })

  test('component tree is visible in default view', async ({ app, page }) => {
    await app.gotoExample('conditions', 'state-change')
    // Two data-component="App" exist (tree view + live preview); use first (tree view)
    await expect(page.locator(sel.componentBox('App')).first()).toBeVisible()
  })

  test('all 20 examples load without error', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    for (const ex of examples) {
      await page.goto(`/${ex.categoryId}/${ex.exampleId}`)
      await page
        .locator(sel.exampleTitle)
        .waitFor({ state: 'visible', timeout: 15_000 })

      const title = await page.locator(sel.exampleTitle).textContent()
      expect(title).toBeTruthy()
    }

    expect(errors).toHaveLength(0)
  })
})
