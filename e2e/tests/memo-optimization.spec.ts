import { test, expect } from '../fixtures/app.fixture.js'
import { sel } from '../helpers/selectors.js'

/**
 * Optimization-specific tests for "optimization" and key "conditions" examples.
 *
 * Note: LivePreviewWrapper wraps all components and is NOT itself memoized,
 * so render counts in the tree view reflect "without-optimization" behavior.
 * These tests verify trigger behavior, component presence, and that
 * multiple trigger types work correctly within each example.
 *
 * The tests also verify render-behavior-specific examples where certain
 * triggers should NOT cause a re-render (e.g., ref mutations).
 */

test.describe('With-Memo Examples', () => {
  test.describe('React.memo', () => {
    test.beforeEach(async ({ app, page }) => {
      await app.gotoExample('optimization', 'memo')
      await app.reset()
      await page.waitForTimeout(500)
    })

    test('parent state change trigger increments App render count', async ({
      app,
      page,
    }) => {
      const before = Number(await app.getRenderCount('App'))
      await app.clickTrigger('Trigger Parent State Change')
      await page.waitForTimeout(500)
      const after = Number(await app.getRenderCount('App'))
      expect(after).toBeGreaterThan(before)
    })

    test('component tree shows both App and MemoChild', async ({
      page,
    }) => {
      await expect(
        page.locator(sel.componentBox('App')).first()
      ).toBeVisible()
      await expect(
        page.locator(sel.componentBox('MemoChild')).first()
      ).toBeVisible()
    })

    test('explanation mentions React.memo', async ({ page }) => {
      const panel = page.locator(sel.explanationPanel)
      await expect(panel).toContainText('memo')
    })
  })

  test.describe('useCallback', () => {
    test.beforeEach(async ({ app, page }) => {
      await app.gotoExample('optimization', 'usecallback')
      await app.reset()
      await page.waitForTimeout(500)
    })

    test('both triggers produce different render patterns', async ({
      app,
      page,
    }) => {
      // Increment trigger changes count prop
      const before1 = Number(await app.getRenderCount('App'))
      await app.clickTrigger('Trigger Increment')
      await page.waitForTimeout(500)
      const after1 = Number(await app.getRenderCount('App'))
      expect(after1).toBeGreaterThan(before1)

      await app.dismissToastsViaJs()

      // Text input trigger changes text but not count
      const before2 = Number(await app.getRenderCount('App'))
      await app.clickTrigger('Trigger Text Input')
      await page.waitForTimeout(500)
      const after2 = Number(await app.getRenderCount('App'))
      expect(after2).toBeGreaterThan(before2)
    })

    test('MemoButton component exists in tree', async ({ page }) => {
      await expect(
        page.locator(sel.componentBox('MemoButton')).first()
      ).toBeVisible()
    })
  })

  test.describe('useMemo', () => {
    test.beforeEach(async ({ app, page }) => {
      await app.gotoExample('optimization', 'usememo')
      await app.reset()
      await page.waitForTimeout(500)
    })

    test('recomputation trigger works', async ({ app, page }) => {
      const before = Number(await app.getRenderCount('App'))
      await app.clickTrigger('Trigger Recomputation')
      await page.waitForTimeout(500)
      const after = Number(await app.getRenderCount('App'))
      expect(after).toBeGreaterThan(before)
    })

    test('type without recomputation trigger works', async ({
      app,
      page,
    }) => {
      const before = Number(await app.getRenderCount('App'))
      await app.clickTrigger('Type Without Recomputation')
      await page.waitForTimeout(500)
      const after = Number(await app.getRenderCount('App'))
      expect(after).toBeGreaterThan(before)
    })
  })

  test.describe('children-pattern', () => {
    test.beforeEach(async ({ app, page }) => {
      await app.gotoExample('optimization', 'children-pattern')
      await app.reset()
      await page.waitForTimeout(500)
    })

    test('color change trigger works', async ({ app, page }) => {
      const before = Number(await app.getRenderCount('App'))
      await app.clickTrigger('Change Color')
      await page.waitForTimeout(500)
      const after = Number(await app.getRenderCount('App'))
      expect(after).toBeGreaterThan(before)
    })

    test('component tree shows ColorPicker and ExpensiveTree', async ({
      page,
    }) => {
      await expect(
        page.locator(sel.componentBox('ColorPicker')).first()
      ).toBeVisible()
      await expect(
        page.locator(sel.componentBox('ExpensiveTree')).first()
      ).toBeVisible()
    })
  })

  test.describe('usecallback-comparison', () => {
    test.beforeEach(async ({ app, page }) => {
      await app.gotoExample('optimization', 'usecallback-comparison')
      await app.reset()
      await page.waitForTimeout(500)
    })

    test('type text trigger works', async ({ app, page }) => {
      const before = Number(await app.getRenderCount('Root'))
      await app.clickTrigger('Type Text')
      await page.waitForTimeout(500)
      const after = Number(await app.getRenderCount('Root'))
      expect(after).toBeGreaterThan(before)
    })

    test('increment count trigger works', async ({ app, page }) => {
      const before = Number(await app.getRenderCount('Root'))
      await app.clickTrigger('Increment Count')
      await page.waitForTimeout(500)
      const after = Number(await app.getRenderCount('Root'))
      expect(after).toBeGreaterThan(before)
    })

    test('component tree shows Before and After comparison', async ({
      page,
    }) => {
      await expect(
        page.locator(sel.componentBox('BeforeApp')).first()
      ).toBeVisible()
      await expect(
        page.locator(sel.componentBox('AfterApp')).first()
      ).toBeVisible()
    })
  })

  test.describe('usememo-comparison', () => {
    test.beforeEach(async ({ app, page }) => {
      await app.gotoExample('optimization', 'usememo-comparison')
      await app.reset()
      await page.waitForTimeout(500)
    })

    test('type text trigger works', async ({ app, page }) => {
      const before = Number(await app.getRenderCount('Root'))
      await app.clickTrigger('Type Text')
      await page.waitForTimeout(500)
      const after = Number(await app.getRenderCount('Root'))
      expect(after).toBeGreaterThan(before)
    })

    test('increment count trigger works', async ({ app, page }) => {
      const before = Number(await app.getRenderCount('Root'))
      await app.clickTrigger('Increment Count')
      await page.waitForTimeout(500)
      const after = Number(await app.getRenderCount('Root'))
      expect(after).toBeGreaterThan(before)
    })

    test('component tree shows Before and After comparison', async ({
      page,
    }) => {
      await expect(
        page.locator(sel.componentBox('BeforeApp')).first()
      ).toBeVisible()
      await expect(
        page.locator(sel.componentBox('AfterApp')).first()
      ).toBeVisible()
    })
  })
})

test.describe('Without-Memo Key Behaviors', () => {
  test.describe('ref-vs-state', () => {
    test.beforeEach(async ({ app, page }) => {
      await app.gotoExample('conditions', 'ref-vs-state')
      await app.reset()
      await page.waitForTimeout(500)
    })

    test('Increment State triggers re-render', async ({ app, page }) => {
      const before = Number(await app.getRenderCount('App'))
      await app.clickTrigger('Increment State')
      await page.waitForTimeout(500)
      const after = Number(await app.getRenderCount('App'))
      expect(after).toBeGreaterThan(before)
    })

    test('Increment Ref does NOT trigger re-render', async ({
      app,
      page,
    }) => {
      // Wait for mount cascade to fully settle
      await page.waitForTimeout(500)
      const before = Number(await app.getRenderCount('App'))
      await app.clickTrigger('Increment Ref')
      await page.waitForTimeout(500)
      const after = Number(await app.getRenderCount('App'))
      // Ref mutation should NOT cause a re-render
      expect(after).toBe(before)
    })

    test('StateSection and RefSection visible in tree', async ({
      page,
    }) => {
      await expect(
        page.locator(sel.componentBox('StateSection')).first()
      ).toBeVisible()
      await expect(
        page.locator(sel.componentBox('RefSection')).first()
      ).toBeVisible()
    })
  })

  test.describe('parent-rerender', () => {
    test.beforeEach(async ({ app, page }) => {
      await app.gotoExample('conditions', 'parent-rerender')
      await app.reset()
      await page.waitForTimeout(500)
    })

    test('trigger re-renders both App and Child', async ({ app, page }) => {
      const parentBefore = Number(await app.getRenderCount('App'))
      const childBefore = Number(await app.getRenderCount('Child'))

      await app.clickTrigger('Trigger Parent Re-render')
      await page.waitForTimeout(500)

      const parentAfter = Number(await app.getRenderCount('App'))
      const childAfter = Number(await app.getRenderCount('Child'))

      expect(parentAfter).toBeGreaterThan(parentBefore)
      // Child re-renders because it's not memoized
      expect(childAfter).toBeGreaterThan(childBefore)
    })
  })

  test.describe('context-change', () => {
    test.beforeEach(async ({ app, page }) => {
      await app.gotoExample('conditions', 'context-change')
      await app.reset()
      await page.waitForTimeout(500)
    })

    test('context change re-renders provider and display', async ({
      app,
      page,
    }) => {
      const providerBefore = Number(
        await app.getRenderCount('CountProvider')
      )
      const displayBefore = Number(
        await app.getRenderCount('CountDisplay')
      )

      await app.clickTrigger('Trigger Context Change')
      await page.waitForTimeout(500)

      const providerAfter = Number(
        await app.getRenderCount('CountProvider')
      )
      const displayAfter = Number(
        await app.getRenderCount('CountDisplay')
      )

      expect(providerAfter).toBeGreaterThan(providerBefore)
      expect(displayAfter).toBeGreaterThan(displayBefore)
    })
  })

  test.describe('use-reducer', () => {
    test.beforeEach(async ({ app, page }) => {
      await app.gotoExample('conditions', 'use-reducer')
      await app.reset()
      await page.waitForTimeout(500)
    })

    test('all 4 dispatch actions trigger re-renders', async ({
      app,
      page,
    }) => {
      const triggers = [
        'Dispatch Increment',
        'Dispatch Decrement',
        'Toggle Step',
        'Reset State',
      ]

      // First increment so Reset State will actually change the value
      await app.clickTrigger('Dispatch Increment')
      await page.waitForTimeout(300)
      await app.dismissToastsViaJs()

      for (const trigger of triggers) {
        const before = Number(await app.getRenderCount('App'))
        await app.clickTrigger(trigger)
        await page.waitForTimeout(300)
        const after = Number(await app.getRenderCount('App'))
        expect(after).toBeGreaterThan(before)
        await app.dismissToastsViaJs()
      }
    })
  })

  test.describe('compound-component', () => {
    test.beforeEach(async ({ app, page }) => {
      await app.gotoExample('conditions', 'compound-component')
      await app.reset()
      await page.waitForTimeout(500)
    })

    test('component tree shows Select compound hierarchy', async ({
      page,
    }) => {
      await expect(
        page.locator(sel.componentBox('Select')).first()
      ).toBeVisible()
      await expect(
        page.locator(sel.componentBox('Select.Trigger')).first()
      ).toBeVisible()
    })
  })
})
