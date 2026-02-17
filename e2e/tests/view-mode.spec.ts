import { test, expect } from '../fixtures/app.fixture.js'
import { sel } from '../helpers/selectors.js'

test.describe('View Mode', () => {
  test.beforeEach(async ({ app, page }) => {
    await app.gotoExample('conditions', 'state-change')
    // Reset to clear layout-switch renders and toasts
    await app.reset()
    await page.waitForTimeout(500)
  })

  test('tree view is the default', async ({ page }) => {
    const treeTab = page.locator(sel.viewModeTab('Tree'))
    await expect(treeTab).toHaveAttribute('aria-selected', 'true')
  })

  test('switch to live view', async ({ app, page }) => {
    await app.setViewMode('Live')
    const liveTab = page.locator(sel.viewModeTab('Live'))
    await expect(liveTab).toHaveAttribute('aria-selected', 'true')
  })

  test('switch back to tree view shows component boxes', async ({ app, page }) => {
    await app.setViewMode('Live')
    await app.setViewMode('Tree')
    await expect(page.locator(sel.componentBox('App')).first()).toBeVisible()
  })

  test('overlay toggle changes aria-pressed state', async ({ app, page }) => {
    await app.setViewMode('Live')
    await page.waitForTimeout(300)
    // Dismiss toasts that might overlay the button
    await app.dismissToastsViaJs()
    const overlayBtn = page.locator(sel.overlayToggle).first()

    if (await overlayBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const initialPressed = await overlayBtn.getAttribute('aria-pressed')
      await overlayBtn.click()
      await page.waitForTimeout(200)
      const newPressed = await overlayBtn.getAttribute('aria-pressed')
      expect(newPressed).not.toBe(initialPressed)
    }
  })

  test('trigger in live view reflected in tree view counts', async ({ app }) => {
    await app.setViewMode('Live')
    await app.clickTrigger('Trigger State Change')
    await app.setViewMode('Tree')

    const count = await app.getRenderCount('App')
    expect(Number(count)).toBeGreaterThan(0)
  })
})
