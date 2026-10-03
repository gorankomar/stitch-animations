# 3DS-enabled security

- Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=396-1906; node `396:1906`, 540 × 278.
- Webflow: Stitch Website `6823036cd77b3093eaf9154d`, Animations Playground `6ab4079ac7ca32e3a6c168c8`, Animations component `a233a329-7131-566c-a11a-2481d8435a80`.
- Native styles: all layout, background gradient, typography, ring/image sizing, border radius and script-placeholder display. Only container-type:inline-size and writing-mode:horizontal-tb are in the separate style-only embed. Local `3ds-enabled-security-native.css` is a preview record and never imported by the runtime.
- The frame keeps aspect ratio 540/278. Geometry/text scale with the measuring ancestor's width through cqi. Text is native editable paragraphs, inheriting the site's ABC Diatype body family (live Designer and Preview verified), with Figma's 40/20 size hierarchy, 30/20 line heights, 8 gap and centered 82-wide box.
- Original SVGs in `assets/3ds-enabled-security/originals`; optimized externally hosted assets and IDs in `webflow-assets.json`. Retain the distinct supplied gradients and their shadow bleed rather than substitute one gradient for all three. Optimization: SVGO 4.1.0, multipass, precision 2, transform precision 8, explicit config and byte counts in `optimization.json`. Root dimensions, viewBox, filters, gradients and IDs retained. User-authorized adaptation adds vector-effect=non-scaling-stroke to stroked geometry. External image sizing changes its SVG viewport; no transform scaling is used. Original/optimized static appearance compared at desktop/mobile; exact 1 CSS px stroke verified at 152px and 608px image sizes by integrated alpha coverage (1.0px at both).

## Motion and reuse

- Root `[data-3ds-enabled-security]`, rings `[data-tds-ring]`, heartbeat `[data-tds-heartbeat]`, success marker `[data-tds-ready]`.
- Uses canonical `createExpandingRings` with diameters 488/380/264, birth 264, range 264×216/170, duration default×24 and phases .6967/.3633/.03. Same monotonic radial progression and linear fading as Omnichannel Origination. `sizing:{designWidth:540}` animates width/height rather than transform scale, preserving the 1px outline in external SVGs.
- Heartbeat changes the badge circle diameter: 1 → 1.055 → 1 → 1.035 → 1, followed by a resting interval. Offsets 0/.1/.22/.32/.48/1, period default×2.4 (1848ms at live 770ms). Each segment uses the resolved Global Styles primary easing. Text stays centered and still while the circle beats. Circle stroke remains 1px.
- Global Styles read live: --motion-ease-primary cubic-bezier(.11,.61,.27,.99), --motion-duration-default 770ms. Runtime reads tokens per instance; missing/invalid values retain static artwork.
- Visibility threshold .1, hidden-tab pause, resize rebuild, reduced-motion static restoration, duplicate mount guard, global portable/shared mount registry, cancellation/disposal, partial failure rollback. Rings are registered as soon as each track is created so later setup failure cannot leak a running track.
- Both shared entries and multi-entry Vite config register the feature. Webflow draft currently carries a script-only portable bundled runtime (`95fa7ca9-2a5f-3a49-e207-33c3f2b1c5a9`) and independent sizing style embed. No shared loader URL changes or publication. Middle/release synchronization removes the portable runtime after the shared release includes this feature.
- Omnichannel Origination's Webflow runtime also updated to use the same shared size-based effect; its native SVG strokes now use vector-effect=non-scaling-stroke and stroke-width=1. Existing ring artwork, centered geometry, rows, entrance and pointer follow retained. Income Verification continues to consume the compatible transform-based default; no unrelated Webflow runtime changed.

## Verification

- Preview: npm run dev, `/3ds-enabled-security.html`. Builder: `node scripts/build-3ds-enabled-security.mjs`. Optimizer: `SVGO_MODULE=<module> node scripts/optimize-3ds-assets.mjs`.
- `PLAYWRIGHT_MODULE=<module> BROWSER_EXECUTABLE=<browser> node scripts/verify-3ds-enabled-security-browser.mjs` passed full-cycle separated rings, minimum two visible rings, heartbeat timing/easing, duplicate mount/cleanup/remount, offscreen pause, reduced motion, 540/270 independent parents (40/20 title sizes), 320 viewport, JS-disabled artwork, and heartbeat setup failure rollback. No browser errors. External stroke probe stayed 1px at 4× scaling.
- Omnichannel browser regression passed full cycle, row directions/seam coverage, pointer follow, duplicate mounting, cleanup/remount, responsive parents, mobile, reduced-motion and failed setup fallback. Existing movement assertions support size-based ring keyframes.
- Webflow Designer static appearance matched the supplied layout before adding motion. Preview verified with custom code enabled at desktop and 393 mobile viewport (345-wide frame, 177.61 height, 25.56 title size), correct body font, ready state and changing ring/badge dimensions.
- All 76 repository tests passed. Full shared build verified in `/tmp/3ds-shared-build`; dependency check retained Product Variety/wallet swap and Country Flags. Shared dist remains a future release concern; portable draft artifacts saved here.

Completion stage: saved to Webflow (draft). No domains published.
