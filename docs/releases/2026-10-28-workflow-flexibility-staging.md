# Workflow Flexibility — staging verified

Verified 2026-10-28, approximately 17:54 Europe/Zagreb (16:54 UTC). User authorized staging and explicitly requested inclusion of every pending workspace change, including documentation. No production authorization was given.

- [Merged PR #58](https://github.com/gorankomar/stitch-animations/pull/58): Workflow Flexibility source, preserved Figma SVG originals, generator/local preview, tests, shared registrations and fresh distribution; all pending project instructions, workflow/component documentation, and Platform Onboarding construction/assets were included.
- Released SHA: `3c2bad01515b28163ccdff1f849fc1e9c68c731c`, combined with current `origin/main` before validation/merge.
- [GitHub release run 40729819147](https://github.com/gorankomar/stitch-animations/actions/runs/40729819147): success. Complete shared validation passed (203 tests), checksum manifest prepared, all 223 release files verified for staging bytes/MIME/CORS, immutable upload completed. Activation log: `Activated staging: 3c2bad01515b28163ccdff1f849fc1e9c68c731c; invalidation completed and served loader verified.`
- Staging pointer changed from `90421b3d0150ffc99aace46a7c5ca702509c0b6e` to the released SHA. Served channel independently confirmed after activation: `https://d280qq257tic0i.cloudfront.net/Stitch+Animations/channels/staging/page-all-lite.js`. Response 200, JavaScript MIME, `access-control-allow-origin: *`, `cache-control: no-cache,max-age=0,must-revalidate`. Served `feature-workflow-flexibility.js` exactly matches the local validated build.
- Production pointer independently checked and unchanged: `85540b314d5e83b9c19f8499601a706c1a48f009`. No production activation or Webflow publication.

## Webflow state and interaction evidence

Stitch Website `6823036cd77b3093eaf9154d`; Animations Playground `6ab4079ac7ca32e3a6c168c8` remains `draft:true` before and after work. Workflow Flexibility component `7306744e-258e-af9b-63d6-7fc941c7c150` is last in Features Wrapper, immediately after Worldwide Markets.

Only temporary Workflow Flexibility motion embed `7306744e-258e-af9b-63d6-7fc941c7c209` was removed after staged code was confirmed served. Style-only embed `7306744e-258e-af9b-63d6-7fc941c7c208`, native markup/styles/icon components and unrelated custom code remain. Permanent routers were not edited.

Fresh enabled-custom-code Preview has exactly one `stitch-code-page-loader` using the permanent staging channel and zero `data-workflow-flexibility-draft-runtime` scripts. The feature's native windows receive changing top/width positions and the raised active label rotates, proving shared-loader execution without the draft runtime. Desktop and mobile were inspected; mobile measures 345 × 252.359px, preserving 540:395. Product Variety remains motion-ready and its blue/gray wallet swap moved to opposing ±39.054px offsets on hover. Country Flags retains three sequences per track and all three transforms progress between samples. Behavior/lifecycle tests cover reduced motion, hidden/offscreen pause, duplicate mounting, cleanup and partial failure; reduced motion was not changed at the OS level during browser verification.

Published staging homepage HTML was read and retains the permanent environment router selecting staging outside the four production hosts. No Webflow page/site publication was necessary or performed: the new illustration belongs only to the permanently draft Playground. Other pending Webflow drafts remain unpublished.

Desktop and mobile screenshots: [desktop](2026-10-28-workflow-flexibility-staging/desktop.jpg), [mobile](2026-10-28-workflow-flexibility-staging/mobile.jpg).

Outcome: **staging release verified**. Future production promotion must explicitly authorize and promote this exact staging-verified release (or a separately verified successor); it is not implied by this record. Prior staging release remains available for an explicitly authorized rollback.
