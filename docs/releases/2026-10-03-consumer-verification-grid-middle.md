# Consumer Verification and Playground grid — middle

2026-10-03, Europe/Zagreb. Requested stage: push and merge, then middle. No domains selected or published; user publication and live-site verification remain pending.

Merged implementation: `bdb9bf8d2f0d1f09ddde3065b0b752809013c39e` ([PR #17](https://github.com/gorankomar/stitch-animations/pull/17)), based on current main `185cee541ba3cc1da10038339dab6136354637cc`. Includes all chat-owned Consumer Verification source, SVG masters/assets, five-slot label revision, component notes, verification script, workflow notes and fresh distribution files. Unrelated local Phone Shell experiment files and its component-index entry were preserved separately.

Active immutable base: `https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@bdb9bf8d2f0d1f09ddde3065b0b752809013c39e/dist/`.

Site footer and Playground page footer both changed from `043555c144d7779db07b4cef9b395077ba159f0a/dist/page-all-lite.js` to the new base plus `page-all-lite.js`. Exact read-back matched the expected URL-only edits; all unrelated head/footer code was preserved. All 74 runtime JS/CSS files on jsDelivr matched the committed build bytes. No CloudFront provider change.

Consumer Verification and Omnichannel Origination inline motion embeds were cleared after confirming both are covered by page-all-lite; read-back confirmed no remaining scripts in those embeds. Scoped style embeds, the Webhook annotation entrance, and the existing Balance, Report Graphic, Collections, Embedded Connectivity and Payment Wallet scripts were preserved because their behavior is not resolved by the light loader. No duplicate feature-module tags were found in the inspected Playground component definitions.

Features Wrapper uses the native page-specific `playground-features-grid` class: 25 cells in original order, two equal columns with 20px gaps and top alignment, one column below 768px. Most cells are direct component instances; required preview wrappers and both CV sizing shells remain. Phone Shell — Realistic Experiment is outside the grid. No component definitions, props, slot contents, or illustration appearance were changed for this layout operation.

Verification: `npm run validate:release` passed (47 tests, full shared build, dependency closure including Product Variety wallet swap and Country Flags). Consumer Verification draft embeds were regenerated with the documented SVGO module override. Refreshed Webflow custom-code Preview used exactly one page-all-lite URL at the merged SHA with CV/Omnichannel inline motion removed. Both CV instances initialized with five labels and 24 pulse overlays each. Desktop CV sizes: 630×378 and 630×566.51; 393px mobile: 345×207 and 345×310.23. Grid cell overflow checks passed. Omnichannel initialized with 11 generated copies after entering the viewport; Product Variety wallet-card movement and Country Flags track movement were observed. The phone experiment remained separate.

Proof: `/private/tmp/playground-grid-middle-desktop.png`, `/private/tmp/playground-grid-middle-mobile.png`. Outcome: **middle saved — ready for user publication**. Saved draft SHA is established; staging/production served releases were not inspected or changed by this middle operation.

