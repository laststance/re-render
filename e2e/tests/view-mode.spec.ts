import type { Page } from '@playwright/test'
import { test, expect } from '../fixtures/app.fixture.js'
import { sel } from '../helpers/selectors.js'

// Preview wrappers carry data-component but no data-variant (unlike tree
// ComponentBox nodes), and their overlay chrome is a direct aria-hidden child.
const liveWrapper = (page: Page, name: string) =>
  page.locator(`div[data-component="${name}"]:not([data-variant])`)
const overlayChrome = (page: Page, name: string) =>
  liveWrapper(page, name).locator('> div[aria-hidden="true"]')

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
    await expect(overlayBtn).toBeVisible()

    const initialPressed = await overlayBtn.getAttribute('aria-pressed')
    await overlayBtn.click()
    await page.waitForTimeout(200)
    const newPressed = await overlayBtn.getAttribute('aria-pressed')
    expect(newPressed).not.toBe(initialPressed)
  })

  test('hovering a live preview component shows its boundary overlay', async ({ app, page }) => {
    // Arrange — overlays are enabled by default
    await app.setViewMode('Live')
    const wrapper = liveWrapper(page, 'App')
    const overlay = overlayChrome(page, 'App')

    // Assert — border + label start transparent, become opaque on hover
    await expect(overlay.nth(0)).toHaveCSS('opacity', '0')
    await expect(overlay.nth(1)).toHaveCSS('opacity', '0')
    await wrapper.hover()
    await expect(overlay.nth(0)).toHaveCSS('opacity', '1')
    await expect(overlay.nth(1)).toHaveCSS('opacity', '1')
  })

  test('overlays stay hidden on hover when toggled off', async ({ app, page }) => {
    // Arrange — turn overlays off
    await app.setViewMode('Live')
    await app.dismissToastsViaJs()
    const overlayBtn = page.locator(sel.overlayToggle)
    await overlayBtn.click()
    await expect(overlayBtn).toHaveAttribute('aria-pressed', 'false')

    // Act + Assert — hover still leaves the overlay chrome transparent
    const wrapper = liveWrapper(page, 'App')
    const overlay = overlayChrome(page, 'App')
    await wrapper.hover()
    await expect(overlay.nth(0)).toHaveCSS('opacity', '0')
    await expect(overlay.nth(1)).toHaveCSS('opacity', '0')
  })

  test('trigger in live view reflected in tree view counts', async ({ app }) => {
    await app.setViewMode('Live')
    await app.clickTrigger('Trigger State Change')
    await app.setViewMode('Tree')

    // Poll for render count — allows async Redux dispatch + React re-render to settle
    await expect.poll(
      async () => Number(await app.getRenderCount('App')),
      { timeout: 5_000 }
    ).toBeGreaterThan(0)
  })
})
