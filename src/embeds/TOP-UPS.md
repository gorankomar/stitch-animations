# Top-ups

Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=433-1566 (540 × 278).
Webflow component `e4c49191-e169-4d20-a184-5c4143105848`; Playground instance `e4c49191-e169-4d20-a184-5c4143105847`, site `6823036cd77b3093eaf9154d`, page `6ab4079ac7ca32e3a6c168c8`. Saved draft, no publication or animation-channel activation.

## Composition

Native Webflow `.tu` is a width query container; `.tu-frame` retains 540:278. Positions use frame percentages; typography, padding, gaps, radii, borders, and shadows scale with cqi. Text inherits the live Abcdiatype body font. All static styling is native, including container-type and writing-mode as native custom properties; no external CSS or scoped style embed is required.

Credit Card `ddf5ec98-7371-1bc2-9e16-1f4ac115394a`, Dark Blue variant `5bfc8bd2-120a-7705-22f4-90beebf323aa`. Supported Reveal and Rotate 4-digits props are false. Preserve its internal logo, border, chip/contactless, provider, digits 8899 and established 1.586 ratio. The old Figma artwork/3215 is superseded by the requested existing card. No illustration selector targets card descendants. The card scales as a complete component at width 300 design units.

Top-ups panel includes heading, amount caption, USD 200 input display, and six amount options; USD 200 selected. Decorative dot is a native HTML span with 50% rounded corners and flat #009AFF background. Its 8 × 8 design-unit circle is centered in the original 10 × 10 slot. No dot image or asset request remains.

## Motion

`top-ups.js` exports `init(root=document)` and cleanup via shared stageInitializer. Three outer `[data-tu-layer]` wrappers reveal bottom to top: card Soft at 0ms, panel Hard at 340ms, label Hard at 680ms. Duration reads live `--motion-duration-default` (verified 770ms); translation reads `--motion-ease-primary` (verified cubic-bezier(.11,.61,.27,.99)); opacity stays linear with global reveal-opacity ratio .34. Hard motion clears the frame edge including proportional shadow bleed and never changes opacity.

Nine `[data-tu-item]` wrappers (heading, caption, amount field, six individual options) Soft Reveal bottom to top beginning after the panel arrives at 1110ms, stagger 35% of global reveal stagger (verified 70ms). Small proportional soft travel: card 6.5% and panel items 2.5% of frame width. Item sequence finishes at 2440ms.

Separate nested `.tu-follow` wrappers use canonical Pointer Follow: card depth 0/strength .03/5 design pixels, panel depth 1/.05/10, label depth 2/.07/14. Offsets scale with parent width. Starts after all three layers land; fine-pointer hover only. Stage clocks pause offscreen/hidden. Reduced motion renders static content; missing tokens, partial setup failure and cleanup restore initial transforms/opacities/styles and follow offsets. No permanent hidden styles or generic data-reveal entrances.

Both page entries and multi-entry Vite build register Top-ups. The new module remains local until an authorized staging release. Do not add portable inline runtime or change permanent loader URLs to preview it.

## Verification

Local `/top-ups-preview.html`, two parent widths 540 × 278 and 320 × 164.734 at the same viewport. Cards measure 300 and 177.773px; title sizes 14 and 8.29629px. Normal entrance completes with all layers/items at opacity 1/transform none. Pointer test measured three distinct translations (1.25/.67, 3.68/2.15, 6.41/3.99px). `?static` skips animation import; both complete compositions remain visible. Local preview snapshots are strictly local, not deployed style overrides.

Webflow Designer mobile 345 × 177.609; card 191.664px, title 8.94445px, dot originally verified at naturalWidth 10; subsequently replaced with the same-size native circle at user request. Webflow Preview desktop 630 × 324.328, all 12 targets visible; no Top-ups ready attribute because its new runtime has not been released. Static Designer screenshot recorded in docs/releases/assets. Snapshot service omits some shadows; actual computed native panel and label shadows were separately verified.

Five Top-ups lifecycle/scheduling tests and three shared reveal regression tests pass. Shared Vite build in `/private/tmp/top-ups-build` passes and shared-release dependency check confirms Product Variety/wallet swap and Country Flags remain present. Full suite: 93/97 pass; four failures are in existing concurrent Digital Wallet/Revolving Credit carousel work, which Top-ups does not import or modify. Browser JS-disable and OS reduced-motion emulation were not independently performed; missing-module browser verification and lifecycle tests cover those fallback contracts.

## Staging release — 2026-10-07

User authorized publishing all four illustrations and their related source, assets, documentation, tests and generated distribution files to GitHub and staging. Full release validation passes 97/97 tests and shared dependency verification. The shared carousel retains the established 6×duration hold / 4×duration move, preserving Revolving Credit behavior. See docs/releases/2026-10-07-digital-wallets-staging.md for final delivery evidence; earlier draft-only delivery statements above describe preparation history.
