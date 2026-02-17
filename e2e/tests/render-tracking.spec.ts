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

  test('toast shows component name', async ({ app, page }) => {
    await app.reset()
    await page.waitForTimeout(300)
    await app.clickTrigger('Trigger State Change')
    await app.waitForToast()
    const toastText = await page.locator(sel.toast).first().textContent()
    expect(toastText).toContain('App')
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
