# Instant Virtual Cards

Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=386-1984 (540 × 278).
Webflow: Animations / Instant Virtual Cards, component `063c691e-3b6e-774e-174a-fe2de9101afd`; site `6823036cd77b3093eaf9154d`, Animations Playground page `6ab4079ac7ca32e3a6c168c8`.

## Structure and appearance

Root `[data-instant-virtual-cards]` is a native width-query container. `.ivc-frame` retains 540:278; frame-relative positions, cqi text/padding/radii/shadows and toggle slots scale from its parent's width. Webflow native styles own the complete illustration, including the cursor's existing Demo Cursor artwork. No external CSS or scoped style exception is required for this component. `instant-virtual-cards-native.css` records those native styles; `instant-virtual-cards-preview.css` and `instant-virtual-cards-preview-markup.html` are local snapshots of the existing components, never deployed as overrides.

Reuse Credit Card (`ddf5ec98-7371-1bc2-9e16-1f4ac115394a`) in Light and Dark Blue. Their supported Reveal and Rotate 4-digits props remain false. Preserve all internal artwork, spacing, typography and proportions. Their established height is slightly taller than the old Figma cards; do not flatten/restyle them to match that old card geometry. Current Stitch logo replaces the old logo as explicitly requested. No new Figma artwork is required.

Reuse Controls / Toggle (`dd46f6bb-40cd-61fe-26ed-dd16af40ed94`) with two new native variants: Small Inactive (`6d33b6ed-2ff0-ac4e-61ec-7cd7a7cc1f46`) and Small Active (`68174060-c1d7-47b9-5e20-0e9fe0a59faa`). At design size, the wrapper is 36 × 20 and proportional padding is 2; tracks are #e7e7e7/#121212 with a white thumb. Existing Inactive/Active variants retain their appearance. Runtime swaps only these supported variant classes and transient thumb movement, without illustration CSS changing component descendants.

Static fallback contains all four elements, active spending limit and `$3,650`. User's amount overrides Figma's `$3,600.50`. Text inherits the live site's Abcdiatype body font. Freeze card remains off. Cursor is decorative and hidden in the fallback.

## Motion

`instant-virtual-cards.js` exports `init(root = document)` and returns cleanup; WeakMap ownership guards repeated mounting and supports multiple instances.

Four outer `[data-ivc-reveal]` wrappers use shared Reveal's Hard mode, direction `right-to-left`: rear card, front card, Freeze card box, spending-limit box. Each takes one `--motion-duration-default` (live verified: 770ms). They start at 0, 340, 680 and 1020ms and overlap without opacity animation. The final arrival is at 1.79 seconds with current tokens; the cursor starts its original sequence immediately afterward. Hard Reveal uses the same reusable 340ms default. Shared track geometry places each element completely outside `.ivc-frame`, with proportional shadow clearance; it remeasures on resize.

The spending-limit box initially has the same height as Freeze card, with its toggle off and details collapsed. Demo Cursor emerges from behind the Dark Blue card after the fourth reveal and switches the limit on. The box grows and Value Counter advances from $0 to $3,650. The cursor moves 32 design pixels right and 38 down, stays visible there for exactly 1.5 seconds, returns to the same toggle and switches it off. It then moves diagonally in one straight segment to the resting point beneath the Dark Blue card while the box collapses. Stacking drops below the card just before crossing its right edge. Opacity stays 1 throughout the visit; no second entrance or intermediate fade occurs. After it is fully concealed, the sequence pauses for exactly 3 seconds before repeating the original entrance. The four object reveals run once. With current 770ms default tokens, the cursor cycle lasts 7.426 seconds. The amount resets only after collapse.

Translation, expansion, thumb movement and value interpolation use the live `--motion-ease-primary` (verified cubic-bezier(.11, .61, .27, .99)); cursor remains fully opaque and uses geometric card occlusion for entrance and final exit. Movement phases derive from the default-duration token; the explicit 1.5-second visible hold and 3-second concealed rest follow the user’s requested timing. Reveal owns outer transforms; Pointer Follow owns nested `.ivc-follow` wrappers; reusable cards own their internal layout.

Cataloged Pointer Follow is enabled only for fine-pointer hover and after both cards enter. Rear depth 0 uses strength .03/max travel 4 design pixels; front depth 1 uses .07/9. Travel scales with frame width. Visibility, hidden documents and reduced motion disable follow. Animation Stage pauses elapsed time offscreen and in hidden tabs. Reduced motion shows the fully enabled static state without a cursor. Missing tokens, setup failure, render failure and disposal preserve/restore the static composition.

## Delivery and verification

Local route: `/instant-virtual-cards.html` shows 540px and 320px parents at the same viewport. Build the draft-only portable runtime with `node scripts/build-instant-virtual-cards.mjs`. The draft runtime was removed at middle from HtmlEmbed `19d1d8d5-ae48-5459-7d5f-d904e1c17c70`. It uses the same Symbol mount guard as the registered shared feature.

Both shared page entries and Vite's shared build register this module. Middle uses the merged shared page loader alone; no component inline runtime remains.

2026-10-03: static Designer and Webflow Preview checked at desktop 630 × 324.33 and mobile 345 × 177.61. Local parents measured 540 × 278 and 320 × 164.73, with label font 10px/5.92593px. Preview pointer test measured rear translation 4.27/-4.05px versus front 9.62/-9.11px at the same pointer location. Custom-code-disabled Preview retained all four elements at opacity 1, transform none, and the full amount. Node tests cover four directions, opacity preservation, resize geometry, sequencing, cursor timing, reduced motion, duplicate ownership, offscreen pause, cleanup and setup failure. Full suite: 67 tests passing. Browser-level JS-disabled and reduced-motion emulation are not independently verified; lifecycle tests and custom-code-disabled Webflow Preview cover those fallback paths.

Current cursor sequence is one continuous visit per loop. Previous two-entrance, fade-out, and around-the-box exit variants are superseded.
