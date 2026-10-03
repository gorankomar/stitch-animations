# Dynamic funding

Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=395-1882. Actual frame 526 × 278.
Webflow: Animations / Dynamic funding, component `99197dfd-6d62-b377-53fd-e9a0f5fcff39`; Playground instance `99197dfd-6d62-b377-53fd-e9a0f5fcff38`, site `6823036cd77b3093eaf9154d`, page `6ab4079ac7ca32e3a6c168c8`.

## Appearance

Native Webflow classes own layout, typography, borders, shadow, and scaling. Width fills its parent; frame preserves 526:278; lengths use cqi relative to the outer inline-size container. Text inherits the site's Abcdiatype body font. `dynamic-funding-native.css` records native styles; preview files remain local.

Reuse the existing Credit Card Light/base variant, component `ddf5ec98-7371-1bc2-9e16-1f4ac115394a`, with its current Stitch logo. Card Reveal and Rotate 4-digits are false through supported props. Only its outer width and position change: no card descendant overrides. Its established 1.586 ratio is preserved, slightly taller than the old Figma card.

One native background block uses the existing `.features-graphic_grid-bg` from Global Styles. User corrected “gradient” to “grid”; do not export the Figma background vector as an image. The plain white frame and shared grid preserve the illustration's background.

Uber and Netflix use optimized external SVGs as native managed Images. Originals and derivatives: `assets/dynamic-funding/`. SVGO 4.1.0, multipass, numeric precision 2, transform precision 8; explicit plugins/exceptions in `optimization.json`, recreated by `scripts/optimize-dynamic-funding-assets.mjs`. xmlns, root dimensions, and viewBox retained. Originals/optimized visually compared at 47/55px, 94/110px, and 235/275px: no visible shape/color damage. Netflix 1487 → 912 bytes; Uber 3876 → 1112 bytes (plus file newline).

Webflow assets: Netflix `6ac167a50366a07856b5a60e`; Uber `6ac167a5f6288f15aa26aa60`. Both multipart uploads returned 201; both images load with correct proportions in Designer and Preview.

## Motion

`dynamic-funding.js` composes canonical Hard Reveal, Value Counter, Pointer Follow and Animation Stage. Entrance starts when at least 40% of the illustration intersects the viewport, once per mounted instance. Card → Uber → Netflix, right to left, no opacity changes; starts overlap by canonical 340ms Hard Reveal stagger. Each entrance uses live `--motion-duration-default` and `--motion-ease-primary` (verified 770ms and cubic-bezier(.11,.61,.27,.99)). Amounts count from $0.00 to $2,400.23 / $400.23 during their box's entrance with exact cents and grouping. No idle loop.

Pointer Follow owns nested wrappers only; reveal owns outer transforms. Both transaction boxes follow the pointer over the illustration after entrance, fine-pointer/hover only: depths 0/1, strength .06/.09, max travel 8/12 design pixels scaled with frame width. Card remains stationary. Offscreen/hidden-tab gating stops follow and pauses the entrance clock. Resize remeasures reveal geometry and scales pointer travel. Reduced motion shows full resting content; setup/render failure and cleanup restore complete static fallback. WeakMap and shared Symbol prevent duplicate mounting.

## Draft delivery and verification

Saved to Webflow draft on 2026-10-03. Scoped style-only embed `99197dfd-6d62-b377-53fd-e9a0f5fcff50` carries container sizing; draft runtime embed `99197dfd-6d62-b377-53fd-e9a0f5fcff51` comes from `node scripts/build-dynamic-funding.mjs`. Both shared page entries and Vite register the feature. At middle/publication remove this draft runtime once a verified shared release includes Dynamic funding. Site-wide and Playground loader URLs were not changed; no publication performed.

Designer checked with full static artwork. Webflow Preview desktop 630 × 332.96 and mobile 345 × 182.34 retain the reference ratio. Amount font mobile 9.18252px scales from 14px/526. Both SVGs load. Pointer test measured Uber 2.55/-2.87px and Netflix 4.03/-4.54px at the same pointer. Custom-code-disabled Preview keeps full amounts and transform none. Unit lifecycle tests verify 40% gate, offscreen pause, counter progression/final cents, duplicate mount, reduced motion, cleanup and observer failure. Browser reduced-motion emulation is not independently checked; lifecycle coverage verifies that path. Local route `/dynamic-funding.html` includes 526px and 320px parents using a read-only snapshot of the established card.

Isolated shared build `/private/tmp/stitch-dynamic-funding-build` passes the release checker, retaining Product Variety/wallet swap, Country Flags and complete local module/CSS dependencies. Generated tracked release dist is intentionally not replaced for a draft.
