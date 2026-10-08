# Issuer routing staging release — 2026-10-08

User authorized: “publish to staging”. Implementation merged in PR #41: https://github.com/gorankomar/stitch-animations/pull/41

Verified animation SHA: `6cf58914e903071f47eb3e0283760dbb82ac1337`. Previous staging: `1f320293f1e833616f2ca6327554a30ff6ac1382`. Production remains `418f5b3456270c678384990e6db49ffb70c8e175`.

Workflow https://github.com/gorankomar/stitch-animations/actions/runs/37785675506 succeeded. All 107 tests and complete shared build passed. CDN verification checked 205 release files, MIME/checksums/CORS for the staging origin. Staging invalidation completed; served channel imports the expected release with `no-cache,max-age=0,must-revalidate`.

Saved site-wide and Playground routers were read and preserved. Published https://stitch-website.webflow.io HTML contains the permanent channel router. Playground Preview has one `stitch-code-page-loader` pointing to staging; Issuer routing mounts once, draws its canvas, completes all 11 reveals and advances the branching pulse (252 path samples including source paths). Verified desktop width630 and mobile width345 with proportional 540:278 geometry. Country Flags and Product Variety retain their animated nodes and motion-ready initialization. Reduced-motion/visibility/cleanup behavior passed automated tests.

Webflow publication was unnecessary: the illustration is saved only on Animations Playground, which must never be published. `draft:true` verified after staging activation. No staging-site markup publication or production promotion performed. Screenshot evidence: local `/tmp/issuer-routing-staging-preview.png`.

This evidence-only follow-up preserves the same validated animation assets; a subsequent main workflow may assign a new staging SHA with identical animation bytes.
