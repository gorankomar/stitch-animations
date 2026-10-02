# Figma illustration creation

Inputs: Figma selection URL, target Webflow component/page if known, requested completion stage, and explicit animation request if any.

## Defaults and destination

Create and verify every new illustration in the **Animations Playground** Webflow page (site `6823036cd77b3093eaf9154d`, page `6ab4079ac7ca32e3a6c168c8`). Create reusable components as needed and add requested animation there before inserting them into other pages. Save as a draft unless another completion stage is explicitly requested.

Use the body font family configured in Webflow for all illustration text. Do not copy the Figma illustration's font family. Preserve its proportional text metrics, hierarchy, and intended wrapping using the site's body font.

A request to create a graphic/illustration from a Figma link means **create it in Webflow and save a draft** unless the user specifies local-only work or another completion stage. Do not stop at a local mockup when Webflow creation is requested. Follow [publishing stages](publishing.md); a Figma link alone does not authorize staging/production publication.

**Static by default.** Do not add reveal, hover, pointer follow, idle loops, or other motion unless requested. Do not register a static graphic with the automatic data-anim reveal loader. If animation is requested, build and verify the static graphic first, then enhance it.

## Inspect and build the static design

1. Read the Figma design-to-code skill before requesting design context. Inspect the exact supplied selection, screenshot, design dimensions W × H, layers, text, fonts, vectors, masks/clipping, spacing, and colors. Preserve the supplied visual arrangement unless instructed otherwise.
2. Inspect the existing Webflow component/page and reuse appropriate native elements/classes/components. Keep text and editable structure native where practical; use assets for vector artwork rather than rebuilding vector geometry. Follow [SVG handling](svg-handling.md) for optimization and inline/image choice.
3. Build the complete static composition in native Webflow elements and styles. Its default visible state must match the supplied Figma selection, including text/content, positions, opacity, transforms, artwork, and layering. Do not depend on JavaScript to create essential artwork or populate fallback text.
4. Save and verify this static composition before adding requested motion. Record Figma URL/node, dimensions, component identity, sizing contract, assets, and special CSS in component notes.

For raster images within the supplied illustration, follow [raster image optimization](raster-image-optimization.md): export a PNG master and deliver a visually verified optimized WebP. Choose dimensions and compression from the image's maximum rendered size and content, including stronger compression for tiny photographic avatars.

## Fluid size and aspect ratio

The illustration scales as one composition with its parent's available width; height follows the original W/H aspect ratio. Do not stretch independently to fill mismatched width and height. If the parent constrains both dimensions, fit the composition within it while preserving its ratio rather than distort or crop it unless requested.

- Use a width:100% outer wrapper (min-width:0 where flex/grid requires it), with container-type:inline-size and horizontal writing mode. Keep layout padding/borders outside the measuring container so its content width matches the illustration frame.
- Give the inner frame the Figma aspect ratio W/H, width:100%, height:auto, and relative positioning. The query container is an ancestor of the cqi-scaled elements; an element cannot use itself as its own query container.
- Express frame-relative geometry, text sizes, line heights, padding, gaps, border widths/radii, shadows, and icon dimensions in cqi or appropriate proportional units. For a Figma length p at design width W, use (100 × p / W)cqi. Example: 16px at 400px width becomes 4cqi. Scale vertical lengths from the same width basis to preserve proportions.
- Percentages are appropriate when their containing block is explicit. Percentage top/height values reference frame height; derive them from H, not W. Unitless line height is appropriate when it preserves the design ratio.
- Avoid viewport units, fixed pixel typography, or independently clamped minimum sizes that break the composition at smaller parent widths. Use an explicit requested minimum size only with a verified small-container strategy.
- Ensure nested containers do not unintentionally change the cqi reference. Do not assume cqh measures this frame when only inline-size containment exists. Inline SVGs retain their viewBox and scale to their wrapper; SVG user-space coordinates need not be rewritten into cqi.
- Preserve Figma text content and wrapping through proportional text metrics and box sizes. Avoid clipping as a substitute for correct layout. Use overflow clipping only where the original design clips content.

## Where styles live

**Webflow is the source of truth for deployed visual styles.** Apply all supported base layout, typography, color, border, shadow, responsive sizing, and static/fallback styles directly in native Webflow styles.

If a needed property, selector, pseudo-element, keyframe, or other special CSS cannot be expressed through the available native Webflow controls, include only that CSS in a scoped style embed **inside the component/graphic**. For example, if the current controls cannot express container-type, supply that declaration locally in the component. The graphic must carry its own exceptions rather than rely on site-wide or CDN CSS for appearance.

Keep fallback-only scoped CSS in a **separate style-only HtmlEmbed** from animation scripts. Webflow Designer treats script-containing embeds as placeholders and may not render CSS placed in the same embed. Verify the actual Designer canvas as well as Preview; a working Preview does not prove the Designer fallback.

Local preview CSS is exclusively for local preview. Do not copy preview styles into a production embed, import them through the deployed loader, or use their successful rendering as proof that Webflow is styled. Recreate supported values in Webflow, then verify there. Existing repository styles/builders may predate this policy: update only the requested component, do not bulk migrate unrelated components.

JavaScript may set transient animation state (transforms, opacity, CSS variables). It must not be the only source of base styling. Required motion CSS that cannot be native belongs in the component's scoped embed; do not add deployed external CSS dependencies to new/revisited illustrations merely because the local preview imports them.

## Animation is progressive enhancement

For requested motion, follow [motion defaults](motion-defaults.md): the Global Styles primary curve for non-opacity properties and linear for opacity, with duration tokens from the same source.

The supplied Figma appearance is the fallback, not a blank entrance state. With JavaScript disabled or the shared loader/modules/CSS blocked, the illustration must remain fully styled and visible in that same appearance.

- Do not save permanent opacity:0, visibility:hidden, display:none, or off-frame entrance transforms on essential fallback content.
- Scope entrance hiding and other initial motion states to an instance-specific ready state set only after its required setup succeeds. Do not let generic data-reveal rules hide content before initialization; adapt the component's scoped selectors/markup rather than copying unsafe global rules.
- If partial initialization fails, remove the ready state, cancel work, and restore saved static transforms/opacities/content. Dispose/cleanup and reduced motion must restore/preserve the Figma fallback.
- For animated connectors or other generated geometry, retain the original static Figma geometry in markup. Keep it visible until the replacement is ready; restore it on failure. Do not make the only visible illustration depend on JS-generated SVG.
- Use separate wrappers for base layout and independent motion effects. Reuse [cataloged effects](../effects/index.md) only when requested and compatible with this fallback contract.

## Verification and completion

Compare Webflow against the supplied Figma selection at design size, small mobile width, intermediate width, and a larger width. Also place two instances in different-width parents at the same viewport: every layer and text size must scale with its own parent, keep the aspect ratio, and remain within the intended frame.

For requested animations, check normal motion, reduced motion, offscreen/hidden-tab behavior, resize, duplicate mounting, and disposal. Block the entry/module request and disable JavaScript separately; verify the complete Figma fallback. Check partial setup failure and unavailable external motion CSS as applicable. Native Webflow styles and in-component style embeds must carry the static design in all these cases.

Completion: report saved Webflow draft by default for illustration creation, or the explicitly requested stage. Record which styles are native versus scoped exceptions, parent-width checks, and fallback results. A local screenshot alone does not verify Webflow. Missing Webflow/Figma access must be reported as a blocker, not silently converted into local-only completion.

Technical references: [container query units](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries), [aspect ratio](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio).
