# Embedded Connectivity staging release

Verified 2026-10-12 (Europe/Zagreb). User authorized “publish to stage.”

- Merged [PR #48](https://github.com/gorankomar/stitch-animations/pull/48) from current origin/main `2c10ea359344976bf6b0d8d3f78d58a15e9ad660`.
- Animation release: `c6ff1e71c303a03ec3a355ac82ddb70cc5bfca64`.
- [Workflow 38239607772](https://github.com/gorankomar/stitch-animations/actions/runs/38239607772), upload job `114778681657`, succeeded. Logs confirm 215 release files verified, completed CloudFront invalidation and served staging loader verification.
- Previous staging release: `08b70e2a6dc5e02b64248fcd50f2215b98e26c70`, retained for authorized rollback.
- Served `https://d280qq257tic0i.cloudfront.net/Stitch+Animations/channels/staging/page-all-lite.js` imports the exact new immutable release. JavaScript MIME, wildcard CORS and no-cache channel headers verified.
- Production channel remains `418f5b3456270c678384990e6db49ffb70c8e175`; before/after bodies are identical. No production activation.

Full `npm run validate:release` passed: build, 121 tests and shared dependency checks. Both shared entries and the multi-entry build now include Embedded Connectivity. Release checks require its compiled source before the portable runtime can be removed, alongside Product Variety/wallet swap and Country Flags. Unrelated working-tree Build for Devs work was preserved through an isolated release checkout. Existing Consumer Verification portable artifacts were retained after the build.

Webflow component `9079c098-0011-ccf1-2cb9-ca8936bf4bee` keeps its native artwork, nested Provider/Stitch Icon components and styles. Hidden runtime embed `af4b5411-a269-f201-6422-3c70717cc771` was cleared and read back empty after staging served the replacement. Separate style/connector embed `d220e029-9608-bf75-f375-faf9d7992d81` retains its content except obsolete ripple pseudo-element rules. Site and Playground permanent footer routers were read and preserved.

Webflow Preview with custom code enabled confirmed one staging shared loader, changing transforms on all three rings and the EC Hub heartbeat at desktop (630-wide component) and 393 viewport (345×310.23 component). Local browser verification covered reduced motion and no component runtime errors; focused lifecycle tests cover repeat mounting, offscreen/hidden-tab pause and cancellation. Shared regressions in Webflow Preview confirmed three sequences per Country Flags row with changing track transforms, and Product Variety wallet swap translation ±39.054px with blue stacking changing to 2.

Animations Playground `6ab4079ac7ca32e3a6c168c8` remained draft before and after edits. No Webflow page/site publication occurred: the animation channel is activated separately, and Playground must remain unpublished. No loader URL changes were needed.

Outcome: staging animation release verified; updated reusable component available through unpublished Webflow Playground Preview.
