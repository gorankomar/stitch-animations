# Orbit Graphic — staging verified

Verified 2026-10-29, approximately 15:08 Europe/Zagreb. User authorized staging only.

- [Merged PR #61](https://github.com/gorankomar/stitch-animations/pull/61): all approved Orbit source, scoped CSS/static fallbacks, native markup snapshot, local review page, component/effect documentation, regression tests and fresh complete shared distribution. Based on current main `7c4422ce58839cedbc45ca1368f30f31e6a4e1f2`; unrelated lending/onboarding working-tree files were preserved outside the release. Existing unrelated portable embeds were retained in Git.
- Release SHA: `94bba7a2d6da02df2751348a75275863020a1eaf`.
- [Release workflow 40887284085](https://github.com/gorankomar/stitch-animations/actions/runs/40887284085), upload job `123494288248`: **success**. Complete shared validation passed (224 tests), checksummed manifest prepared, 225 release files verified for staging bytes/MIME/CORS, immutable upload completed. Activation log confirms: `Activated staging: 94bba7a2d6da02df2751348a75275863020a1eaf; invalidation completed and served loader verified.`
- Staging pointer independently verified changed from `a70f4b4c70e5eb3f2f05a9ec8e361e09ba55c075` to the released SHA. Channel: `https://d280qq257tic0i.cloudfront.net/Stitch+Animations/channels/staging/page-all-lite.js`, 200 JavaScript, `cache-control: no-cache,max-age=0,must-revalidate`. The served `feature-orbit.js` exactly matches the validated local build; its immutable response allows CORS for the staging origin.
- Production independently verified unchanged at `a70f4b4c70e5eb3f2f05a9ec8e361e09ba55c075`. No production activation or Webflow publication.

## Webflow and interaction evidence

Stitch Website `6823036cd77b3093eaf9154d`; Orbit Graphic `16223460-70a1-261a-11ee-e3b3155ed40f`. Compact and Landscape samples retain editable Dots/Icon slots and Number of rings 1–6/default 3. Both samples end at three rings.

Animations Playground (`6ab4079ac7ca32e3a6c168c8`) was confirmed `draft:true` before and after release. Its saved footer was read in Page Settings and retains the permanent environment router. Published staging homepage HTML independently retains the same routing convention. No loader URL/SHA or unrelated custom code was changed, and no page/site publication was necessary or performed.

Fresh enabled-custom-code Playground Preview has exactly one `stitch-code-page-loader` using the permanent staging channel, with no added Orbit runtime script. Both native Orbit instances reached `data-orbit-ready`; initial samples showed dots held at each ring's top with scale 0, followed by movement to the expected arc positions. Landscape uses the approved 10% tighter complete dot arrangement. Staged pointer follow was confirmed with nonzero independent ring and Dot translate values. Mobile frames measured 345 × 310px (Compact) and 345 × 169px (Landscape), each with three visible rings. Desktop was restored afterward.

Required shared interactions were checked: Product Variety was motion-ready and wallet cards acquired opposing translate offsets; Country Flags has three sequences per track and all three track transforms progressed across samples. Behavior tests additionally cover reduced motion, hidden/offscreen pause, repeated replay, stale completion, cleanup, all ring counts and static/runtime alignment. OS reduced-motion preferences were not changed during browser verification.

The Preview console includes unrelated existing global tracking/navbar/custom-code errors; none reference the released Orbit module. They did not prevent the staged Orbit or required shared interactions from running and were not edited in this release.

Screenshots: [desktop](2026-10-29-orbit-staging/desktop.jpg), [mobile](2026-10-29-orbit-staging/mobile.jpg).

Outcome: **staging release verified**. Production promotion would require separate authorization and must promote this verified SHA (or a separately verified successor). Playground must remain a draft.
