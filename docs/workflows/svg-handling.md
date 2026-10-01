# SVG handling

Inputs: original SVG/Figma vector export, intended displayed size, parts that need motion or page-controlled styling, and delivery format if specified.

## Choose delivery before optimizing

When creating reusable SVG icon components in Webflow, expose **Stroke Weight** as an editable component property bound to the SVG `stroke-width` attribute. Preserve the original default stroke weight in SVG user units; child paths must inherit it rather than retain hardcoded overrides. Organize new reusable icon components under **SVG → Icons**. Use separate exported variants when the source geometry or default stroke differs; do not redraw supplied vectors.

Follow an explicitly requested format. Otherwise ask the user whether to use an inline SVG or an external SVG image, briefly recommending the appropriate choice and explaining why. Continue inspecting/exporting original assets while awaiting the answer; do not finalize format-dependent optimization or integration until answered.

| Intended use | Recommendation |
| --- | --- |
| Static illustration, logo, or repeated icon | External SVG via img; reusable URL and browser caching, smaller page markup. |
| Reveal, hover, pointer follow, rotation, or movement of the entire graphic | External SVG inside an animated HTML wrapper is sufficient. Whole-image animation does not require inlining. |
| Animate individual paths, strokes, fills, masks, or separate pieces; page CSS/JS must target internals | Inline the necessary SVG geometry. |
| Page-driven currentColor, CSS variables, or per-part styling | Inline SVG; an img does not expose internal elements to page CSS/JS. |
| Large composition with static artwork and a few moving vector parts | Recommend a static image plus inline animated overlay only when alignment can be verified; otherwise one inline SVG. |

A hosted SVG can contain its own animation, but the project's default for page-controlled internal animation is inline SVG. Use meaningful alt text for informative images, empty alt for decorative ones, and appropriate accessible naming/hidden state for inline graphics.

## Optimization settings: the user's SVGOMG process

Use [SVGO](https://github.com/svg/svgo), the optimizer behind [SVGOMG](https://jakearchibald.github.io/svgomg/), directly through a local CLI/API when available. The graphical interface remains useful for inspecting and comparing results.

- Multipass: **on**.
- Transform precision: **8**.
- Number precision: **2** by default; escalate to **3**, then **4** only when visual detail requires it. Do not use 0 or 1 by default.
- Enable all optimization features exposed by the selected SVGOMG version except **Remove XMLNS**, which stays **off**. Preserve/add the root xmlns="http://www.w3.org/2000/svg" for standalone assets; keep it for inline outputs too.
- Use an explicit, reviewed plugin list matching those SVGOMG features. “All features” does not mean blindly enabling every SVGO plugin; plugins that remove raster images, styles, or arbitrary attributes may change intended artwork. preset-default alone is not the complete SVGOMG feature selection.
- Record the SVGO version, explicit plugin configuration, numeric/transform precision, and any exceptions with the asset's component notes or optimization record. Confirm the installed version's parameter mapping: floatPrecision controls numeric rounding; transformPrecision must be configured for applicable transform/path plugins rather than assumed from a global precision option.

The existing country-flags optimizer predates this procedure and uses preset-default without explicit precision. Do not assume it implements this profile or rerun it automatically on existing assets. Update a component-specific optimizer when that component is deliberately revisited.

## Preserve the source and behavior

1. Keep the untouched original export. Optimize a derived file; never overwrite the only original. Do not rasterize or manually redraw supplied vector geometry.
2. Identify animation targets and references before optimization. Keep required pieces independently addressable. Keep viewBox/aspect ratio and necessary masks, clips, gradients, and filters intact.
3. For animation/theming/accessibility, disable only optimizations that remove required structure or information (for example mergePaths, collapseGroups, cleanupIds, removeHiddenElems, removeViewBox, removeTitle/removeDesc). Record each functional exception; do not let “all on” destroy animation targets or responsive behavior. Static assets may use more aggressive settings if comparison passes.
4. Add stable semantic animation hooks after optimization where practical. Namespace inline IDs per instance and update href, url(), mask/clip/filter/gradient, and accessibility references. Do not optimize away those hooks afterward.
5. Separate wrappers for layout, reveal, hover, pointer follow, and internal motion so transforms do not compete. Preserve a readable static/reduced-motion fallback.

## Compare and select precision

1. Generate precision 2 from the original using multipass and transform precision 8.
2. Render original and optimized side by side at the intended small/display size and desktop/mobile sizes, with identical backgrounds and scaling. Inspect fine detail enlarged as a secondary check; transparent artwork should also be checked on contrasting backgrounds.
3. Accept precision 2 when visually close enough for its actual use: roughly the user's “95% similar” judgment, with no noticeable damage to important details, clipping, colors, strokes, or shape. This is a human visual criterion, not a measured similarity score.
4. If differences matter, regenerate at precision 3 from the original and compare again. Use 4 only in rare cases where 3 still loses visible detail. Four decimals does not mathematically guarantee an identical image; verify it too.
5. If 4 still differs, inspect structural plugin effects and disable the responsible optimization, or retain the original. Do not trade obvious rendering damage for a smaller file.
6. Record original/optimized bytes, selected precision, comparison sizes, exceptions, and verification result. Select the lowest precision that passes visual review. If rendering cannot be inspected, label the candidate unverified rather than claiming similarity or completion.

## Integration verification and completion

Check desktop/mobile scaling, clipping, assets, reduced motion, and animation behavior. Render two inline instances to catch ID collisions and verify that target hooks survive. Compare important animation states as well as the static frame; hidden or off-canvas elements may become visible later.

Completion: preserved originals, visually verified optimized derivatives, documented settings, and user-selected delivery format. No upload, publication, bulk reoptimization, or change to existing assets is implied.

References: [SVGO configuration/API](https://github.com/svg/svgo), [transform precision](https://svgo.dev/docs/plugins/convertTransform/), [why standalone SVGs need XMLNS](https://svgo.dev/docs/plugins/removeXMLNS/).
