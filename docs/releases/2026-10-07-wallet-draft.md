# Wallet draft — 2026-10-07

Saved **Animations → Wallet Graphic** in the Animations Playground. Component cb52e093-568c-ef31-d761-0b0eeb05407c; animation name Wallet (data-anim=wallet). Existing Phone Elements → Wallet remains unchanged.

Reuses shared CSS grid, Window Graphic outer/inner frame classes, Gray Credit Card and Icon - Bank. Canonical bottom-to-top Soft Reveal runs through the existing permanent Preview loader. No new compiled motion, Git merge, channel activation or Webflow publication was necessary or performed.

Verified Designer, desktop Preview (630 × 324 composition), mobile Preview (345 × 178 composition), zero horizontal clipping scroll, .43 grid opacity, and completed reveal classes. Computed movement: 770ms with Global Styles primary curve; opacity: 262ms linear. Three existing Reveal regression tests passed. Reduced-motion CSS is present; OS preference was not changed for a dedicated reduced-motion run.

The scoped style-only embed keeps native artwork visible before shared motion initializes. CSS-disabled/custom-code-disabled and two-instance scenarios were not separately exercised. Card internals were preserved; only Gray variant and Rotate 4-digits=false were selected.

Evidence: [Preview screenshot](assets/2026-10-07-wallet-draft.png). Durable contract: [Wallet notes](../../src/embeds/WALLET.md).
