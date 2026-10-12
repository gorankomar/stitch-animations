# Animations Playground inline code audit — 2026-10-12

Inspected current saved Webflow page `6ab4079ac7ca32e3a6c168c8` on Stitch Website `6823036cd77b3093eaf9154d`. Page metadata confirms `draft: true`. Read the complete page tree, 123 unique referenced component definitions including recursive nested/slot components, and all 51 HtmlEmbed settings. No referenced definitions failed to load. No Webflow edits, publication, channel activation, builds, or Git changes were performed; unrelated working-tree edits were preserved.

## Findings

Six inline scripts remain, totaling about 24 KB including script tags (23,686 bytes across the five primary component scripts plus the phone clock). No external feature-loader script tags remain in these embeds. Twelve old runtime embeds are already empty. Thirty-six embeds contain CSS. One additional embed contains only a shared-loader explanatory comment.

None of the remaining six scripts can simply be deleted using the currently inspected shared entry:
- **Webhook — Transaction to Email:** annotation entrance only. Connector animation is shared, but `data-webhook-annotation` entrance is absent from the shared Webhook module.
- **Balance — Real-Time Management:** counters, visibility state, and CSS animation activation. `data-balance-graphic` has no shared resolver.
- **Report Graphic:** reveal orchestration and visitor-local audit dates. `data-report-graphic` deliberately avoids shared `data-anim` automatic reveals; no shared resolver covers it. This definition is reused by multiple Playground report examples.
- **Collections — Window Stack:** `data-collections-graphic` / `data-collections-window` behavior. The similarly named shared Collections module targets `data-collections-stage` / `data-collection-card` and uses different geometry; it is not a replacement.
- **Payment — Stitch Wallet:** custom reveals, counters and pointer follow. `data-payment-wallet` has no shared resolver.
- **Realistic Phone Shell:** live status-bar clock; absent from shared loader.

The first five are older portable runtimes that should be migrated into the shared entry before their embed scripts are cleared. The phone clock is a separate small functional script; centralize it only if desired. Existing scripts include bundled copies of shared helpers; that is duplicated library delivery, not redundant behavior.

## CSS overlap

- **Access:** most of the central animation-state block reproduces `src/animations/access/styles.css`, including connector colors, reveal states, keyframes and reduced-motion rules. Keep the surrounding component overrides: path width, native check/cross visibility, logo sizing, avatar margin and absolute row positioning.
- **Webhook:** connector colors and geometry overlap shared connector/Webhook CSS. Its more specific selectors and fallback-hiding rule belong to the current integration; preserve those until rendered equivalence and failure fallback are checked.
- **Reference:** pulse cap, circle fill and connector fill match shared module declarations. Geometry has meaningful overrides (z-index 4 versus shared 2; .0625rem stroke versus shared generic 2). Logo sizing is component-specific.
- **Financial Architecture:** shared row-geometry block duplicates `src/lib/effects/code-scroll.css`. It also reserves empty typing rows and protects the initial/static layout; retain a native/fallback equivalent if consolidating.

Other inspected style embeds supply scoped appearance, unsupported native styling, animation states or fallback rules. An inline `style` tag is not by itself unnecessary. Global Styles embeds remain essential site styling. No CSS was removed based solely on textual overlap: fallback rendering and cascade differences have not been visually verified.

## Recommended cleanup order

1. Move the five older component runtimes into shared modules/resolvers, preserving current markup, props, appearance and intended behavior. Keep Collections Window Stack separate from the unrelated catalog Collections implementation.
2. Validate against current main, obtain staging release authorization, and verify the replacement staging modules before clearing scripts from Webflow drafts.
3. Consolidate proven duplicate CSS after desktop/mobile, reduced-motion and failed-loader/static-fallback verification. Preserve component-specific overrides and appearance.
4. Read back changed code settings and confirm the Playground still has `draft: true`. Never publish this page.

This was a saved-code/source audit; no live Preview behavior or currently served channel dependency graph was verified.

## Current embed inventory

Code length is stored character count, not compressed transfer size. Script-only embeds listed below remain necessary until migration.

| Component | Embed element | Characters | Content |
| --- | --- | ---: | --- |
| Global Styles | `ab488b17-f25a-fbf8-5f54-4a3955eb57e6` | 8234 | CSS |
| Global Styles | `ab488b17-f25a-fbf8-5f54-4a3955eb57e7` | 3770 | CSS |
| Global Styles | `489deebb-81c3-5d09-471d-1439e300992d` | 2629 | CSS |
| Webhook — Transaction to Email | `9d797ccd-cf44-a80f-ac6e-8b2d53b83bc2` | 1845 | 1 script, CSS |
| Reference — Product Connections | `5587a7db-4a50-1465-e531-c5f11b511eed` | 566 | CSS |
| Access — User Permissions | `19fa2102-3149-ca8d-9b16-f9f3ad642862` | 2094 | CSS |
| Balance — Real-Time Management | `15b296a4-7ea8-8b12-0d33-42ee20db4f28` | 7075 | 1 script, CSS |
| Report Graphic | `9350ea2f-3cba-a7d3-6ca7-691586b8adfd` | 6408 | 1 script, CSS |
| Report Filter | `b15aa086-7012-9c8b-de65-64b1c9ec0e88` | 148 | CSS |
| Financial Architecture | `6087a509-9da3-1fba-1930-a573c5ce3531` | 1037 | CSS |
| Collections — Window Stack | `88e6f662-b5ee-3682-da72-a4d510d4cfce` | 2319 | 1 script |
| Ledger Sheet | `5c6429f2-6f9b-1f46-c38c-8adfd827d8c6` | 1254 | CSS |
| Change Due Date | `eac410b2-3760-1049-854c-edbaef02cfc2` | 2960 | CSS |
| Embedded Connectivity | `d220e029-9608-bf75-f375-faf9d7992d81` | 6529 | CSS |
| Embedded Connectivity | `af4b5411-a269-f201-6422-3c70717cc771` | 0 | Empty |
| Transaction Status Labels | `f1d145ab-93e5-957d-6c1e-5743f411c7cd` | 452 | CSS |
| Create New Card | `96fa29c3-d0f6-8e78-efbe-0467a166192e` | 2780 | CSS |
| 3D Secure Authentication | `8fd8cc44-3b8f-1eb3-f567-208980fb2006` | 1160 | CSS |
| Payment — Stitch Wallet | `479b0586-4a13-c490-cc53-a67ce7652abf` | 12074 | 1 script, CSS |
| Omnichannel Origination | `2df28f90-c2e4-048f-0e15-d60d44597c05` | 83 | CSS |
| Omnichannel Origination | `0a0d4d08-b0c3-eba5-dfb1-642a0cfc280f` | 0 | Empty |
| User Onboarding | `28544a77-7edd-0acb-04af-ce98804b1707` | 757 | CSS |
| User Onboarding | `28544a77-7edd-0acb-04af-ce98804b1708` | 0 | Empty |
| Credit Check | `61775f6e-e612-072a-e2fe-5c3e2e31fd92` | 1928 | CSS |
| Credit Check | `61775f6e-e612-072a-e2fe-5c3e2e31fdbb` | 0 | Empty |
| Buy Now Pay Later | `338737c6-9856-35a7-af5f-0441afd72219` | 1376 | CSS |
| Buy Now Pay Later | `338737c6-9856-35a7-af5f-0441afd7221a` | 75 | Comment/content |
| Real-Time Approvals | `efbfa115-7f0a-e3bb-cac8-9c5b29dae248` | 1139 | CSS |
| Consumer Verification | `827961af-55e1-09fc-1bfd-c8bb376b5fa5` | 1524 | CSS |
| Consumer Verification | `b602ee5a-0809-115d-351b-fa70fb778a40` | 0 | Empty |
| Income Verification | `893f2648-2166-0964-bc2c-e130bb04f318` | 159 | CSS |
| Income Verification | `dd528580-5ebc-a73c-942d-41dcc3d14d37` | 0 | Empty |
| Revolving Credit | `530b8cfb-1b3a-2d6f-7320-cd53f493089b` | 1109 | CSS |
| Revolving Credit | `e8802091-3f9d-a0ce-064c-6c3580fae88a` | 0 | Empty |
| Email Statement | `3ba754fe-d3ee-efb7-0939-7087393ac49f` | 0 | Empty |
| Instant Virtual Cards | `19d1d8d5-ae48-5459-7d5f-d904e1c17c70` | 0 | Empty |
| Dynamic funding | `99197dfd-6d62-b377-53fd-e9a0f5fcff50` | 86 | CSS |
| Dynamic funding | `99197dfd-6d62-b377-53fd-e9a0f5fcff51` | 0 | Empty |
| 3DS-enabled security | `a233a329-7131-566c-a11a-2481d8435a8f` | 84 | CSS |
| 3DS-enabled security | `95fa7ca9-2a5f-3a49-e207-33c3f2b1c5a9` | 0 | Empty |
| Rules Flow | `857447c9-955c-6b25-3042-ea719dafcd77` | 274 | CSS |
| Rules Flow | `857447c9-955c-6b25-3042-ea719dafcd78` | 0 | Empty |
| Digital Wallet | `541b3d31-003e-1396-d18f-ae18191703ec` | 208 | CSS |
| Wallet Graphic | `3a1febac-d889-aeb5-f217-ef8ca0f7fe3f` | 597 | CSS |
| Fallback and Retry Logic | `3cf6fc65-bb97-16dd-da16-23a9b37e01df` | 535 | CSS |
| New schemes support | `10e17898-ebd3-8ae1-6ac0-ffc6be139a4f` | 1239 | CSS |
| Dynamic transaction switching | `9737afd8-2b95-f4dc-944c-e9c0306a44db` | 337 | CSS |
| Build for Devs | `6eebe97d-4f66-2963-808a-718f557202f3` | 400 | CSS |
| Worldwide Markets | `120c13fd-2d68-aa54-c51e-0f5b35fc6316` | 563 | CSS |
| Realistic Phone Shell | `f10db6b0-89a1-6e63-b0ee-9513f7c223e4` | 81 | CSS |
| Realistic Phone Shell | `9742352d-4c36-0ce6-eb41-4b053f3c66bc` | 397 | 1 script |

