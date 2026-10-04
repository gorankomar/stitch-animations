# Component index

Use existing source and notes as truth. Missing Figma references stay unknown. Use [the template](TEMPLATE.md) for new/revisited components. Historical verification is not live publication state.

| Component | Notes |
| --- | --- |
| Email Statement | [EMAIL-STATEMENT.md](../../src/embeds/EMAIL-STATEMENT.md) |
| Consumer Verification Label / Center Label | [CONSUMER-VERIFICATION.md](../../src/embeds/CONSUMER-VERIFICATION.md) |
| Consumer Verification | [CONSUMER-VERIFICATION.md](../../src/embeds/CONSUMER-VERIFICATION.md) |
| Income Verification / Verification Document Item | [INCOME-VERIFICATION.md](../../src/embeds/INCOME-VERIFICATION.md) |
| 3DS-enabled security | [3DS-ENABLED-SECURITY.md](../../src/embeds/3DS-ENABLED-SECURITY.md) |
| Omnichannel Origination | [OMNICHANNEL-ORIGINATION.md](../../src/embeds/OMNICHANNEL-ORIGINATION.md) |
| Real-Time Approvals | [REAL-TIME-APPROVALS.md](../../src/embeds/REAL-TIME-APPROVALS.md) |
| Real-Time Balance Management | [BALANCE.md](../../src/embeds/BALANCE.md) |
| Dynamic funding | [DYNAMIC-FUNDING.md](../../src/embeds/DYNAMIC-FUNDING.md) |
| Instant Virtual Cards | [INSTANT-VIRTUAL-CARDS.md](../../src/embeds/INSTANT-VIRTUAL-CARDS.md) |
| Card Controls | [CARD-CONTROLS.md](../../src/embeds/CARD-CONTROLS.md) |
| Collections — Window Stack | [COLLECTIONS.md](../../src/embeds/COLLECTIONS.md) |
| Country flags | [COUNTRY-FLAGS.md](../../src/embeds/COUNTRY-FLAGS.md) |
| Create New Card | [CREATE-NEW-CARD.md](../../src/embeds/CREATE-NEW-CARD.md) |
| Buy Now Pay Later | [BUY-NOW-PAY-LATER.md](../../src/embeds/BUY-NOW-PAY-LATER.md) |
| Credit Check | [CREDIT-CHECK.md](../../src/embeds/CREDIT-CHECK.md) |
| Revolving Credit | [REVOLVING-CREDIT.md](../../src/embeds/REVOLVING-CREDIT.md) |
| Credit Product Label | [REVOLVING-CREDIT.md](../../src/embeds/REVOLVING-CREDIT.md) |
| CC Card | [CREDIT-CHECK.md](../../src/embeds/CREDIT-CHECK.md) |
| CC Badge | [CREDIT-CHECK.md](../../src/embeds/CREDIT-CHECK.md) |
| Embedded Connectivity | [EMBEDDED-CONNECTIVITY.md](../../src/embeds/EMBEDDED-CONNECTIVITY.md) |
| Ledger Sheet | [LEDGER-SHEET.md](../../src/embeds/LEDGER-SHEET.md) |
| Payment — Stitch Wallet | [PAYMENT-WALLET.md](../../src/embeds/PAYMENT-WALLET.md) |
| Report Graphic Webflow component | [README.md](../../src/embeds/README.md) |
| 3D Secure Authentication | [SECURE-AUTH.md](../../src/embeds/SECURE-AUTH.md) |
| Transaction history | [TRANSACTION-HISTORY.md](../../src/embeds/TRANSACTION-HISTORY.md) |
| User Onboarding | [USER-ONBOARDING.md](../../src/embeds/USER-ONBOARDING.md) |
| Rules Flow | [RULES-FLOW.md](../../src/embeds/RULES-FLOW.md) |
| Phone Shell — Realistic Experiment | [REALISTIC-PHONE.md](../../src/embeds/REALISTIC-PHONE.md) |

## Playground animation modules

For hero, api, chart, dots, dots-bulge, orbit, radial, cards, deposits, small-cards, window-graphic, collections, webhook, reference, and access: use src/animations/<name>/index.js and adjacent styles where present. Preview index.html at /#<name>. [Recipes](../animation-recipes.md) document markup; [connectors](../connector-animations.md) cover Webhook/Reference/Access.

## Product Variety

Root: data-product-variety. Source: src/embeds/product-variety.js and product-variety.css. Shared Wallet Swap, Reveal, and Pointer Follow; the module owns mounting/cleanup. Tests: tests/wallet-swap.test.js. Figma reference, local preview route, and exact Webflow identity are not recorded here; inspect the current component before integration.

- Income Verification: [notes](../../src/embeds/INCOME-VERIFICATION.md), alternating three-row background marquee and expanding rings.
