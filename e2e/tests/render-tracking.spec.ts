import { test, expect } from '../fixtures/app.fixture.js'
import { sel } from '../helpers/selectors.js'

/**
 * Core render tracking tests.
 * Uses conditions/state-change as the canonical example.
 * Each test resets counters first to clear layout-switch artifacts.
 */
test.describe('Render Tracking', () => {
  test.beforeEach(async ({ app, page }) => {
    await app.gotoExample('conditions', 'state-change')
    // Reset and wait for cascade to settle (initial renders + layout switch)
    await app.reset()
    await page.waitForTimeout(500)
  })

  test('trigger increments render count', async ({ app, page }) => {
    const baseline = Number(await app.getRenderCount('App'))
    await app.clickTrigger('Trigger State Change')
    await page.waitForTimeout(500)
    const after = Number(await app.getRenderCount('App'))
    expect(after).toBeGreaterThan(baseline)
  })

  test('toast appears after trigger', async ({ app, page }) => {
    // Dismiss any stale toasts from initialization
    await app.reset()
    await page.waitForTimeout(300)
    await app.clickTrigger('Trigger State Change')
    await app.waitForToast()
    await expect(page.locator(sel.toast).first()).toBeVisible()
  })

  test('toast shows re-render info', async ({ app, page }) => {
    await app.reset()
    await page.waitForTimeout(300)
    await app.clickTrigger('Trigger State Change')
    await app.waitForToast()
    const firstToast = page.locator(sel.toast).first()
    const toastText = await firstToast.textContent()
    // Batch toast: "N components re-rendered"; single toast: component name
    expect(toastText).toContain('re-rendered')

    // Expand to see per-component details
    const toggleBtn = firstToast.locator('button[aria-expanded]')
    await toggleBtn.click()
    const expandedText = await firstToast.textContent()
    expect(expandedText).toContain('App')
  })

  test('toast expand shows details', async ({ app, page }) => {
    await app.reset()
    await page.waitForTimeout(300)
    await app.clickTrigger('Trigger State Change')
    await app.waitForToast()

    // Target the first toast's expand/collapse toggle button.
    // After click, aria-label changes from "Expand details" to "Collapse details",
    // so we use the first toast's button with aria-expanded attribute.
    const firstToast = page.locator(sel.toast).first()
    const toggleBtn = firstToast.locator('button[aria-expanded]')
    await expect(toggleBtn).toBeVisible({ timeout: 3_000 })
    await toggleBtn.click()
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true')
  })

  test('toast dismiss removes it', async ({ app, page }) => {
    await app.reset()
    await page.waitForTimeout(300)
    await app.clickTrigger('Trigger State Change')
    await app.waitForToast()

    const initialCount = await app.toastCount()
    expect(initialCount).toBeGreaterThan(0)

    await page.locator(sel.toastDismiss).first().click()
    await page.waitForTimeout(500)

    const afterCount = await app.toastCount()
    expect(afterCount).toBeLessThan(initialCount)
  })

  test('reset clears toasts', async ({ app, page }) => {
    await app.clickTrigger('Trigger State Change')
    await app.waitForToast()

    await app.reset()
    await page.waitForTimeout(1000)

    const toasts = await app.toastCount()
    expect(toasts).toBe(0)
  })

  test('reset drops render events still inside the toast debounce window', async ({ app, page }) => {
    // Act — click the trigger directly (no fixture settle wait) so the
    // recordRender event is still sitting in the listener middleware's
    // 300ms batch buffer when reset fires. Without the buffer-clear
    // listener, the stale flush creates a ghost toast after reset.
    await page.getByRole('button', { name: 'Trigger State Change' }).click()
    await app.reset()

    // Assert — wait beyond the 300ms flush window; nothing may surface
    await page.waitForTimeout(700)
    expect(await app.toastCount()).toBe(0)
  })

  test('navigating home inside the debounce window drops the pending toast', async ({
    app,
    page,
  }) => {
    // Act — click the trigger directly so its recordRender sits in the
    // listener's 300ms buffer, then leave the page before the flush. Without
    // the unmount-time clearAllToasts, the stale flush renders a ghost toast
    // on the landing page via the global ToastContainer.
    await page.getByRole('button', { name: 'Trigger State Change' }).click()
    await page.locator(sel.homeLink).click()

    // Assert — wait beyond the 300ms flush window on the landing page
    await page.waitForTimeout(700)
    expect(await app.toastCount()).toBe(0)
  })

  test('multiple triggers accumulate renders', async ({ app, page }) => {
    const baseline = Number(await app.getRenderCount('App'))
    // Dismiss toasts between triggers to prevent overlay blocking
    await app.clickTrigger('Trigger State Change')
    await page.waitForTimeout(500)
    await app.dismissToastsViaJs()
    await app.clickTrigger('Trigger State Change')
    await page.waitForTimeout(500)
    await app.dismissToastsViaJs()
    await app.clickTrigger('Trigger State Change')
    await page.waitForTimeout(500)

    const count = Number(await app.getRenderCount('App'))
    expect(count).toBeGreaterThanOrEqual(baseline + 3)
  })
})
