# Component index

Use existing source and notes as truth. Missing Figma references stay unknown. Use [the template](TEMPLATE.md) for new/revisited components. Historical verification is not live publication state.

| Component | Notes |
| --- | --- |
| Fallback and Retry Logic | [FALLBACK-RETRY.md](../../src/embeds/FALLBACK-RETRY.md) |
| Top-ups | [TOP-UPS.md](../../src/embeds/TOP-UPS.md) |
| Email Statement | [EMAIL-STATEMENT.md](../../src/embeds/EMAIL-STATEMENT.md) |
| Consumer Verification Label / Center Label | [CONSUMER-VERIFICATION.md](../../src/embeds/CONSUMER-VERIFICATION.md) |
| Consumer Verification | [CONSUMER-VERIFICATION.md](../../src/embeds/CONSUMER-VERIFICATION.md) |
| Income Verification / Verification Document Item | [INCOME-VERIFICATION.md](../../src/embeds/INCOME-VERIFICATION.md) |
| 3DS-enabled security | [3DS-ENABLED-SECURITY.md](../../src/embeds/3DS-ENABLED-SECURITY.md) |
| Omnichannel Origination | [OMNICHANNEL-ORIGINATION.md](../../src/embeds/OMNICHANNEL-ORIGINATION.md) |
| Real-Time Approvals | [REAL-TIME-APPROVALS.md](../../src/embeds/REAL-TIME-APPROVALS.md) |
| Real-Time Balance Management | [BALANCE.md](../../src/embeds/BALANCE.md) |
| Dynamic transaction switching | [DYNAMIC-TRANSACTION-SWITCHING.md](../../src/embeds/DYNAMIC-TRANSACTION-SWITCHING.md) |
| Dynamic funding | [DYNAMIC-FUNDING.md](../../src/embeds/DYNAMIC-FUNDING.md) |
| Cards, your way | [CARDS-YOUR-WAY.md](../../src/embeds/CARDS-YOUR-WAY.md) |
| Instant Virtual Cards | [INSTANT-VIRTUAL-CARDS.md](../../src/embeds/INSTANT-VIRTUAL-CARDS.md) |
| Card Controls | [CARD-CONTROLS.md](../../src/embeds/CARD-CONTROLS.md) |
| Collections — Window Stack | [COLLECTIONS.md](../../src/embeds/COLLECTIONS.md) |
| New schemes support | [NEW-SCHEMES.md](../../src/embeds/NEW-SCHEMES.md) |
| Country flags | [COUNTRY-FLAGS.md](../../src/embeds/COUNTRY-FLAGS.md) |
| Worldwide Markets | [WORLDWIDE-MARKETS.md](../../src/embeds/WORLDWIDE-MARKETS.md) |
| Create New Card | [CREATE-NEW-CARD.md](../../src/embeds/CREATE-NEW-CARD.md) |
| Build for Devs | [BUILD-FOR-DEVS.md](../../src/embeds/BUILD-FOR-DEVS.md) |
| Buy Now Pay Later | [BUY-NOW-PAY-LATER.md](../../src/embeds/BUY-NOW-PAY-LATER.md) |
| Credit Check | [CREDIT-CHECK.md](../../src/embeds/CREDIT-CHECK.md) |
| Peer-to-Peer Transfers | [PEER-TO-PEER-TRANSFERS.md](../../src/embeds/PEER-TO-PEER-TRANSFERS.md) |
| Wallet / Wallet Graphic | [WALLET.md](../../src/embeds/WALLET.md) |
| Digital Wallet | [DIGITAL-WALLET.md](../../src/embeds/DIGITAL-WALLET.md) |
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
| Deposits — Digital Wallet | [DEPOSITS-WALLET.md](../../src/embeds/DEPOSITS-WALLET.md) |

## Playground animation modules

For hero, api, chart, dots, dots-bulge, orbit, radial, cards, deposits, small-cards, window-graphic, collections, webhook, reference, and access: use src/animations/<name>/index.js and adjacent styles where present. Preview index.html at /#<name>. [Recipes](../animation-recipes.md) document markup; [connectors](../connector-animations.md) cover Webhook/Reference/Access.

## Product Variety

Root: data-product-variety. Source: src/embeds/product-variety.js and product-variety.css. Shared Wallet Swap, Reveal, and Pointer Follow; the module owns mounting/cleanup. Tests: tests/wallet-swap.test.js. Figma reference, local preview route, and exact Webflow identity are not recorded here; inspect the current component before integration.

- Income Verification: [notes](../../src/embeds/INCOME-VERIFICATION.md), alternating three-row background marquee and expanding rings.

- Issuer routing: [notes](../../src/embeds/ISSUER-ROUTING.md), right-to-left reveal and branching payment pulse.

- Homepage Hero stacked windows: [static fallback and motion notes](hero.md).

- Icon hover playground (local experiment): [notes](../../src/embeds/icon-playground/README.md), `/icon-playground.html`.

- Platform Screens (static Webflow draft): [notes](../../src/embeds/platform/PLATFORM-SCREENS.md), shared Platform Screen shell; Dashboard, Loans, Ledgers, Cards, Person detail and Cases detail layouts; Stitch AI navigation, sidebar slots, filters, table rows, metrics, collapsed headers and empty panels.
- Onboarding customer (Platform Screens draft): [notes](../../src/embeds/platform/ONBOARDING-CUSTOMER.md), contextual Controls sidebar with group/title/item slots and complete reusable 716.2 × 1534 workflow.

- Workflow Flexibility: [notes](../../src/embeds/WORKFLOW-FLEXIBILITY.md), five-window stack with hard upward reveals, 2.5-second holds and downward rotation; Playground draft.

- Bilateral and syndicated lending: [notes](bilateral-lending.md), reusable Onboarding Customer / Cards screen stack with hero surfaces, proportional perspective and reduced-motion-aware hover; Playground and Loans page drafts.

- Omnichannel onboarding flows: [notes](omnichannel-onboarding.md), native Cards screen and flexible centered Lulu signup modal; upward reveals, gentle pointer follow and User Onboarding loading-line sweep; Playground draft only.

- Credit Decisioning Workflows: [notes](credit-decisioning-workflows.md), shared lending window stack with Cards Screen, populated Customer Details Window Graphic and full shared grid; Playground draft only.

- Loan account management: [notes](loan-account-management.md), populated Ledger Transaction Detail screen with native Create ledger category modal, existing US flag, onboarding upward reveals and gentle pointer follow; Playground draft only.

## Orbit Graphic

[Orbit Graphic](orbit-graphic.md): reusable Dots → Dot → Icon slots, proportional parent-width composition, immediate Pointer Follow during the existing pop-in. Compact/Landscape variants and Number of rings (1–6/default 3). Webflow draft and [staging release](../releases/2026-10-29-orbit-staging.md) verified; Playground remains unpublished.
