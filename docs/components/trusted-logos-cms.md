# Logos – Trusted by (CMS)

The Home instance is directly below Logos - Trusted by. Home instance ID is
`412e43c1-9730-9b77-352c-762464539751`. The comparison uses a separate
component definition and the original retains its two existing tracks.

## Content and assets

The Companies collection uses the built-in Name and Slug fields, a required
Logo image, a Show in Trusted by switch, and required integer Display order.
The dynamic list filters the switch to Is on and sorts by Display order ascending.
The image source is Logo and the image alt text binds to Name. All 18 English
items were initially saved as drafts with the switch on and display order 10–180.
The published staging homepage now renders all 18 through the native list.

Logo order follows the first two rows of Figma node `698:10231`. The third row
duplicates the second. At positions 90, 100, and 120, the artwork reads Zand,
Comera, and Sakhi, respectively. These names and slugs replace the older Figma
layer names. The CMS filename matches the corresponding slug.

The originals and derivatives are in `src/embeds/assets/trusted-logos`. SVGO
4.1.0 used multipass, numeric precision 2, and transform precision 8 on the
convertPathData and convertTransform plugins. The plugin list was preset-default
with those overrides, removeDimensions, and sortAttrs. The root XML namespace
and 150 × 48 viewBox were retained. The full set is 50,313 bytes after
optimization, down from 151,055 bytes. Original and optimized art were visually
compared in Chromium at the 150 × 48 slot size.

## Structure and logo color

The component uses `trusted-logos-section` with the shared page gutters,
container width, section spacing and side borders. Inside the layout the
`trusted-logos-heading`, `trusted-logos-viewport`, and
`trusted-logos-motion` embed are siblings. The heading owns its center
alignment, width, and spacing. There is no separate heading wrapper chain.
The CMS list retains its required native track and item layers, named
`trusted-logos-track`, `trusted-logos-item`, `trusted-logos-image`, and
`trusted-logos-empty` for the empty state. The original homepage component
uses its existing structure.

The **Logo color** component property sets the viewport's native CSS color.
The image filter uses `currentColor` to paint the SVG's silhouette. The
image is shifted up one slot and its zero-blur, offset shadow occupies the
original position. The item clips the source image. This keeps the SVGs
as native CMS images and makes the tint visible without marquee JavaScript.

| Variant | Webflow color source |
| --- | --- |
| Base | Equal mix of Neutral and Neutral Light, currently #888 |
| Light gray | Neutral Light mixed with 41.176% Neutral Lighter, currently #B8B8B8 |
| Almost black | Neutral Darker, currently #222 |
| Fire Orange | Fire Orange, currently #FF3609 |

The gray mixes preserve the existing shades and update when their source
variables change. No variant uses a calculated brightness or hue filter.

## Motion and verification

The component-local marquee runtime is mirrored by
`src/embeds/trusted-logos-preview.html`. The list moves by one sequence width
at about 4.9 rem/s. It adds only enough inert, assistive-technology-hidden
copies to cover the viewport at the wrap and pauses offscreen or in hidden
tabs. The native list scrolls horizontally when the script is absent or
reduced motion is requested.

Designer verified all four tints and the 18 native Company items after
reparenting. Desktop and mobile measurements match the title typography,
spacing and logo slot dimensions. Webflow Preview showed the CMS images
with the current tint, but did not run the updated inline marquee. Chromium
verified the same runtime locally with the full list, a three-item list
and a script-free fallback. The Webflow changes are saved without publishing.

`npm run dev` serves `/trusted-logos.html`. Add
`?color=fire-orange`, `?color=almost-black`, or `?color=light-gray` to test a
variant, and `short` or `static` parameters to test fewer items or no script.


## Tight original-color assets and sizing — 2026-11-20

The approved Figma frame `702:159` supplies all 19 vector logos. Original exports,
tight pre-optimization SVGs, and delivery SVGs are preserved under
`src/embeds/assets/company-logos/`. Delivery names use lowercase words and hyphens.
SVGO 4.1.0 reduced the total from 174,679 to 63,607 bytes; renderer comparisons and
`manifest.json` record settings, tight bounds, and error measurements. No delivery
SVG contains bitmap artwork. DES retains precision 4 to preserve its approved joins.

The Companies collection `6afed0713e5072e11bbc7cfd` now has 19 companies across
four locales (76 localized entries). All original 18 company logos and display names
were updated in staged content. Every existing slug was checked against
`cms-before.json` and retained, including `loans`, `index`, and `tanmeya`.
Masar Alnumou Finance was missing and was created as draft item
`6b003a40c19f0e876c16337a`, slug `masar-alnumou-finance`, display order 190,
Show in Trusted by enabled. Its four localized entries have the same approved logo.
`cms-after.json` records saved state. All 19 CMS CDN responses matched delivery files
byte-for-byte. Uploaded site assets are recorded in `uploaded-assets.json`.

The existing component embed (only class `hide`) is named
**Styles, logo sizing & marquee**. It retains the existing motion and four tint
variants. Full-color source assets remain reusable elsewhere; the strip continues
to tint silhouettes with `currentColor`.

Each holder remains 150 × 48 CSS px. Given tight image ratio r, artwork height is
clamp(15, 34 / sqrt(r), 38) px; width follows the original ratio, then both dimensions
scale down together if width exceeds 111 px. Values are stored in rem. This makes
tall marks approach the holder height and wide wordmarks approach the width limit
without company-name exceptions. The fixed tint offset is 3rem, independent of
artwork height. Delayed image loading applies sizing before refreshing clones.
Without script, intrinsic SVG dimensions and the same maximum bounds give a
proportional fallback rather than a fixed image rectangle.

Validation: two focused sizing tests pass. Local Chromium checks at 1280px and
390px loaded all 19 assets, preserved clone dimensions and tint, and produced no
mobile document overflow. Script-free fallback was checked separately. Webflow
Preview showed the new CMS names/assets and proportional fallback; it did not run
the inline sizing/marquee runtime, matching the earlier preview limitation.
Automatic sizing and motion are therefore locally verified, not published-site
verified. Masar and the previously draft Viva item remain drafts; other updated
items are queued for the next authorized publication. Nothing was published.

Download bundle: `deliverables/company-logos/company-logos-tight-svg.zip`.
Webflow preview evidence: `deliverables/company-logos/webflow-preview.jpg`.


### Optical corrections and native Designer layout — 2026-11-20

User review requested substantially larger Viva and slightly larger Tanmeya. The
strip now sets Viva Finance to 105px wide and Tanmeya Capital to 90px wide, keeping
the tight aspect ratio. Component-scoped CSS selects their SVG filename suffixes
and overrides the general computed sizes. All other optical sizing stays unchanged.

Designer does not apply the embed rules, so the item now owns native 48px height
and flex centering. The native image class uses auto width/height, 111px max width,
38px max height, auto aspect ratio, and the fixed -48px tint transform. Native
styles and the existing currentColor filter preserve all tint variants.
The two SVG roots also use 105px/90px intrinsic widths with proportional heights;
their viewBoxes, paths, colors and tight crops are unchanged. The corrected files
were uploaded and assigned in all four CMS locales (eight updates), without any
name, slug or publication-status changes. The download ZIP includes the corrections.

Verified in Webflow Designer at the 1328px canvas: Viva 104.98 × 27.80px,
Tanmeya 89.98 × 25.17px, centered in their existing holders. Screenshot:
`deliverables/company-logos/designer-corrected.jpg`. Local animated originals and
clones both measure 105px and 90px wide; 390px mobile viewport has no document
overflow and all images load. Saved CMS corrections are recorded in
`src/embeds/assets/company-logos/cms-optical-corrections.json`. No publication.


### Viva refinement and original colors — 2026-11-20

Viva is reduced from 105px to 100px wide, in the strip CSS and its SVG intrinsic
dimensions. The updated asset is assigned in all four CMS locales; paths, viewBox,
colors and crop are unchanged. Tanmeya remains 90px.

Added **Original colors** variant `4ce10b4b-3532-0d5f-08ef-a92d1fb214ff`. Its native
`trusted-logos-image` style sets filter:none and transform:none so the actual SVG
occupies the holder. The tint filter/offset are now owned exclusively by native
Webflow styles, with no embed declarations overriding variant styles. Existing
four tint variants keep their filter and offset. Local preview option:
`/trusted-logos.html?color=original-colors`. No publication.

Designer verification: selecting Original colors rendered the colored artwork with
computed filter:none / transform:none, and Viva measured 99.97px wide. Switching
back to Base restored the gray drop-shadow and -48px offset. The Home instance
was returned to its original Base selection. Screenshot:
`deliverables/company-logos/original-colors-designer.jpg`.


### Viva matched to Peko — 2026-11-20

User requested equal visible heights instead of another small width reduction.
Viva's intrinsic height now matches Peko's 16.13px Designer height, giving Viva
approximately 60.9px width. Designer measured Viva 16.12px and Peko 16.13px tall.
The runtime assigns Viva Peko's approximately 19.23px optical height rather than
using Viva's heavier generic-ratio result. The former fixed-width Viva CSS override
is removed. Updated SVG assigned across four locales; ZIP refreshed. Nothing
published by this chat. Screenshot: `deliverables/company-logos/viva-peko-matched.jpg`.

## Quote logo aliases

The Companies collection has an optional plain text **Alias** field. The
Components page's hidden Companies list exposes it as `data-company-alias`
alongside the existing Name and Logo bindings. The Quote component checks the
normalized full Name first, then a unique exact Alias, then a unique prefix
across both fields. The Company text entered on the quote is still shown as entered.

Andreessen Horowitz was saved as English draft `6b020022182a98ac11c36240`
with Alias `A16Z`, slug `andreessen-horowitz-a16z`, Show in Trusted by off,
and required Display order set to 0 like the existing non-strip Stitch entry.
The official wordmark from the Andreessen Horowitz site is preserved in
`original/andreessen-horowitz-a16z.svg`. The delivery SVG uses the explicit
plugin set in the company logo manifest with SVGO 4.1.0, multipass on, numeric
precision 2 and transform precision 8. It retains the original viewBox and
XML namespace and was reduced from 6,206 to 5,189 bytes. The Quote embed and
Components list binding were saved in Webflow without publishing.

## In-place CMS tint

The local embed now keeps each native CMS image inside its slot even before JavaScript runs. Tinted variants use a per-viewport SVG filter that composites the native currentColor over the image alpha. Original colors bypasses the filter. The animation still changes only the track transform, and image load events now coalesce marquee rebuilds.
