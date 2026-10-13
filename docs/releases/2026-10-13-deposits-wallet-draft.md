# Deposits — Digital Wallet draft, 2026-10-13

Created independent Deposits — Digital Wallet and Deposits — Wallet Screen components on Animations Playground; homepage remains unchanged. Component identity, supported props, stylesheet dependencies and motion contract are in [component notes](../../src/embeds/DEPOSITS-WALLET.md).

Saved native draft verified in Designer and Preview (desktop and 393px mobile). Evidence: [desktop](assets/2026-10-13-deposits-wallet-draft.jpg), [mobile](assets/2026-10-13-deposits-wallet-mobile.jpg). Playground remains draft and was not published.

Local animation verified with two instances, parent resizing, static fallback, lifecycle tests, full shared build and bundle dependency check. Compiled feature and both loader registrations are prepared locally. No staging channel activation or production release was authorized or performed; Webflow Preview currently renders the new component's static fallback through the unchanged permanent router.

Automatic approval review initially misclassified a new Wallet instance as a homepage instance. The action was rejected before mutation. Reading the new component tree established the instance's independent scope; a scoped retry was allowed, then the connector reported that instances do not support attributes. Competing generic reveal is suppressed only within this new component's stylesheet, preserving the homepage and Wallet definition.

## Requested touch-ups

Phone moved left and cards right. Connector orientation retained; arrow aligned below card center with an 8px design-space gap. Wallet rows enlarged through their outer wrappers and gaps tightened. Shared Value Counter added for $0.00 → $25,450.00, synchronized with panel reveal. Updated local/browser and draft evidence: [touch-up preview](assets/2026-10-13-deposits-wallet-touchups.jpg). No release or homepage changes. Full build, 127 tests and shared bundle verification passed.
