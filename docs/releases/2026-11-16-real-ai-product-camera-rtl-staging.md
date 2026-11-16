# Real AI product camera RTL framing — staging

User requested Arabic first-field framing correction and Webflow Preview verification. This is camera JavaScript, not a Webflow style change. Staging animation deployment is authorized for Preview; production promotion and Webflow page/site publication are not part of this request.

The product-name close-up mirrors its protected 9% starting-edge margin to the right when the stage computes to RTL. It blends back to the existing camera path before the selector shots. Description and every later shot retain their approved coordinates/timing. Runtime reads computed direction at measurement; lab uses the same renderer direction flag.

`npm run validate:release` passed: 245 tests, complete build, dependency closure and Product Variety/wallet swap / Country Flags inclusion. Regression test samples the first-shot right margin and compares every later shot against unchanged LTR output. Fresh camera distribution files included.

Actual staging SHA and Webflow Arabic Preview verification will be recorded after deployment. Production is to remain at the prior verified `d49fe61d0ed330382cbbc1e3a919b43ba055865b` release.

## Staging / Preview verified

Merged PR #98 as `a236d6f05101b7131ddae1d53474c910ea59027f`. [Staging workflow 43878064270](https://github.com/gorankomar/stitch-animations/actions/runs/43878064270) completed successfully; the actual staging pointer imports that SHA.

Refreshed the existing Arabic Real AI Webflow Preview with custom code enabled. Captured the product-name shot while it read “قرض”, the currency selector still displayed its placeholder, and the marker was entering (opacity .111). The first field’s right inset measured ~114px in the 1280px frame, matching the intended 9% (~115px, with native zoom rounding). The start of the text is clearly visible inside the frame. No native Webflow/CSS change or page publication was needed.

Production pointer was rechecked and remains `d49fe61d0ed330382cbbc1e3a919b43ba055865b`. Staging and production intentionally differ for review. This evidence-only merge uses `[skip ci]` to retain those verified channel pointers without a documentation-only deployment.

## Production verified

User explicitly approved production promotion after Arabic Preview approval. Promoted the exact staging-tested release `a236d6f05101b7131ddae1d53474c910ea59027f` without rebuilding it. [Protected promotion workflow 43880033358](https://github.com/gorankomar/stitch-animations/actions/runs/43880033358) completed successfully after gorankomar's required Production review. No protection settings were changed. No Webflow page/site publication was performed.

Actual production pointer imports `a236d6f05101b7131ddae1d53474c910ea59027f` for all four configured origins (stitch.co, www.stitch.co, stitch.sa, www.stitch.sa), with CORS `*`. The served camera JS matches its immutable manifest SHA-256 and has JavaScript MIME type. Staging retains the same SHA.

GitHub queue anomaly: original dispatch [43878868438](https://github.com/gorankomar/stitch-animations/actions/runs/43878868438) remained queued with zero jobs/reviews for over six minutes; cancellation returned 409 “Cannot cancel a workflow run that has not been queued yet.” One identical protected retry reached review and completed. The jobless original made no activation; do not approve that stale run if GitHub later surfaces it. Both dispatches target the same retained SHA and the workflow serializes activation.

This documentation-only completion commit uses `[skip ci]` so both verified channel pointers remain on the same tested animation release.
