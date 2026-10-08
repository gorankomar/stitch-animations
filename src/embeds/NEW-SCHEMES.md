# New schemes support

Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=445-1631 (540 × 278).

Native Webflow component `10e17898-ebd3-8ae1-6ac0-ffc6be1399fb`, group Animations, on site `6823036cd77b3093eaf9154d`, Animations Playground `6ab4079ac7ca32e3a6c168c8`. Page instance `10e17898-ebd3-8ae1-6ac0-ffc6be1399fa`. The Playground remains a draft. User approved publishing to staging on 2026-10-08. Release uses the permanent staging loader; Playground remains unpublished and production activation is not authorized. Deployment evidence is recorded in docs/releases.

Source: `new-schemes.js`, `new-schemes-native.css` (local reference for native styles), `new-schemes-motion.css`, `new-schemes-markup.html`, and `new-schemes-scoped-style.html`. The style-only embed is inside the component. `scripts/build-new-schemes-preview.mjs` generates the local animated/static pages and markup. `scripts/prepare-new-schemes-webflow.mjs` generates the native insertion markup and scoped style embed; insert the reusable artwork components into its `data-ns-slot` wrappers afterward.

Preview: `npm run dev`, then `/new-schemes-preview.html`. Static/no-JavaScript fallback: `/new-schemes-static-preview.html`. Asset comparison: `/new-schemes-assets-preview.html`. Shared entries register `[data-new-schemes]`; standalone build entry is `feature-new-schemes`.

## Reusable artwork and preservation

Reuses Saudi Arabia Flag, Visa, Mada, MasterCard in its supported Original Color variant, Icon - Credit Card with instance Stroke width `0.85`, and Icon - Check. The established components' definitions and internal CSS are unchanged. Position, size and crop adjustments belong to outer illustration wrappers. Mada's fixed SVG dimensions are scaled by its outer wrapper using container-relative CSS math.

New components: Verve `1f1cb714-cf75-c9c7-4e8e-165a8e18ada5`, AfriGo `9035f43b-eba4-83d8-62ea-cd9c21c3e83e` (both Logos), and Nigeria Flag `99d90b69-96f2-a0fd-e631-4dda62aac658` (Icons). The spelling AfriGo follows Figma. Nigeria preserves the supplied 26:17 vector geometry and green. The two new logo components use their original raster artwork; Verve's Figma crop belongs to the outer illustration wrapper.

## Illustration and style contract

`ns-shell` measures parent width with inline-size containment. `ns-frame` preserves 540:278. Typography, corners, gaps, box geometry and stroke sizes scale with cqi. Native Webflow owns supported visual properties. Body font inherits `Abcdiatype, Arial, sans-serif`, verified on the actual site. Local preview uses that site's medium font asset.

The component carries only scoped motion/state exceptions: hover translate/transitions, simulated-hover selector, checked tick opacity, cursor shadow, reduced-motion queries, and Verve crop. Its static fallback is the full Figma design with Mada and AfriGo checked; the demo cursor is decorative and hidden. Essential content has no permanent entrance hiding. No external stylesheet or JavaScript is needed for the saved fallback appearance.

## Motion and lifecycle

Explicitly requested motion reuses canonical Reveal tracks, Demo Cursor, Card Hover behavior and Animation Stage. Saudi panel appears first, then Nigeria. Their headings and options reveal sequentially bottom-to-top. Soft displacement is 12 design units, scaling with the frame. Movement uses live `--motion-ease-primary`; reveal duration uses `--motion-duration-default`, staggering uses `--reveal-stagger-default`, and fade is linear with `--reveal-opacity-ratio`. Hover uses the default duration and primary curve. Checkbox transitions use `--motion-duration-fast` with linear tick opacity. Live Global Styles inspected on 2026-10-08: primary cubic-bezier(.11, .61, .27, .99), default 770ms, fast calc(default * .6), stagger 200ms, opacity ratio .34.

After entrance, the demo starts with both options unchecked. It emerges from behind Nigeria's lower-right corner, selects AfriGo, then Mada, travels left and disappears behind Saudi Arabia. Two seconds of fully hidden hold precede the return from Nigeria. It unselects AfriGo, then Mada, exits behind Saudi Arabia and holds another two seconds. Complete loop: 14 seconds. User-specified holds remain explicit seconds. Press animation accompanies each state change.

Real pointer hover and visible demo-cursor presence lift the appropriate whole panel by 4 design units and add a subtle shadow. Every frame measures actual checkbox and panel bounds, including the current CSS hover translation; clicks stay aligned during lift and return. Layout/reveal transforms belong to the position wrappers, lift to the panel's translate property, and cursor movement to its own wrapper. No Pointer Follow is added.

Root `[data-new-schemes]`; child hooks `[data-ns-panel]`, `[data-ns-reveal]`, and `[data-ns-option="afrigo"|"mada"]`. Per-instance mounting is guarded. Animation Stage pauses offscreen and on hidden tabs. Reduced motion restores the checked Figma appearance and hides the demo. Cleanup restores original reveal styles, checked states, cursor styles and SVG references, removes simulated hover and readiness, and disposes observers/clock. Inline SVG IDs are namespaced during mounting and restored on cleanup. Failed clock setup retains the supplied fallback.

## Assets and verification

Originals: `assets/new-schemes/originals`; optimized derivatives: `assets/new-schemes`. `optimization.json` records all SVG bytes and the explicit SVGOMG-equivalent SVGO 4.1.0 plugin list, multipass, numeric precision 2 and transform precision 8. Root xmlns, dimensions and viewBox are retained. Nigeria's clip ID is namespaced. Static local vectors use images; the reusable Webflow Nigeria flag uses native inline SVG, matching existing reusable flag construction. Existing semantic icons/logos are reused in Webflow.

PNG masters: Verve 2048 × 807 / 102,458 bytes; AfriGo 900 × 364 / 26,710 bytes. cwebp 1.5.0, method 6, lossless, exact transparency, ICC metadata. Verve WebP 132 × 52 / 2,022 bytes; AfriGo WebP 100 × 40 / 1,958 bytes. These cover 2× density through approximately 1080px composition width. Higher-density/larger placements can derive larger WebPs from the preserved masters. Hosted managed assets are recorded in `webflow-assets.json`.

Original/optimized vectors and logos compared at design size and 2×; the full composition was compared with Figma. Actual Designer verified at 436px and 345px: all artwork present, proportional sizing, intended color variants, body font, and no label overflow. Webflow Preview reports the visible 345px static fallback, both checks and decoded logo dimensions; the new animation is intentionally unavailable there before staging activation. The final Preview screenshot/desktop reset could not be completed after the Mac locked, following successful mobile Designer inspection.

Local animated preview verified with simultaneous 540px and 270px instances, complete assets and no console warnings/errors. `tests/new-schemes.test.js` verifies click order, press/state timing, fully hidden holds, loop seam, moving targets, duplicate mount, teardown/remount, visibility/hidden-tab pause, reduced motion, failed setup and reveal scaling on resize. Full suite: 115 passing tests. Shared build and dependency check pass, including Product Variety wallet swap and Country Flags. No publication or channel activation was performed.

Animated local preview image: `docs/components/assets/new-schemes-preview.jpg`; the in-app preview remains open for review.
