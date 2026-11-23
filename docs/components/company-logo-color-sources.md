# Company logo color sources

Figma preparation on 2026-11-20, file `PCbd0DyXWAD2cDANtl7bpH`, target `702:159` (Company logos — Original colors). Only this duplicate frame was edited; the original gray strip and Webflow/CMS remain unchanged.

The target has 19 visible companies: all 19 restored to original colors. All 27 outer cells are named `holder` and retain 150 × 48 geometry. Logo artwork carries the company name; row containers have descriptive names. Third-row duplicate artwork, including Surge, retains its original zero opacity. Getsabiq retains its original wordmark in black; the user explicitly requested reverting the temporary 2M replacement. All logo artwork must remain vector. Bitmaps are color references only.

## Sources

- Viva Finance: original source component `608:8448`; its green and magenta paints restored onto the existing short Viva wordmark geometry, without adding the source's Finance suffix.
- Peko: original source component `608:8560`.
- Yanal Finance: original source component `608:8138`.
- Muhlah: original source component `608:8689`.
- Tanmeya Capital: original source component `608:8068`.
- Zand: original source component `608:7078`.
- Tiqmo: original source component `608:7917`.
- Algo: original source component `608:8619`.
- Tamam: https://tamamfinance.sa/Assets/ContentPhotos/Photos/logo-english-final_211117.svg — original paths, tight SVG viewBox.
- Foodics: https://www.foodics.com/wp-content/uploads/2021/12/foodics-logo.svg — current official charcoal wordmark.
- Sakhi: inline logo on https://sakhi.com/en — verified solid `#00200F` applied to existing vector artwork.
- Noqodi: original SVG from https://www.noqodi.com/assets/images/logo/noqodi-logo.svg; blue verified from embedded logo in https://www.noqodi.com/assets/docs/noqodiTerms%26ConditonsMerchant.pdf. The website SVG is white for dark backgrounds; the strip uses the PDF logo's blue.
- Khazna: https://khazna.app/assets/svgs/logo.svg.
- Comera: original vector `698:10293` restored; gradient sampled from https://www.mycomera.com/images/mycomera-logo.png, black wordmark.
- DES Financing Corporation: original vector `698:10323` restored, blue sampled from https://desfinancing.ph/wp-content/uploads/2023/06/DES_logo.png. The user supplied a two-tone symbol reference on 2026-11-20. Strong blue `#004AE8` and light blue `#8CAEFF` now reproduce the weave. At the user’s explicit redraw request, the woven symbol was rebuilt on one isometric lattice as two non-overlapping, stroke-free vector regions with straight edges. The prior original-silhouette clipping and colored overlays were removed because they left dark slivers at extreme zoom. Width 18.48px, height 21px; exact polygon partition checks report zero overlap and zero uncovered area. Original DES lettering paths remain intact. Both visible and zero-opacity duplicate instances are updated. Final 30× symbol screenshot verifies clean joins; no masks, IMAGE fills, underlying blue silhouette or strokes.
- Index Exchange: original vector `698:10385` restored; yellow circle and navy wordmark sampled from https://www.indexexchange.ae/assets/index/img/indexlogo.webp.
- Getsabiq: original vector group `698:10320` restored and painted black per user direction. No 2M artwork remains in the target.
- Masar Alnumou Finance: original vector `698:10388` restored; navy and cyan applied by vector region using https://raseen.sa/wp-content/uploads/2026/09/%D9%85%D8%B3%D8%A7%D8%B1-%D8%A7%D9%84%D9%86%D9%85%D9%88.jpg as the color reference.
- Loan Financing: user supplied a color reference on 2026-11-20 (`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJnlCndm0itNMDT3Xnfl8-xsRGyS6z0V5Or2P59Z4Gbw&s=10`). Existing editable bilingual vector geometry retained; lettering restored to black and original gradient alpha/direction retained with purple sampled from the reference (`#6140C2`). Thumbnail compression means the sampled purple is approximate, not an authoritative brand specification. Visible and zero-opacity duplicate artwork renamed Loan Financing.

## Verification and limits

Final screenshot checked at 1.5× with all 19 visible logo positions present, colors restored for all 19 companies, and all 27 cell names checked. All five temporary bitmap replacements were removed on user correction. Comera, Masar, Index Exchange, DES, and Getsabiq use original vectors cloned from the untouched source strip `698:10231`. Original vector geometry is retained except for the explicitly authorized clean geometric redraw of the DES symbol. Final scoped audit returned zero IMAGE fills, with a fresh screenshot confirming appearance. No generated or traced logos. Appearance is a Figma preparation only; this does not implement automatic logo sizing, migrate Companies CMS fields, create the quote component, or publish any site changes.


## Export and CMS handoff — 2026-11-20

All 19 approved vector marks from frame `702:159` were exported individually,
tightly cropped, and optimized as lowercase hyphenated SVGs. Original exports
remain alongside delivery files in `src/embeds/assets/company-logos/`. The SVG
manifest records the exact export IDs, bounds, precision, and comparisons.
Total delivery size is 63,607 bytes (original exports 174,679 bytes).

Companies CMS logos and display names now match these approved marks in all four
locales; existing slugs were preserved. Masar was added as a draft. See
`docs/components/trusted-logos-cms.md` for saved state, sizing rules, and verification
limits. No Webflow publication occurred.
