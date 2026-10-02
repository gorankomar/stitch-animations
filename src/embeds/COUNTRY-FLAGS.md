# Country flags

Webflow site: Stitch Website (`6823036cd77b3093eaf9154d`).
Page: Animations Playground (`6ab4079ac7ca32e3a6c168c8`).
Component: **Global Coverage — Country Flags** (`0a0bfdec-9030-a5d7-d023-67e64a39586a`).

Three native rows each contain nine unique SVG images. Runtime copies keep each
468px sequence continuous; copies are hidden from assistive technology. The
first and last rows move left, the middle row moves right, at 12px/second.
Offsets are 10px, 0px, and -25px. Each complete sequence repeats every 39 seconds.
Change `data-speed` on the root, or `data-phase` and `data-direction` on a row.

The animation starts when the illustration first intersects the viewport. It
pauses offscreen and in hidden tabs, resumes without resetting, and stays static
for reduced-motion preferences. A shared controller prevents duplicate mounting
when both the inline draft preview and the library resolver load.

Flags come from Figma file `PCbd0DyXWAD2cDANtl7bpH`, component set `340:1601`,
using **Style=Flag, Radius=Off**. Manifest records the 27 original variant IDs.
Required flags: UAE, USA, Saudi Arabia, India, Singapore, Malaysia, Liberia,
Brazil, Japan. Assets preserve the component's stylized colors and geometry.
Baked rounded backgrounds/outlines are made square; 2px corners are native CSS.
SVGO 4 reduced 42,407 bytes to 26,319 bytes.

`assets/country-flags/webflow-assets.json` records the managed Webflow asset IDs
and CDN URLs. The component images are explicitly bound to those asset IDs.

Build: `node scripts/build-country-flags.mjs`. This updates the preview,
standalone bundle, and drop-in embed without clearing other build outputs.
`npm run build` also includes the module in both page resolvers.
Preview: `npm run dev` and open `/country-flags.html`; scroll down to start it.
Loop checks: `node --test tests/country-flags.test.js`.

## Responsive sizing — Webflow draft, 2026-10-01

The native component root is now a width:100%, min-width:0 inline-size
query container. Its child `country-flags_frame` preserves the 258:232 design
ratio; frame decoration belongs on that child so cqi resolves against the root.
The card, flags, gaps, padding, borders, radii, shadows, and caption scale
proportionally from the same 258px reference width. The caption inherits the
site body font. Existing Webflow card colors, rounding, and row padding remain
the visual reference, rather than the older local-preview design.

All sizing is native Webflow styling. `is-fluid` combo classes protect the
native properties against the legacy country-flags stylesheet still imported
by the current immutable shared loader. Explicit card padding/gap/box-sizing
and row overflow values prevent that old stylesheet changing the composition.
No style embed, shared-loader change, or animation runtime change is required.
`country-flags-native.css` records these native styles for reference; it is not
imported by the deployed animation or the old standalone preview builder.

Verified in Webflow Designer and Preview: mobile parent width 345px gives a
345 × 310.23px frame, 56.16 × 40.11px flags and 16.05px caption. Desktop Preview
parent width 594.41px gives a 594.41 × 534.50px frame and 96.76px-wide flags.
Intermediate/tablet fallback width 334.24px gives height 300.55px. Preview
retains three scrolling tracks and nine sequences after animation cloning.
With Preview custom code disabled, all 27 original flags remain visible with
three sequences, opacity 1, and the same mobile dimensions. Both loop tests pass.
No new reduced-motion or cross-page instance check was performed for this
style-only change. Saved to Webflow (draft); no domain was published.

Fallback edge correction: the native `country-flags_rows.is-fluid` style clips
its right edge by 0.387597cqi (1px at the 258px design width). This removes
fractional-pixel slivers of the fourth flag caused by independent rounding of
flag widths and gaps. The inset scales with the component and does not change
row geometry, sequence measurements, or the animation runtime.
