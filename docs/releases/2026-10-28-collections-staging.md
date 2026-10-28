# Collections native windows — staging animation verified

2026-10-28. User requested “push to stage”. Production was not authorized.

- Merged [PR #59](https://github.com/gorankomar/stitch-animations/pull/59), containing all chat-owned source, native markup/style references, local preview, tests, component notes and fresh distribution. Based on fetched current main `19c8a09899938bf65708967f768ffe91badae560`.
- Release SHA: `a2bb18cfa2215922e1c35091a59f2ab201a89fd9`.
- [Release workflow 40735801706](https://github.com/gorankomar/stitch-animations/actions/runs/40735801706), upload job `122983869382`: success. Full validation passed, 209 tests; Product Variety/wallet swap, Country Flags and dependency closure verified. 225 release files verified for staging bytes/MIME/CORS. Log confirms `Activated staging: a2bb18cfa2215922e1c35091a59f2ab201a89fd9; invalidation completed and served loader verified.`
- Previous staging SHA: `3c2bad01515b28163ccdff1f849fc1e9c68c731c`.
- Served staging pointer independently verified at `https://d280qq257tic0i.cloudfront.net/Stitch+Animations/channels/staging/page-all-lite.js`: HTTP 200, JavaScript MIME, `access-control-allow-origin: *` when requested with the staging Origin, `cache-control: no-cache,max-age=0,must-revalidate`. Served `feature-collections-graphic.js` exactly matches the validated local file.
- Production remains `85540b314d5e83b9c19f8499601a706c1a48f009`, independently read after staging activation.

## Webflow and browser verification

Site `6823036cd77b3093eaf9154d`; component `88e6f662-b5ee-3682-da72-a4d510d4cfc9`. Its two instances are on Animations Playground (`6ab4079ac7ca32e3a6c168c8`) and Loans (`68397e62ee3f9429c194bbc7`). Playground was confirmed `draft:true` before release. Its saved footer was read in Page Settings and retains the permanent environment router; no router changes were made. Published staging Loans HTML before publication also contains the permanent environment router.

After served release verification, removed only temporary motion HtmlEmbed `88e6f662-b5ee-3682-da72-a4d510d4cfce`. Native markup, styles, style-only RTL HtmlEmbed `7b0089a5-e80b-f063-0cd1-9f7bddc0c601` and unrelated code remain.

Fresh enabled-custom-code Playground Preview has one permanent staging `stitch-code-page-loader`, zero script elements inside Collections and zero raster images. Native window transforms progress through reveal/hold/swap with both windows taking the front slot, proving execution through the shared release. Desktop and mobile verified; mobile graphic measures 345 × 310.2265625 (258:232). Product Variety is motion-ready and its wallet swap produces opposing offsets on pointer entry. All three Country Flags tracks retain three sequences and advance between samples. Reduced motion, visibility, cleanup/remount and render failure are covered by the focused lifecycle tests; OS reduced-motion settings were not altered.

## Webflow staging publication verified

Single-page publishing initially failed (HTTP 400 `Invalid parameter: pageId`). The Designer's available site-wide action would include other pending non-draft changes. The user explicitly approved **“Publish all pending changes to staging”** before publication.

Published the site to `stitch-website.webflow.io` only with `customDomains:[]`; publish task `ba080c9a-11ad-4f3a-80cf-d8fd1432d140`, scope `site`. No production domains were selected. Animations Playground and Platform Screens remain `draft:true` after publication, confirming their exclusion.

Live https://stitch-website.webflow.io/loan-management-software was fetched after publication: two `collections-native-window` nodes, zero former Collections inline runtime, and one permanent router. Browser reload confirms zero image/script children in the graphic and one permanent staging loader. Transforms advance through reveal/hold/swap; both Attach and Reassign appear in front at different times. Desktop graphic measures 275 × 247.28125; mobile viewport 390px produces a 292 × 262.5703125 graphic. Both preserve 258:232 proportions. No Collections console errors were observed. The temporary browser viewport override was reset after testing.

Production pointer was independently checked after staging activation and is unchanged. No production promotion or production-domain Webflow publication occurred.

Outcome: **staging release verified**, including native Webflow markup publication. The Playground remains an unpublished draft. Prior immutable release remains retained for authorized rollback.

Evidence: [published desktop](2026-10-28-collections-staging/loans-desktop.png), [published mobile](2026-10-28-collections-staging/loans-mobile.png).
