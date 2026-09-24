# Collections — Window Stack

Webflow component: **Animations → Collections — Window Stack**
Component ID: `88e6f662-b5ee-3682-da72-a4d510d4cfc9`.
Placed on the draft **Animations Playground**, beside Financial Architecture.
Only the graphic is included; no full content card was built or changed.

Figma source: Stitch Animation Elements, graphic `256:12908`, reference card
`256:12907`. The graphic is 258 × 232. The original raster source windows are
native Webflow Image elements, using permanent managed Webflow assets. The
image contents are not editable form fields.

- Attach document: 288 × 201, initially at (73, 71).
- Reassign collection record: 289 × 244, initially at (24, 23).
- Native layout classes scale proportionally to the graphic container.
- Right and bottom white fades match the Figma graphic.
- Reveal at 25% visibility, 900ms with a 100ms stagger; hold 1600ms.
- Front window exits bottom-right in 850ms as the rear moves forward.
- Outgoing window returns behind in 550ms; hold 3500ms and repeat.
- No floating. Offscreen/hidden-tab pause and static reduced-motion fallback.

The hidden HTML Embed travels with the component. Rebuild its JavaScript with
`node scripts/build-collections-embed.mjs`; output is
`dist/embeds/collections-graphic.html`. Layout CSS is mirrored in
`src/embeds/collections-graphic.css` but maintained as native Webflow styles.
Source images are saved in `src/embeds/assets/collections/`.

Verified in Webflow Preview on desktop and at 393px mobile: 258 × 232 stage,
loaded original assets, correct window dimensions, and alternating front/back
positions. Saved as draft without publishing.
