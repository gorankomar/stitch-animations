# CloudFront channel migration preparation — 2026-10-05

Timezone: Europe/Zagreb. User authorized local/GitHub implementation and Webflow draft preparation, plus an AWS admin handoff. No production channel activation or Webflow publication was requested/performed.

Repository base: current origin/main `678038b06de2c6ddfe2d88a0f447b2d7542a652c`. The commit containing this record identifies the prepared workflow revision; no channel release SHA is deployed yet.

## Completed

- Replaced the destructive mutable-root S3 sync with gated immutable release uploads, complete SHA256 manifest verification, serialized staging activation, manual production promotion, retained-pointer history and explicit rollback.
- Prepared permanent Webflow staging/production environment router in `docs/deployment/webflow-channel-loader.html`. Production is selected only for configured Stitch production hosts; Preview/staging use staging. Shared loader ID prevents duplicate router initialization.
- Prepared AWS admin handoff detailing cache behaviors, CORS, versioning/retention, deployment IAM, GitHub variables/environments, migration and rollback.
- Updated project publishing instructions with the transitional state, separate animation/Webflow publication authorization, and the post-cutover channel procedure.
- Full validation: all shared entries built, 79 tests passed at first full validation, both loaders include Product Variety/wallet swap and Country Flags. Additional CLI integration test passed afterward: stale files and unstaged production release fail before any AWS calls; successful activation writes only after verification and waits for invalidation; explicit rollback can restore an older staged release. Final test count: 80.
- Preserved existing portable Consumer Verification HTML files in the repository; a full build cleans them out but this infrastructure change does not remove unrelated portable artifacts.

## Webflow saved draft evidence

Site ID `6823036cd77b3093eaf9154d`; Playground ID `6ab4079ac7ca32e3a6c168c8`.

Site-wide footer read: active `https://d280qq257tic0i.cloudfront.net/Stitch+Animations/page-all-lite.js`; old jsDelivr tag is commented. Footer content was not changed; unrelated login/authentication, FAQ, navigation, analytics and other code were preserved.

Playground draft footer changed from `https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@95e9aeb18eb4fbec627b3b731cddccf1cf1a6b0a/dist/page-all-lite.js` to the same active CloudFront root URL as the site-wide footer. Existing resolver and Country Flags/Product Variety notes were preserved. Saved footer was read back and matched exactly. Draft Preview interaction verification is pending; this is a saved-draft alignment, not a fully verified middle release.

Selected/published domains: none. Known configured production domains: stitch.co, www.stitch.co, stitch.sa, www.stitch.sa. No claim is made that saved drafts are served there.

## Served checks and blockers

- Prior staging check: root entry and all 67 shared JS/CSS graph files exactly matched local dist; staging CORS/browser module loading passed. An unrelated missing `login-button` inline listener error was reported and left unchanged in this infrastructure task.
- New staging and production channel GET checks each returned HTTP 403. Their public serving/bootstrap is not ready; installing the new router now would break loading. The existing live root loader remains in use.
- AWS CLI/access is unavailable here; distribution ID, cache behavior configuration and deployment permissions have not been verified. GitHub channels stay disabled until `STITCH_CHANNELS_ENABLED=true` after admin setup.
- No new release directory, channel pointer, invalidation, S3 configuration or production animation release was deployed from this chat.

Next: admin applies/confirms the handoff; enable and bootstrap staging; agent checks browser interactions; user authorizes initial production channel bootstrap; agent installs/verifies both Webflow draft routers; publish only authorized domains. Record actual GitHub merge/run outcomes and subsequent deployment/publication evidence separately.

## GitHub completion evidence

[PR #31](https://github.com/gorankomar/stitch-animations/pull/31) merged as `94430636fe79ff7da47189ecb3f045e250c89a44`. Local main was fast-forwarded to the merged revision. [Actions run 37292042977](https://github.com/gorankomar/stitch-animations/actions/runs/37292042977) completed successfully: full shared-release validation, manifest preparation and artifact retention passed. Its job steps explicitly show AWS credential setup, immutable upload and staging activation were SKIPPED because channel deployment is not enabled; the production activation job was also skipped. This proves preparation/build retention, not AWS deployment. The live root was untouched.
