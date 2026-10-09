# Worldwide Markets staging release

Verified 2026-10-09 (Europe/Zagreb). User authorized “publish to staging.”

- Merged PR [#47](https://github.com/gorankomar/stitch-animations/pull/47), release `08b70e2a6dc5e02b64248fcd50f2215b98e26c70`.
- [Workflow 37959913782](https://github.com/gorankomar/stitch-animations/actions/runs/37959913782) succeeded. Upload job 113919829050 confirmed staging activation, completed CloudFront invalidation, and verified served loader.
- Staging channel: `https://d280qq257tic0i.cloudfront.net/Stitch+Animations/channels/staging/page-all-lite.js`. Served body imports the exact immutable release above. Previous staging SHA: `60817082670d7d578a2bcf2c25b776b1a6832adf`.
- Production channel remains `418f5b3456270c678384990e6db49ffb70c8e175`; before/after pointer bodies match. No production activation.
- Channel response has JavaScript content type, wildcard CORS, and `no-cache,max-age=0,must-revalidate`. Full release dependency verification passed.

Worldwide Markets is saved as reusable Webflow component `120c13fd-2d68-aa54-c51e-0f5b35fc630d` on Animations Playground. Page `6ab4079ac7ca32e3a6c168c8` remains a draft. No Webflow page/site publication occurred. Existing site and page routers were read and preserved; Preview uses staging and production hosts use production.

Full `npm run validate:release` passed: 120 tests, production build, and shared dependency checks. Browser verification in Webflow Preview confirmed one permanent shared loader, initialized SVG mask, 75% glow width, left-to-right movement, 4.5-second sweep and 2.5-second hold, desktop and mobile sizing. Local verification covered reduced motion, static fallback, setup failure, duplicate initialization, disposal/remount, resize and offscreen pause. Product Variety wallet swap changed translation and stacking on hover; Country Flags retained three sequences per row and moving transforms. Offscreen lazy flag images were not asserted loaded.

Outcome: staging animation release verified; illustration remains available in unpublished Playground Preview. Prior staging SHA above is retained for authorized rollback. This documentation-only follow-up does not rebuild or reactivate the verified release.
