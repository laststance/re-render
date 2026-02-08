import { test, expect } from '../fixtures/app.fixture.js'
import { sel } from '../helpers/selectors.js'
import { examples } from '../helpers/examples.js'

/**
 * Comprehensive trigger tests for ALL 20 demo examples.
 * Verifies that each trigger button:
 * 1. Increments render counts on the root component
 * 2. Produces a toast notification
 *
 * Data-driven approach: iterates over examples.ts definitions.
 *
 * Note: Some triggers may not produce a render if the state
 * hasn't changed (e.g., "Reset State" when already at initial state,
 * "Clear Input" when input is empty). These are excluded from the
 * "increments render count" test to test correct React optimization behavior.
 */

/**
 * Triggers that may NOT produce a re-render when the example is in its
 * initial state (because `Object.is(newState, oldState) === true`).
 * @example "Reset State" dispatches `setCount(0)` when count is already 0
 * @example "Clear Input" dispatches empty string when input is already empty
 * @example "Increment Ref" mutates ref.current but doesn't trigger re-render
 */
const triggersSkipRenderCheck: Record<string, string[]> = {
  'use-reducer': ['Reset State'],
  concurrent: ['Clear Input'],
  'ref-vs-state': ['Increment Ref'],
}

/**
 * Triggers that may not produce a toast because they don't cause a re-render
 * in initial state.
 */
const triggersSkipToastCheck: Record<string, string[]> = {
  'use-reducer': ['Reset State'],
  concurrent: ['Clear Input'],
  'ref-vs-state': ['Increment Ref'],
}

/**
 * Examples with async loading (Suspense/React.lazy) that may produce
 * toasts after reset due to deferred component mounting.
 */
const asyncExamples = new Set(['suspense', 'react-lazy'])

for (const ex of examples) {
  test.describe(`${ex.categoryId}/${ex.exampleId}`, () => {
    test.beforeEach(async ({ app, page }) => {
      await app.gotoExample(ex.categoryId, ex.exampleId)
      await app.reset()
      await page.waitForTimeout(500)
    })

    // Test each trigger individually
    for (const trigger of ex.triggers) {
      const skipRender =
        triggersSkipRenderCheck[ex.exampleId]?.includes(trigger) ?? false
      const skipToast =
        triggersSkipToastCheck[ex.exampleId]?.includes(trigger) ?? false

      if (!skipRender) {
        test(`trigger "${trigger}" increments render count`, async ({
          app,
          page,
        }) => {
          const rootBox = page.locator('[data-component]').first()
          const rootName = await rootBox.getAttribute('data-component')
          expect(rootName).toBeTruthy()

          const baseline = Number(await app.getRenderCount(rootName!))
          await app.clickTrigger(trigger)
          await page.waitForTimeout(500)
          const after = Number(await app.getRenderCount(rootName!))
          expect(after).toBeGreaterThan(baseline)
        })
      }

      if (!skipToast) {
        test(`trigger "${trigger}" produces toast`, async ({
          app,
          page,
        }) => {
          await app.dismissToastsViaJs()
          await page.waitForTimeout(200)
          await app.clickTrigger(trigger)
          await app.waitForToast()
          const count = await app.toastCount()
          expect(count).toBeGreaterThan(0)
        })
      }
    }

    // Test reset button clears toasts for this example.
    // Note: Reset clears Redux renderCounts but component-level useRef
    // counts persist, so render count badges briefly show 0 then re-populate.
    // We verify the observable behavior: toasts are cleared.
    // Skip for async examples (Suspense/React.lazy) where deferred loading
    // can produce new toasts after reset outside the suppression window.
    if (!asyncExamples.has(ex.exampleId)) {
      test('reset clears toasts', async ({ app, page }) => {
        const firstTrigger = ex.triggers.find(
          (t) => !triggersSkipToastCheck[ex.exampleId]?.includes(t)
        ) ?? ex.triggers[0]

        if (firstTrigger) {
          await app.clickTrigger(firstTrigger)
          await app.waitForToast()
          const toastsBefore = await app.toastCount()
          expect(toastsBefore).toBeGreaterThan(0)
        }

        await app.reset()
        await page.waitForTimeout(1000)

        const toastsAfter = await app.toastCount()
        expect(toastsAfter).toBe(0)
      })
    }

    // Test multiple triggers accumulate renders
    if (ex.triggers.length > 0) {
      // Only test accumulation with triggers that actually cause re-renders
      const validTrigger =
        ex.triggers.find(
          (t) => !triggersSkipRenderCheck[ex.exampleId]?.includes(t)
        ) ?? ex.triggers[0]

      test('multiple triggers accumulate render counts', async ({
        app,
        page,
      }) => {
        const rootBox = page.locator('[data-component]').first()
        const rootName = await rootBox.getAttribute('data-component')
        const baseline = Number(await app.getRenderCount(rootName!))

        for (let i = 0; i < 3; i++) {
          await app.clickTrigger(validTrigger)
          await page.waitForTimeout(300)
          await app.dismissToastsViaJs()
        }

        const after = Number(await app.getRenderCount(rootName!))
        expect(after).toBeGreaterThanOrEqual(baseline + 3)
      })
    }

    // Test component tree shows at least one component box
    test('component tree displays component boxes', async ({ page }) => {
      const boxes = page.locator('[data-component]')
      const count = await boxes.count()
      expect(count).toBeGreaterThan(0)
    })

    // Test live view renders without error
    test('live view renders', async ({ app, page }) => {
      await app.setViewMode('Live')
      const liveTab = page.locator(sel.viewModeTab('Live'))
      await expect(liveTab).toHaveAttribute('aria-selected', 'true')
    })
  })
}
