# Component index

Use existing source and notes as truth. Missing Figma references stay unknown. Use [the template](TEMPLATE.md) for new/revisited components. Historical verification is not live publication state.

| Component | Notes |
| --- | --- |
| Real-Time Approvals | [REAL-TIME-APPROVALS.md](../../src/embeds/REAL-TIME-APPROVALS.md) |
| Omnichannel Origination | [OMNICHANNEL-ORIGINATION.md](../../src/embeds/OMNICHANNEL-ORIGINATION.md) |
| Real-Time Balance Management | [BALANCE.md](../../src/embeds/BALANCE.md) |
| Card Controls | [CARD-CONTROLS.md](../../src/embeds/CARD-CONTROLS.md) |
| Collections — Window Stack | [COLLECTIONS.md](../../src/embeds/COLLECTIONS.md) |
| Country flags | [COUNTRY-FLAGS.md](../../src/embeds/COUNTRY-FLAGS.md) |
| Create New Card | [CREATE-NEW-CARD.md](../../src/embeds/CREATE-NEW-CARD.md) |
| Embedded Connectivity | [EMBEDDED-CONNECTIVITY.md](../../src/embeds/EMBEDDED-CONNECTIVITY.md) |
| Ledger Sheet | [LEDGER-SHEET.md](../../src/embeds/LEDGER-SHEET.md) |
| Payment — Stitch Wallet | [PAYMENT-WALLET.md](../../src/embeds/PAYMENT-WALLET.md) |
| Report Graphic Webflow component | [README.md](../../src/embeds/README.md) |
| 3D Secure Authentication | [SECURE-AUTH.md](../../src/embeds/SECURE-AUTH.md) |
| Buy Now Pay Later | [BUY-NOW-PAY-LATER.md](../../src/embeds/BUY-NOW-PAY-LATER.md) |
| Credit Check | [CREDIT-CHECK.md](../../src/embeds/CREDIT-CHECK.md) |
| CC Card | [CREDIT-CHECK.md](../../src/embeds/CREDIT-CHECK.md) |
| CC Badge | [CREDIT-CHECK.md](../../src/embeds/CREDIT-CHECK.md) |
| User Onboarding | [USER-ONBOARDING.md](../../src/embeds/USER-ONBOARDING.md) |
| Transaction history | [TRANSACTION-HISTORY.md](../../src/embeds/TRANSACTION-HISTORY.md) |

## Playground animation modules

For hero, api, chart, dots, dots-bulge, orbit, radial, cards, deposits, small-cards, window-graphic, collections, webhook, reference, and access: use src/animations/<name>/index.js and adjacent styles where present. Preview index.html at /#<name>. [Recipes](../animation-recipes.md) document markup; [connectors](../connector-animations.md) cover Webhook/Reference/Access.

## Product Variety

Root: data-product-variety. Source: src/embeds/product-variety.js and product-variety.css. Shared Wallet Swap, Reveal, and Pointer Follow; the module owns mounting/cleanup. Tests: tests/wallet-swap.test.js. Figma reference, local preview route, and exact Webflow identity are not recorded here; inspect the current component before integration.
