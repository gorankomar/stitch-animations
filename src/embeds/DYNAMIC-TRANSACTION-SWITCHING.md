# Dynamic transaction switching

Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=442-1529, node 442:1529, 540 × 278.

Webflow site 6823036cd77b3093eaf9154d; Playground page 6ab4079ac7ca32e3a6c168c8 remains Draft. Animation component 4a58cd0e-18c6-e296-df8f-22915be8c1ed; instance aef55eda-e080-0373-485e-d9985e32ca5f. Native frame a552d0e7-7c91-6dd6-c21c-a114c6d5aa08. Scoped style embed 9737afd8-2b95-f4dc-944c-e9c0306a44db. No scripts added or permanent loader changes.

## Static design and component reuse

Eight outer boxes share native .dts-network-box: solid #EAECF0 stroke, 6px radius, white-to-#F2F2F2 fill, full opacity, no shadow, following Figma 453:1643. Position-only wrappers preserve clipping and geometry. The central Stitch box and reusable logo interiors retain their appearance. All geometry scales with the 540/278 frame using cqi. Scoped CSS supplies containment and outer sizing wrappers only.

Reuses Stitch Icon 395bf329-4d62-ba67-cb8e-e05a1b1452c7, Visa, MasterCard, Mada, Amex and Stripe. Visa and MasterCard use their existing Original Color variants. Stitch Icon is white in an outer black tile; its component geometry is preserved. Giropay 6b52fa0c-9e75-44c3-4733-fb96d9538505, UnionPay b62c0737-5a79-59e3-1d42-0e253a8c50a3, and STC Pay 26ec44d9-d8f9-a445-08b1-544b7a134434 are new reusable Logos components containing the supplied native vectors and payment tile. Original/exported artwork is under assets/dynamic-transaction-switching/originals; optimized derivatives retain root dimensions, viewBox, geometry and gradients.

Webflow WHTML lowercases mixed-case SVG tags; repair linearGradient tags through set_tag after import. Exported background dots are no longer mounted. Canonical createDotsField draws filled circles with interactive:false, scaled 16px gap and .6px radius. Native radial-gradient dots remain visible without JavaScript; resizing rebuilds the field and cleanup restores the fallback.

SVGO 4.1.0, explicit SVGOMG plugin configuration, multipass, numeric precision 2 / transform precision 8, xmlns and dimensions retained. Configuration/byte counts are in optimization.json. Archived dot source is retained only as reference. User approved inline SVG logos/connectors. No raster assets.

## Motion

Root [data-dynamic-transaction-switching], heartbeat [data-dts-heartbeat], eight pulse paths [data-dts-pulse], ready [data-dts-ready]. Source dynamic-transaction-switching.js imports Animation Stage and canonical Path Pulse; both shared entries and Vite multi-entry register it. No deployed external appearance CSS.

Only the whole central Stitch box scales. Exact 3DS heartbeat offsets 0/.1/.22/.32/.48/1, scale 1/1.055/1/1.035/1/1, period default duration × 2.4. Tokens verified in live Global Styles: --motion-ease-primary cubic-bezier(.11,.61,.27,.99), --motion-duration-default 770ms. Runtime resolves tokens per instance; unavailable values preserve static design. Eight peripheral boxes have no motion, reveal or hover.

Cardinal pulses start together behind the center box at (270,139). Left/right continue through the opaque side boxes to their center junctions 161 design units away, then split upward/downward together. Canonical pulse speed 72 units/s, span 40 units. Branch start 161/72 seconds; next center wave waits until the longest branch and tail finish, plus .6s (period about 4.607s). Fixed period is an optional extension to Path Pulse; old random-gap behavior remains the default. Travel is linear. Pulses inherit exact visible source spatial alpha ramps, including .2 faint branch opacity, using gradients with stops placed at the Figma connector ends. Only pulse color changes to the canonical blue. Static connectors and pulses share foreground z-index 2 above outer boxes; the center stays at z-index 3. Endpoint centers align to outer box border centers at (153.5,139), (386.5,139), (270,50.5), (270,227.5); side branches end at y=51.5/225.5.

One Animation Stage clock per instance owns heartbeat and pulses: .1 visibility threshold, hidden-tab/offscreen pause, reduced-motion restoration, resize-safe vector coordinates, duplicate guard, cleanup and partial setup rollback. Cleanup restores static transforms/styles and removes generated gradients.

## Verification and completion

Local /dynamic-transaction-switching.html: browser verified nine boxes/eight pulses, fixed outer boxes, heartbeat, cloned gradients, phase-locked repeat, reduced motion, two independent 540/270 parents, unique connector IDs, 320 viewport, offscreen pause, duplicate mount/disposal/remount, injected path setup failure and JS-disabled fallback; no browser errors. Browser script scripts/verify-dynamic-transaction-switching-browser.mjs accepts PLAYWRIGHT_MODULE / BROWSER_EXECUTABLE overrides. Builder scripts/build-dynamic-transaction-switching-preview.py is local-only; native preview CSS is never imported by the deployed runtime.

Webflow Designer visually verified at 464.75-wide desktop frame and 345-wide mobile frame, 239.26/177.61 heights, proper component logos and restored gradients. Draft indicator remains visible. Local preview asset wrappers reflect Figma assets; native component variants may differ slightly in source viewBox (MasterCard) while preserving existing component geometry.

All 118 tests passed after adding schedule/heartbeat and Path Pulse period regressions. Full shared Vite build in /tmp/dts-shared-build passed; check-shared-release verified both loaders retain Product Variety/wallet swap and Country Flags with complete dependencies. No fresh release dist generated in tracked dist, no GitHub merge/push, no channel activation, and no Webflow publication.

Completion: static illustration saved to Webflow draft; animation implemented and verified locally. Playground Preview motion remains pending an authorized staging release because the permanent staging loader does not yet include this new module. Request staging authorization before merge/channel activation; never publish Playground.

Revision verification (2026-10-09): all eight native outer boxes compute the same solid #EAECF0 border, gradient fill, radius and full opacity at desktop and mobile. Native dot SVG count is zero; filled Dots Field canvas uses the shared effect. Connector z-index is 2 above outer wrappers at 1; the Stitch wrapper stays at 3. Local browser checks and all 118 tests pass. Shared build verified both loaders preserve Product Variety/wallet swap and Country Flags. Webflow remains Draft; no staging channel activation or publication occurred.
