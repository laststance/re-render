import { test as base, expect, type Page } from '@playwright/test'
import { sel } from '../helpers/selectors.js'

/**
 * Page Object Model for the re-render app.
 * Encapsulates common navigation, interaction, and assertion patterns.
 */
export class AppPage {
  constructor(private page: Page) {}

  /**
   * Navigate to a path and wait for the sidebar nav to be interactive.
   * Dismisses any Next.js dev overlay that may appear from hydration warnings.
   * @param path - URL path (e.g. "/" or "/without-memo/state-change")
   */
  async goto(path: string) {
    await this.page.goto(path)
    await this.dismissDevOverlay()
    await this.page.locator(sel.nav).waitFor({ state: 'visible', timeout: 15_000 })
  }

  /**
   * Navigate to a specific example and wait for its title to appear.
   * Waits for layout to settle (media query useEffect) and dismisses
   * any toasts from the initial layout-switch re-renders.
   * @param cat - Category ID (e.g. "without-memo")
   * @param ex - Example ID (e.g. "state-change")
   */
  async gotoExample(cat: string, ex: string) {
    await this.page.goto(`/${cat}/${ex}`)
    await this.dismissDevOverlay()
    await this.page.locator(sel.exampleTitle).waitFor({ state: 'visible', timeout: 15_000 })
  }

  /**
   * Click a trigger button by its visible text label.
   * Waits 300ms for React batching + Redux dispatch + toast pipeline to settle.
   * @param label - Button text (e.g. "Trigger State Change")
   */
  async clickTrigger(label: string) {
    await this.page.getByRole('button', { name: label }).click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Read the render count badge value for a named component.
   * @param name - Component name (e.g. "App")
   * @returns The count as a string (e.g. "0", "3")
   */
  async getRenderCount(name: string): Promise<string> {
    // Use first() because both tree view and live preview have data-component elements
    const badge = this.page.locator(sel.renderCount(name)).first()
    return (await badge.textContent()) ?? '0'
  }

  /**
   * Wait for at least one toast notification to appear.
   * @param timeout - Max wait time in ms (default 5000)
   */
  async waitForToast(timeout = 5_000) {
    await this.page.locator(sel.toast).first().waitFor({ state: 'visible', timeout })
  }

  /**
   * Count the number of currently visible toast notifications.
   * @returns Number of visible toasts
   */
  async toastCount(): Promise<number> {
    return this.page.locator(sel.toast).count()
  }

  /**
   * Click the "Reset all counters" button.
   * Dismisses toasts first via JS to avoid overlay interference.
   */
  async reset() {
    // Dismiss any toast overlays that may block interaction
    await this.dismissToastsViaJs()
    await this.page.locator(sel.resetButton).click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Dismiss the Next.js dev error overlay (hydration warnings).
   * The overlay uses shadow DOM inside a `nextjs-portal` element.
   * Only needed in dev mode; production builds don't show this overlay.
   */
  async dismissDevOverlay() {
    await this.page.waitForTimeout(500)
    await this.page.evaluate(() => {
      // Remove the Next.js error overlay portal if it exists
      document.querySelectorAll('nextjs-portal').forEach((el) => el.remove())
    })
  }

  /**
   * Clear toast notifications by dispatching Redux action.
   * Uses pointer-events to prevent toasts from blocking clicks while React
   * reconciles the DOM removal (avoids removeChild errors from manual DOM removal).
   */
  async dismissToastsViaJs() {
    await this.page.evaluate(() => {
      // Hide toasts via CSS first to unblock clicks immediately
      const region = document.querySelector('div[aria-label="Notifications"]') as HTMLElement | null
      if (region) {
        region.style.pointerEvents = 'none'
        region.style.opacity = '0'
      }
    })
    await this.page.waitForTimeout(100)
  }

  /**
   * Switch the visualization view mode.
   * @param mode - "Tree" or "Live"
   */
  async setViewMode(mode: 'Tree' | 'Live') {
    // Dismiss toasts that might overlay the tabs
    await this.dismissToastsViaJs()
    await this.page.locator(sel.viewModeTab(mode)).click()
    await this.page.waitForTimeout(200)
  }
}

/**
 * Custom test fixture providing AppPage as `app` in every test.
 */
export const test = base.extend<{ app: AppPage }>({
  app: async ({ page }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(new AppPage(page))
  },
})

export { expect }
