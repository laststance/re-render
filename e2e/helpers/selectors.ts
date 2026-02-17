/**
 * Centralized selector map for E2E tests.
 * Based on aria attributes and data attributes in production code.
 * Selectors are scoped to avoid sidebar/main content ambiguity.
 */

export const sel = {
  // Navigation (Sidebar.tsx)
  nav: 'nav[aria-label="Example navigation"]',
  matrixGrid: 'table[aria-label="Re-render comparison matrix"]',
  optimizationToggle: 'table[aria-label="Re-render comparison matrix"] button[aria-expanded]',
  sidebarExampleLink: (cat: string, ex: string) =>
    `nav[aria-label="Example navigation"] a[href="/${cat}/${ex}"]`,
  sidebarExampleRow: (cat: string, ex: string) =>
    `nav[aria-label="Example navigation"] tr:has(a[href="/${cat}/${ex}"])`,
  homeLink: 'nav[aria-label="Example navigation"] a[href="/"]',

  // Mobile (Sidebar.tsx)
  hamburger: 'button[aria-label="Open navigation menu"]',
  mobileSheet: 'div[role="dialog"][aria-label="Navigation menu"]',
  mobileClose: 'button[aria-label="Close navigation menu"]',

  // Theme (ThemeToggle.tsx) — uses "Switch to" in aria-label to distinguish from overlay toggle
  themeToggle: 'button[aria-label*="Switch to"]',

  // Example page header (ExamplePage.tsx) — scoped to main to avoid sidebar headings
  exampleTitle: 'main header h2',
  exampleDescription: 'main header p',

  // Explanation panel (ExplanationPanel.tsx) — always visible, no toggle
  explanationPanel: 'div:has(> div > h3:text("Understanding This Pattern"))',

  // Code editor file tabs (FileTabs.tsx)
  fileTabList: 'div[role="tablist"][aria-label="Code files"]',
  fileTab: (index: number) =>
    `div[role="tablist"][aria-label="Code files"] button[role="tab"]:nth-of-type(${index + 1})`,

  // View mode tabs (VisualizationPane.tsx)
  viewModeTabList: 'div[role="tablist"][aria-label="View mode"]',
  viewModeTab: (label: string) =>
    `div[role="tablist"][aria-label="View mode"] button[role="tab"]:has-text("${label}")`,

  // Split pane tabs — mobile/tablet (SplitPaneLayout.tsx)
  paneTabList: 'div[role="tablist"][aria-label="Pane selector"]',
  paneTab: (label: string) =>
    `div[role="tablist"][aria-label="Pane selector"] button[role="tab"]:has-text("${label}")`,

  // Reset button (ResetButton.tsx)
  resetButton: 'button[aria-label="Reset all counters"]',

  // Component tree visualization (ComponentBox.tsx)
  componentBox: (name: string) => `div[data-component="${name}"]`,
  renderCount: (name: string) =>
    `div[data-component="${name}"] span[aria-label^="Render count:"]`,

  // Toast notifications (ToastContainer.tsx, Toast.tsx)
  // Scoped to Notifications region to avoid matching Monaco Editor's role="alert" elements
  toastRegion: 'div[aria-label="Notifications"]',
  toast: 'div[aria-label="Notifications"] div[role="alert"]',
  toastExpand: 'div[aria-label="Notifications"] button[aria-label="Expand details"]',
  toastCollapse: 'div[aria-label="Notifications"] button[aria-label="Collapse details"]',
  toastDismiss: 'div[aria-label="Notifications"] button[aria-label="Dismiss notification"]',

  // Live preview overlay toggle (LivePreview.tsx)
  overlayToggle: 'button[aria-label*="component overlays"]',
} as const
