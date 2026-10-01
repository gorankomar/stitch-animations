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
