# Worldwide Markets

Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=457-1676

Design frame: 258 × 232. Map bounds: x 8.194, y 46.828, 241.427 × 137.822. Figma mirrors the MAP group horizontally; the native map-position wrapper preserves that transform for both the image and masked overlay.

Webflow component: `120c13fd-2d68-aa54-c51e-0f5b35fc630d`, Worldwide Markets. Saved on Animations Playground (`6ab4079ac7ca32e3a6c168c8`), which remains Draft. Asset: `6ac9123696d43e88660ee777`, worldwide-markets-map.svg. All base layout, background gradient, map sizing, edge fades and glow gradient are native Webflow styles (worldwide-markets-native.css records their values). The separate style-only embed carries container queries, grid controls, mask rules and ready/reduced-motion selectors (worldwide-markets-scoped.css). The background reuses Global Styles `.features-graphic_grid-bg`.

Root: `[data-worldwide-markets]`, width 100%, min-width 0, inline-size container. Frame keeps 258:232 aspect ratio. Every layer scales with its own parent. Map remains an external cached SVG rather than 2,120 individually animated DOM paths. The same URL supplies the overlay's alpha mask; white light cannot cover the gaps between map shapes. No inline SVG IDs or per-instance reference collisions.

Untouched source: assets/worldwide-markets/originals/map.svg (298,794 bytes). Optimized map: 90,471 bytes excluding final newline. SVGO 4.1.0, multipass, numeric precision 2, transform precision 8; explicit configuration and structural exceptions are recorded in assets/worldwide-markets/optimization.json. Original and optimized renders were compared at 258px; detail remains intact. No rasterization.

Motion: worldwide-markets.js exports init(root=document), returning disposal through the shared Animation Stage initializer. One transparent–white–transparent band, 75% of map width, travels left to right on screen over 4.5 seconds, then rests outside the map for 2.5 seconds (7-second repeat). The decreasing local X compensates for the mirrored artwork wrapper. Updated at the user’s request on 2026-10-09 for a wider, slower glow and longer pause. Continuous directional movement is linear per motion-defaults. There is no entrance reveal, hover or pointer effect. The existing Glow Sweep helper was inspected but is pointer-driven and lacks this automatic stage clock/mask contract; the existing Animation Stage provides lifecycle and visibility instead.

Only after image decode and successful stage setup does `data-wm-ready` remove both static fades and expose the map-only sweep. Reduced motion, blocked module, disabled JS, failed setup and disposal preserve the Figma fallback. The module owns only mask URLs, the glow's transient transform and the ready marker; it restores previous inline values at teardown. Offscreen and hidden tabs pause the stage clock. Setup-failure testing exposed partial observer cleanup in Animation Stage; it now disconnects partial observers before rethrowing.

Global Styles was read live: --motion-ease-primary cubic-bezier(.11,.61,.27,.99), --motion-duration-default 770ms, fast calc(default × .6). This slow continuous loop uses the user-requested cadence rather than an interaction duration token.

Local preview: /worldwide-markets.html (three different parent widths at the same viewport). Registered in page-all, page-all-lite and Vite feature-worldwide-markets. Deployed external CSS is unnecessary: native styles and the component-local style embed carry appearance.

Verification 2026-10-09: local 258/360/516px widths preserve 258:232; reduced-motion toggle/restart; duplicate mount/dispose/remount; JS-disabled mobile fallback; offscreen pause; resize; blocked entry; partial setup failure. Native Webflow Designer checked at 1055px desktop (465 × 418px instance) and 393px mobile (345 × 310px instance), loaded asset, shared grid mask and mirrored orientation confirmed. 120 repository tests pass. Complete Vite output built in /tmp/worldwide-markets-build; shared-release check passes, including Product Variety/wallet swap and Country Flags. Local build output does not activate staging.

Delivery: saved Webflow draft, locally verified animation, and staging release authorized on 2026-10-09. See docs/releases/2026-10-09-worldwide-markets-staging.md for release evidence. The permanent Playground loader uses the staging channel; do not add an inline runtime or change the permanent loader. Playground must never be published.
