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

Four outer `[data-ivc-reveal]` wrappers use shared Reveal's Hard mode, direction `right-to-left`: rear card, front card, Freeze card box, spending-limit box. Each takes one `--motion-duration-default` (live verified: 770ms). They enter sequentially without opacity animation. Shared track geometry places each element completely outside `.ivc-frame`, with proportional shadow clearance; it remeasures on resize.

The spending-limit box initially has the same height as Freeze card, with its toggle off and details collapsed. Demo Cursor emerges from behind the Dark Blue credit card after the fourth reveal, targets the live toggle rectangle, presses it, then the box grows and Value Counter advances from $0 to $3,650. After the click, the cursor moves slightly down/right and fades out. The enabled amount holds, then the cursor emerges again to switch the toggle off, fades out with the same short movement, and the box collapses. The amount resets only after it is hidden. This control sequence repeats every eight default-duration units plus two explicit extra seconds (8.16 seconds with current tokens); the four entrance reveals run once.

Translation, expansion, thumb movement and value interpolation use the live `--motion-ease-primary` (verified cubic-bezier(.11, .61, .27, .99)); cursor enters fully opaque from behind the Dark Blue card; each exit moves 18 design pixels right and 14 down while fading linearly over half a default duration. Invisible repositioning preserves the original entrance on every loop. Movement phases derive from the default-duration token; the extra two-second rest is explicitly requested. Reveal owns outer transforms; Pointer Follow owns nested `.ivc-follow` wrappers; reusable cards own their internal layout.

Cataloged Pointer Follow is enabled only for fine-pointer hover and after both cards enter. Rear depth 0 uses strength .03/max travel 4 design pixels; front depth 1 uses .07/9. Travel scales with frame width. Visibility, hidden documents and reduced motion disable follow. Animation Stage pauses elapsed time offscreen and in hidden tabs. Reduced motion shows the fully enabled static state without a cursor. Missing tokens, setup failure, render failure and disposal preserve/restore the static composition.

## Delivery and verification

Local route: `/instant-virtual-cards.html` shows 540px and 320px parents at the same viewport. Build the draft-only portable runtime with `node scripts/build-instant-virtual-cards.mjs`. The draft runtime was removed at middle from HtmlEmbed `19d1d8d5-ae48-5459-7d5f-d904e1c17c70`. It uses the same Symbol mount guard as the registered shared feature.

Both shared page entries and Vite's shared build register this module. Middle uses the merged shared page loader alone; no component inline runtime remains.

2026-10-03: static Designer and Webflow Preview checked at desktop 630 × 324.33 and mobile 345 × 177.61. Local parents measured 540 × 278 and 320 × 164.73, with label font 10px/5.92593px. Preview pointer test measured rear translation 4.27/-4.05px versus front 9.62/-9.11px at the same pointer location. Custom-code-disabled Preview retained all four elements at opacity 1, transform none, and the full amount. Node tests cover four directions, opacity preservation, resize geometry, sequencing, cursor timing, reduced motion, duplicate ownership, offscreen pause, cleanup and setup failure. Full suite: 67 tests passing. Browser-level JS-disabled and reduced-motion emulation are not independently verified; lifecycle tests and custom-code-disabled Webflow Preview cover those fallback paths.

Cursor loop follow-up: the cursor also returns to click the toggle off at reset, remains visible through collapse, and exits before reappearing behind the box for the next count-up. Both clicks are verified across repeated cycles; 69 tests pass. Updated native Webflow draft runtime; no publication.

Final cursor exit: after each click, move only 18 design pixels right and 14 down while fading out linearly. Reposition behind the Dark Blue card while invisible, then repeat the original entrance. The loop has two added seconds of rest, one second longer than the preceding release. No path around or under the expanded box is used for the exit.
