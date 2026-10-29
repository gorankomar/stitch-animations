# Orbit Graphic

Reusable orbit illustration, saved to the Animations Playground Webflow draft on 2026-10-29. No page publication or animation-channel activation was requested/performed.

- Figma sizing reference: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=47-3616 (258 × 232). The user's existing icons, Gradient dots, and pedestal artwork were retained; this task does not substitute the bank logos from the example.
- Site: `6823036cd77b3093eaf9154d`; Playground page: `6ab4079ac7ca32e3a6c168c8` (must remain Draft).
- Component: **Orbit Graphic**, `16223460-70a1-261a-11ee-e3b3155ed40f`.
- Playground instance: `1bda6a98-0db6-6022-8542-ba33a59edb0f`.
- **Dots** slot: `c1765618-a757-b70a-6e56-7be4dc24498d`. Its sample contains nine **Dot** instances, each with its existing **Icon** slot. Add/remove/reorder Dot components in Dots and replace icons in Icon. New Orbit Graphic instances can start with an empty slot.
- Existing **Dot** component: `37d37e47-510c-d42d-c530-680a119b55b1`, group Orbit. Its Gradient/White variants and internal appearance were preserved. White still overrides `orbit-dot_icon_inner` to white/no background image. No shared Dot definition or global orbit class was changed.

## Structure and style ownership

`orbit-graphic` is the measuring root and maintains 258:232. Its inner `orbit-graphic-wrap` owns coordinates/clipping; three native `orbit-graphic-ring` elements, a pedestal and the **Dots** slot are direct children. The slot supplies the one layer needed for editable component content. Runtime `.orbit_dot_inner` supplies the independent pop scale without changing the existing Dot component definition.

The component uses isolated `orbit-graphic-*` native Webflow classes for supported base geometry. The existing Home orbit's classes are untouched. A style-only embed inside Orbit Graphic (`16223460-70a1-261a-11ee-e3b3155ed431`) carries unsupported custom properties, ring pseudo-elements/indices, context sizing for slotted instances, static sibling placement, and attribute-selected pedestal paint. Canonical exception CSS: `src/embeds/orbit-graphic/orbit-graphic.css`. Do not reintroduce the old unscoped CSS embed.

All responsive dimensions use the parent width; no viewport-height units or fixed minimum Dot/pedestal sizes apply to this component. At 258px the Dot diameter is 28px; ring diameters are 132/232/332px with their common center at (129,192). Nine dots use 2/4/3 allocation from inner to outer ring, matching the reference's overall arrangement. Other counts use the existing general allocation and recompute their arcs within safe horizontal bounds. Arbitrarily large counts can naturally become crowded.

The nine sample dots have visible CSS resting positions with JavaScript unavailable. Additional dots remain visible in a fallback row until the module allocates them to rings. No essential content has a saved hidden/pending state. Native classes plus the in-component style embed carry the design; `preview.css` is local-only and must never be deployed as the visual source of truth.

## Motion

Source: `src/animations/orbit/index.js`; entry: `src/entry/feature-orbit.js`, also already registered by shared page loaders. Both the legacy selectors and the new isolated classes are supported.

Pointer Follow mounts after the first valid layout, before entrance animation starts. It opts into the canonical helper's `independentTranslate` mode: follow owns the CSS individual `translate` property, leaving ring entrance `transform`, Dot path `left/top`, and inner pop `transform` independent. Other Pointer Follow consumers retain transform-based behavior by default. `isEnabled` pauses the follow clock while the orbit is offscreen or the document is hidden.

Global Styles motion defaults were read directly from component `ab488b17-f25a-fbf8-5f54-4a3955eb57e5`, embed `489deebb-81c3-5d09-471d-1439e300992d`: primary `cubic-bezier(.11, .61, .27, .99)`, normal `770ms`, fast `calc(var(--motion-duration-default) * 0.6)`. Entrance/ripple timings inherit the normal token using ratios that retain the established pop-in rhythm. Non-opacity tracks use the primary curve; ring opacity has a separate linear track. Dot pop opacity remains constant.

Untransformed CSS dimensions/offsets determine ring placement even during scale/follow. Resize interrupts the old entrance and immediately settles the newly measured composition. Reduced motion skips entrance, follow and ripple. Offscreen/hidden activity pauses animation clocks. Mounting supports multiple instances, avoids duplicate setup, and returns a disposer that cancels frames/observers/animations/listeners and restores the native fallback. Partial animation setup failure also restores fallback.

## Verification and current delivery state

- Webflow Designer draft inspected visually with all nine editable dots; component instance shows **Dots — Content: 9 elements**. Native mobile canvas also verified at a 393px viewport (345px parent, 310.23px frame height and 37.44px Dot); desktop restored afterward. Draft status retained. No shared/global class edits were applied; an initial broad update was rejected by automatic review and replaced with isolated styles.
- Local review: `/orbit-graphic-preview.html`, 540px, 258px and 180px parents simultaneously, with correct proportional geometry and no console errors.
- Pointer follow observed while ring opacity was below 1 and the Dot pop scale was still 0, proving overlap with the entrance.
- Tests: `tests/orbit.test.js` covers counts 1/2/9/12/20, untransformed geometry, early follow, visibility pause, resize, reduced motion, duplicate mounts, teardown and partial failure. `tests/follow-group.test.js` covers independent transforms, pause/resume and unchanged default consumers.
- Full `npm test`: 223/223 passed. Local single-entry build verified. Shared distribution files were restored afterward; this is preparation, not a release build.

The updated motion remains local. The permanent Playground loader cannot use it until an authorized staging release merges the source and activates the staging channel. The new isolated wrap selector intentionally leaves the saved draft static with the currently deployed older orbit module; do not add an inline/duplicate runtime to bypass release staging. Production is unchanged.


## Replay correction — 2026-10-29

The user's recording confirmed the intended order: rings grow in first, dots pop at the top of their own rings, then travel along those arcs to their final positions. The resize observer's mandatory initial notification on each mount/replay was settling the entire entrance prematurely. Resize handling now compares the wrap's untransformed client dimensions and interrupts motion only for a genuine size change. Repeated replay retains the complete entrance; actual resize still settles the resized composition immediately. Arc paths use 48 segments to remain visually on the rings during travel. Scaling, slot contents, existing Dot styling and immediate pointer follow remain unchanged.

Regression coverage includes the initial resize notification on three successive replay cycles. Browser verification captured the full rings → dot pop → arc travel sequence after clicking Replay entrance. This correction is local; staging and production remain unchanged.

## Compact / Landscape and ring-count property — 2026-10-29

The existing base variant is now named **Compact** (258:232). The new **Landscape** variant (`9ca0466f-42cf-4c7e-8753-3cbdd1e476f2`) uses a native 564:276 aspect-ratio override on the main `orbit-graphic` class. Figma format reference: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=46-3567 . Existing editable Dot and Icon components remain the artwork source; this is a format variation, not a new set of vector assets.

Landscape uses a common center at (282,221), ring radii 98.5–210.795px, 44px dots, and 54/70/102px pedestal layers at a 564px parent. For nine dots and three rings its inner-to-outer allocation is 2/3/4, with the reference's wider endpoint angles; Compact retains 2/4/3. All dimensions remain proportional to the component's own parent width. The Landscape sample is instance `0383a9d3-7164-f986-4154-64855bc0f2d9`, Navigator label **Orbit Graphic — Landscape**, appended directly to Features Wrapper.

**Number of rings** is a native integer component property (`5a2a1ee9-4199-40c7-9c42-5b5c026c7372`), default **3**, minimum **1**, maximum **6**, decimals **0**. Its tooltip is: “Choose 1–6 rings. Default: 3. Dots automatically redistribute across the visible rings.” It binds to the root `data-orbit-rings` attribute, preserving the existing animation/follow attributes.

Six ring elements are prepared in the component definition. Scoped CSS shows only the selected count and distributes those circles over the existing inner/outer radius range. With one ring, that ring uses the outer radius to provide room for the dots. Motion allocates dots only to selected rings. Attribute/variant changes refresh geometry; invalid external numeric input is normalized to an integer between 1 and 6, with invalid/missing input defaulting to 3.

`ring-count-fallback.css` carries the static nine-dot arrangement for both formats and every count, plus native-ring visibility rules. It is generated by `node scripts/build-orbit-fallback-css.mjs` from the motion module's allocation and angle helpers. The component's style-only embed includes both `orbit-graphic.css` and `ring-count-fallback.css` inline; do not link local preview CSS from Webflow. Local markup and `/orbit-graphic-preview.html` include all six prepared rings and a review-only ring-count input.

Verified in native Webflow Designer at counts 1/3/6; sample restored to 3. Compact/Landscape side-by-side local review verified parent widths 258px and 564px, with Landscape also at 258px. Tests compare all twelve nine-dot static configurations against runtime geometry, plus property default/clamping and reference allocation. Reveal, replay and immediate Pointer Follow are preserved. The draft is saved; animation changes remain local pending authorized staging, and nothing is published.

Final verification: 223/223 tests and isolated Orbit build passed. Native Landscape mobile canvas measured 345 × 169px with three visible rings; desktop was restored. Both Playground samples end with three rings.

## Intermittent dot flash on replay — 2026-10-29

A completed animation can have its promise callback queued while a new replay is already resetting the same DOM. Old entrance completion callbacks now check that their controller and tracked animation are still current before committing styles. Delayed Dot path/scale animations use backwards-and-forwards fill so the pre-entry state stays in force for the entire delay. Ripple completion no longer clears the shared inner transform asynchronously. This preserves the pop, arc paths, immediate follow, geometry and timing.

A regression test first reproduced the stale completion revealing dots at the next replay's starting point, then passed with the ownership check. Six consecutive interrupted browser replays showed zero prematurely visible dots in both Landscape preview sizes and no console errors. The fix remains local pending staging.

## Landscape spacing refinement — 2026-10-29

At the user's clarification, tighten the complete nine-dot Landscape arrangement, rather than moving only the two endpoints. Scale every dot's angular offset from the top of its ring by 0.9: inner angles -127.8/-52.2°, middle -135.9/-90/-44.1°, outer -158.4/-117/-63/-21.6°. This reduces spacing consistently by 10% along each arc and keeps endpoint dots away from the ring's tapered ends. Compact, component appearance and timing remain unchanged. Runtime, static fallbacks, saved Webflow draft embed and localhost markup are synchronized. The 15 relevant motion/geometry tests pass, including static/runtime alignment across formats and counts. Browser review checked both Landscape widths. Motion remains local pending staging.
