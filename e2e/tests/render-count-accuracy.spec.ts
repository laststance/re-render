import type { Page } from '@playwright/test'
import { test, expect } from '../fixtures/app.fixture.js'
import { sel } from '../helpers/selectors.js'

/**
 * Render-count accuracy suite.
 *
 * Asserts the exact badge numbers shown in the component trees match the
 * actual React renders caused by each demo trigger — no more, no less.
 * Every example page is covered, including reset boundaries, remounts via
 * key changes, memoized-tree simulation, duplicate component names, and
 * chrome actions that must never inflate the counts.
 */

type BadgeMap = Record<string, number[]>

/**
 * Read every tree badge for one variant, grouped by component name.
 * Duplicate names (e.g. three Select.Option nodes) keep DOM order.
 */
async function badgeMap(page: Page, variant: 'child' | 'memoized'): Promise<BadgeMap> {
  return page.$$eval(
    `div[data-component][data-variant="${variant}"]`,
    (els) => {
      const map: BadgeMap = {}
      for (const el of els) {
        const name = el.getAttribute('data-component') ?? '?'
        const count = Number(el.getAttribute('data-render-count'))
        ;(map[name] ??= []).push(count)
      }
      return map
    }
  )
}

/**
 * Poll the badge map until it equals the expected values.
 * Badge updates flow through Redux, so assertions retry briefly.
 */
async function expectBadges(page: Page, variant: 'child' | 'memoized', expected: BadgeMap) {
  await expect
    .poll(async () => badgeMap(page, variant), { timeout: 5_000 })
    .toEqual(expected)
}

/** The zero-render map for a list of component names (dupes as counts). */
function zeroMap(entries: (string | [string, number])[]): BadgeMap {
  const map: BadgeMap = {}
  for (const entry of entries) {
    if (typeof entry === 'string') map[entry] = [0]
    else map[entry[0]] = Array(entry[1]).fill(0)
  }
  return map
}

test.describe('Render count accuracy', () => {
  test.describe('state-change', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('conditions', 'state-change')
    })

    test('mounts with zero renders on every component', async ({ page }) => {
      // Assert
      await expectBadges(page, 'child', { App: [0], Heading: [0], Button: [0] })
      await expectBadges(page, 'memoized', { App: [0], Heading: [0], Button: [0] })
    })

    test('trigger increments every component by exactly 1', async ({ app, page }) => {
      // Act
      await app.clickTrigger('Trigger State Change')

      // Assert
      await expectBadges(page, 'child', { App: [1], Heading: [1], Button: [1] })
      await expectBadges(page, 'memoized', { App: [1], Heading: [1], Button: [1] })
    })

    test('repeated triggers accumulate exact counts', async ({ app, page }) => {
      // Act
      await app.clickTrigger('Trigger State Change')
      await app.clickTrigger('Trigger State Change')
      await app.clickTrigger('Trigger State Change')

      // Assert
      await expectBadges(page, 'child', { App: [3], Heading: [3], Button: [3] })
    })

    test('reset clears counts and the next trigger counts from 1', async ({ app, page }) => {
      // Arrange — build up counts first
      await app.clickTrigger('Trigger State Change')
      await app.clickTrigger('Trigger State Change')
      await expectBadges(page, 'child', { App: [2], Heading: [2], Button: [2] })

      // Act — reset, then one more trigger
      await app.reset()
      await expectBadges(page, 'child', { App: [0], Heading: [0], Button: [0] })
      await app.clickTrigger('Trigger State Change')

      // Assert — no stale absolute counts resurrect after reset
      await expectBadges(page, 'child', { App: [1], Heading: [1], Button: [1] })
    })

    test('UI chrome actions never increment render counts', async ({ app, page }) => {
      // Act — view mode switch, file tab switch, overlay toggle
      await app.setViewMode('Live')
      await app.setViewMode('Tree')
      await page.locator(sel.fileTab(1)).click()
      await page.locator(sel.fileTab(0)).click()
      await app.setViewMode('Live')
      const overlayBtn = page.locator(sel.overlayToggle)
      if (await overlayBtn.isVisible().catch(() => false)) {
        await overlayBtn.click()
        await overlayBtn.click()
      }
      await app.setViewMode('Tree')

      // Assert — none of the above re-renders a tracked component,
      // and suppression held: no toast leaked either
      await expectBadges(page, 'child', { App: [0], Heading: [0], Button: [0] })
      expect(await app.toastCount()).toBe(0)
    })

    test('live preview subtree is not remounted after mount settles', async ({ app, page }) => {
      // Arrange — tag the App preview wrapper DOM node
      const wrapper = page.locator('div[data-component="App"]:not([data-variant])')
      await wrapper.evaluate((el) => ((el as HTMLElement).dataset.stabilityProbe = '1'))

      // Act — wait past the post-mount settle window. The old useDeviceType
      // flipped false→true here, swapping SplitPaneLayout's structure and
      // remounting the entire preview subtree (a new node would lose the tag).
      await page.waitForTimeout(1500)

      // Assert — the same DOM node is still attached
      await expect(wrapper).toHaveAttribute('data-stability-probe', '1')

      // Positive control — a real render must land on the SAME tracker
      // instance (a remounted tracker would restart at baseline → badge 0)
      await app.clickTrigger('Trigger State Change')
      await expectBadges(page, 'child', { App: [1], Heading: [1], Button: [1] })
      await expect(wrapper).toHaveAttribute('data-stability-probe', '1')
    })
  })

  test.describe('props-change', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('conditions', 'props-change')
    })

    // Counter is memoProtected in the example tree: a genuine props-change
    // reason must pass the memoized filter instead of being suppressed.
    test('memoProtected node still counts a genuine props-change in the memoized tree', async ({
      app,
      page,
    }) => {
      // Act
      await app.clickTrigger('Trigger Props Change')

      // Assert
      const expected = { App: [1], Heading: [1], Counter: [1], Text: [1], Button: [1] }
      await expectBadges(page, 'child', expected)
      await expectBadges(page, 'memoized', expected)
    })
  })

  test.describe('parent-rerender', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('conditions', 'parent-rerender')
    })

    test('child tree counts all renders; memoized tree filters parent-rerender', async ({
      app,
      page,
    }) => {
      // Act
      await app.clickTrigger('Trigger Parent Re-render')
      await app.clickTrigger('Trigger Parent Re-render')

      // Assert — unmemoized tree: everything re-rendered twice
      await expectBadges(page, 'child', {
        App: [2],
        Heading: [2],
        Button: [2],
        Child: [2],
        Text: [2],
      })

      // Assert — memoized simulation: Child/Text are memoProtected → stay 0
      await expectBadges(page, 'memoized', {
        App: [2],
        Heading: [2],
        Button: [2],
        Child: [0],
        Text: [0],
      })
    })
  })

  test.describe('context-change', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('conditions', 'context-change')
    })

    test('trigger re-renders consumers; tree-only Button node stays 0', async ({
      app,
      page,
    }) => {
      // Act
      await app.clickTrigger('Trigger Context Change')

      // Assert — the tree has a Button node with no live wrapper → always 0
      await expectBadges(page, 'child', {
        App: [1],
        CountProvider: [1],
        Heading: [1],
        CountDisplay: [1],
        Text: [1],
        CountButton: [1],
        Button: [0],
      })
    })
  })

  test.describe('force-update', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('conditions', 'force-update')
    })

    test('force re-render increments everything by 1', async ({ app, page }) => {
      // Act
      await app.clickTrigger('Force Re-render')

      // Assert — two Text and two Button instances aggregate by name
      await expectBadges(page, 'child', {
        App: [1],
        Heading: [1],
        Timer: [1],
        Text: [1, 1],
        Button: [1, 1],
      })
    })

    test('key change remounts Timer subtree: its counts reset to 0', async ({
      app,
      page,
    }) => {
      // Arrange — give every component a count first
      await app.clickTrigger('Force Re-render')
      await expectBadges(page, 'child', {
        App: [1], Heading: [1], Timer: [1], Text: [1, 1], Button: [1, 1],
      })

      // Act — key change remounts Timer (and the Text nodes inside it)
      await app.clickTrigger('Reset Timer (Key Change)')

      // Assert — siblings keep accumulating; remounted subtree restarts at 0
      await expectBadges(page, 'child', {
        App: [2],
        Heading: [2],
        Timer: [0],
        Text: [0, 0],
        Button: [2, 2],
      })
    })
  })

  test.describe('use-reducer', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('conditions', 'use-reducer')
    })

    test('each dispatch action renders exactly once', async ({ app, page }) => {
      // Act
      await app.clickTrigger('Dispatch Increment')
      await app.clickTrigger('Dispatch Decrement')
      await app.clickTrigger('Toggle Step')

      // Assert — three commits total
      await expectBadges(page, 'child', {
        App: [3], Heading: [3], Text: [3], Button: [3, 3, 3], Input: [3],
      })
    })

    test('reset on a clean state bails out — no render counted', async ({ app, page }) => {
      // Act — count and step are already at initial values
      await app.clickTrigger('Reset State')

      // Assert — React bails on unchanged state → zero renders
      await expectBadges(page, 'child', {
        App: [0], Heading: [0], Text: [0], Button: [0, 0, 0], Input: [0],
      })
    })

    test('reset after mutations counts one render', async ({ app, page }) => {
      // Act
      await app.clickTrigger('Dispatch Increment')
      await app.clickTrigger('Reset State')

      // Assert
      await expectBadges(page, 'child', {
        App: [2], Heading: [2], Text: [2], Button: [2, 2, 2], Input: [2],
      })
    })
  })

  test.describe('use-sync-external-store', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('conditions', 'use-sync-external-store')
    })

    test('store updates re-render each subscriber once', async ({ app, page }) => {
      // Act
      await app.clickTrigger('Store Increment')
      await app.clickTrigger('Store Decrement')

      // Assert
      await expectBadges(page, 'child', {
        App: [2], Heading: [2], Text: [2], Button: [2, 2],
      })
    })
  })

  test.describe('suspense', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('conditions', 'suspense')
    })

    test('switch user runs two render phases; remounted UserProfile reads 0', async ({
      app,
      page,
    }) => {
      // Act — commit 1 shows Fallback, commit 2 (~1s) reveals UserProfile
      await app.clickTrigger('Switch User')

      // Assert — name-keyed duplicates aggregate (two Buttons, two Headings)
      await expectBadges(page, 'child', {
        App: [2],
        Heading: [2, 2],
        TabBar: [2],
        Button: [2, 2],
        Suspense: [2],
        // UserProfile unmounts during loading, then remounts fresh → 0
        UserProfile: [0],
        Text: [0],
      })
    })
  })

  test.describe('concurrent', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('conditions', 'concurrent')
    })

    test('type produces immediate + deferred commits (+2); list nodes without wrappers stay 0', async ({
      app,
      page,
    }) => {
      // Act — setText+isPending commit, then ~300ms deferred commit
      await app.clickTrigger('Type Character')

      // Assert
      await expectBadges(page, 'child', {
        App: [2],
        Heading: [2],
        Input: [2],
        Text: [0],      // transient "Updating…" mounts once → 0 re-renders
        SlowList: [2],
        ListItem: [0],  // no ListItem wrapper in the preview → always 0
      })
    })

    test('clear after typing commits once', async ({ app, page }) => {
      // Act — type, then wait for the deferred commit to provably land
      // before clearing (clickTrigger's fixed wait races the demo's own
      // ~300ms deferred setTimeout; asserting the intermediate state
      // removes the race entirely)
      await app.clickTrigger('Type Character')
      await expectBadges(page, 'child', {
        App: [2],
        Heading: [2],
        Input: [2],
        Text: [0],
        SlowList: [2],
        ListItem: [0],
      })

      // Act — clear only after the deferred commit settled
      await app.clickTrigger('Clear Input')

      // Assert — 2 commits for type + 1 for clear
      await expectBadges(page, 'child', {
        App: [3],
        Heading: [3],
        Input: [3],
        Text: [0],
        SlowList: [3],
        ListItem: [0],
      })
    })
  })

  test.describe('use-effect-deps', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('conditions', 'use-effect-deps')
    })

    test('increment and type each render once', async ({ app, page }) => {
      // Act
      await app.clickTrigger('Increment Count')
      await app.clickTrigger('Type Character')

      // Assert
      await expectBadges(page, 'child', {
        App: [2], Heading: [2], Text: [2], Button: [2], Input: [2],
      })
    })
  })

  test.describe('ref-vs-state', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('conditions', 'ref-vs-state')
    })

    test('ref mutation triggers no render at all', async ({ app, page }) => {
      // Act
      await app.clickTrigger('Increment Ref')

      // Assert — badge tree unchanged: ref writes commit nothing
      await expectBadges(
        page,
        'child',
        zeroMap(['App', 'Heading', 'StateSection', ['Text', 3], ['Button', 2], 'RefSection'])
      )
    })

    test('state increment renders once', async ({ app, page }) => {
      // Act
      await app.clickTrigger('Increment State')

      // Assert
      await expectBadges(page, 'child', {
        App: [1], Heading: [1], StateSection: [1],
        Text: [1, 1, 1], Button: [1, 1], RefSection: [1],
      })
    })
  })

  test.describe('compound-component', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('conditions', 'compound-component')
    })

    test('toggle dropdown renders the select chrome once, options mount at 0', async ({
      app,
      page,
    }) => {
      // Act
      await app.clickTrigger('Toggle Dropdown')

      // Assert — Options + 3 same-named Option instances mount fresh (badge 0)
      await expectBadges(page, 'child', {
        App: [1],
        Heading: [1],
        Select: [1],
        'Select.Trigger': [1],
        'Select.Options': [0],
        'Select.Option': [0, 0, 0],
      })
    })

    test('select option re-renders chrome and unmounts the open options', async ({
      app,
      page,
    }) => {
      // Arrange — open the dropdown first
      await app.clickTrigger('Toggle Dropdown')

      // Act — selecting also closes the dropdown in the same commit
      await app.clickTrigger('Select Option')

      // Assert — Options/Option keep their single-mount count (badge 0)
      await expectBadges(page, 'child', {
        App: [2],
        Heading: [2],
        Select: [2],
        'Select.Trigger': [2],
        'Select.Options': [0],
        'Select.Option': [0, 0, 0],
      })
    })
  })

  test.describe('render-props', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('conditions', 'render-props')
    })

    test('mouse move re-renders tracker and display once', async ({ app, page }) => {
      // Act
      await app.clickTrigger('Simulate Mouse Move')

      // Assert — the Text node has no live wrapper → stays 0
      await expectBadges(page, 'child', {
        App: [1],
        Heading: [1],
        MouseTracker: [1],
        DisplayCoords: [1],
        Text: [0],
      })
    })
  })

  test.describe('usecallback', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('optimization', 'usecallback')
    })

    test('typing re-renders the tree but memoized MemoButton stays 0', async ({
      app,
      page,
    }) => {
      // Act
      await app.clickTrigger('Trigger Text Input')

      // Assert — actual tree: everything under App rendered
      await expectBadges(page, 'child', {
        App: [1],
        Input: [1],
        Text: [1],
        MemoButton: [1],
        Button: [0], // tree node without a live wrapper
      })

      // Assert — memoized simulation: memoProtected MemoButton/Button filter
      // parent-rerender events → stay at 0
      await expectBadges(page, 'memoized', {
        App: [1],
        Input: [1],
        Text: [1],
        MemoButton: [0],
        Button: [0],
      })
    })

    test('increment trigger also counts exactly once', async ({ app, page }) => {
      // Act
      await app.clickTrigger('Trigger Increment')

      // Assert
      await expectBadges(page, 'child', {
        App: [1], Input: [1], Text: [1], MemoButton: [1], Button: [0],
      })
    })
  })

  test.describe('usememo', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('optimization', 'usememo')
    })

    test('both triggers render the tree once each', async ({ app, page }) => {
      // Act
      await app.clickTrigger('Trigger Recomputation')
      await app.clickTrigger('Type Without Recomputation')

      // Assert
      await expectBadges(page, 'child', {
        App: [2], Input: [2], Text: [2], Button: [2],
      })
    })
  })

  test.describe('react-lazy', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('optimization', 'react-lazy')
    })

    test('toggle chart runs loading + loaded commits; HeavyChart mounts fresh at 0', async ({
      app,
      page,
    }) => {
      // Act — click then wait out the simulated 800ms lazy import
      await app.clickTrigger('Toggle Chart')
      await page.waitForTimeout(1200)

      // Assert — two commits for chrome, Suspense mounts then re-renders once
      await expectBadges(page, 'child', {
        App: [2],
        Heading: [2, 2],       // second Heading lives under HeavyChart, name-aggregated
        Button: [2],
        Suspense: [1],
        HeavyChart: [0],       // mounted once → zero re-renders
        Text: [0, 0],
      })
    })

    test('hiding the chart commits once and unmounts it', async ({ app, page }) => {
      // Arrange — show the chart first
      await app.clickTrigger('Toggle Chart')
      await page.waitForTimeout(1200)

      // Act — hide it again
      await app.clickTrigger('Toggle Chart')

      // Assert — one extra commit for chrome; unmounted nodes keep badges
      await expectBadges(page, 'child', {
        App: [3],
        Heading: [3, 3],
        Button: [3],
        Suspense: [1],
        HeavyChart: [0],
        Text: [0, 0],
      })
    })
  })

  test.describe('children-pattern', () => {
    test.beforeEach(async ({ app }) => {
      await app.gotoExample('optimization', 'children-pattern')
    })

    test('change color re-renders all live wrappers; memoized ExpensiveTree stays 0', async ({
      app,
      page,
    }) => {
      // Act
      await app.clickTrigger('Change Color')

      // Assert — actual tree: ExpensiveTree is inline JSX so it does re-render
      await expectBadges(page, 'child', {
        App: [1],
        ColorPicker: [1],
        Input: [1],
        ExpensiveTree: [1],
        Heading: [0], Text: [0], List: [0], ListItem: [0, 0, 0],
      })

      // Assert — memoized simulation: the whole ExpensiveTree subtree is
      // memoProtected (children-pattern stability) → filtered to 0
      await expectBadges(page, 'memoized', {
        App: [1],
        ColorPicker: [1],
        Input: [1],
        ExpensiveTree: [0],
        Heading: [0], Text: [0], List: [0], ListItem: [0, 0, 0],
      })
    })
  })

  test('navigating away and back mounts a clean tracker', async ({ app, page }) => {
    // Arrange — accumulate renders on the first example
    await app.gotoExample('conditions', 'state-change')
    await app.clickTrigger('Trigger State Change')
    await expectBadges(page, 'child', { App: [1], Heading: [1], Button: [1] })

    // Act — navigate to another example, then back
    await app.gotoExample('conditions', 'props-change')
    await expectBadges(page, 'child', {
      App: [0], Heading: [0], Counter: [0], Text: [0], Button: [0],
    })
    await app.gotoExample('conditions', 'state-change')

    // Assert — remounted trackers start at zero, no stale counts
    await expectBadges(page, 'child', { App: [0], Heading: [0], Button: [0] })
  })
})
