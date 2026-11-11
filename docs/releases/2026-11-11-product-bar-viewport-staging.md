# Product bar viewport trigger — staging delivery

- User authorized staging and explicitly chose to perform Webflow Preview testing themselves.
- PR https://github.com/gorankomar/stitch-animations/pull/73 merged as `b9453c43150f928f85fcee28a5316327d0e5c648`, based on current main `2dad1c36c93f2bb4707043c4babac168dbe9fc7a`. Preserves the newer full-frame bar reveal and product-screen tilt.
- `npm run validate:release` passed all 225 tests and both shared loader/dependency checks, including Product Variety/wallet swap and Country Flags.
- Workflow https://github.com/gorankomar/stitch-animations/actions/runs/43061727460 completed upload/checksum/CORS verification and staging activation successfully, including the activation script’s invalidation wait.
- Served staging channel advanced from `2dad1c36c93f2bb4707043c4babac168dbe9fc7a` to the merged SHA. Independently fetched the channel and immutable product bundle: HTTP 200, JavaScript MIME, wildcard CORS; channel cache control `no-cache,max-age=0,must-revalidate`.
- Served `feature-real-ai-product.js` SHA-256 matches validated dist: `f29abca891e2cc81b38c234f9afa4443940ef88da1c20a9f9ef8dd1bf6502e5c`.
- Production pointer independently confirmed unchanged at `94bba7a2d6da02df2751348a75275863020a1eaf`.
- Animation-only deployment: no Webflow draft edits or publication performed. Playground remains untouched. No browser/Preview interaction verification performed, per user instruction; visual testing remains with the user.

## Form-first sequencing follow-up

The form now begins filling with the screen entrance. The floating confirmation waits for both the completed field sequence/lock-in update to 3 and viewport entry of the resting bar frame. Validated locally with all 226 tests and the complete shared bundle/dependency checks. User explicitly authorized pushing to staging without Preview testing; no Webflow page/site publication is authorized. Staging activation and served-file checks follow the merge; visual testing remains with the user.

Follow-up delivery verified: PR #74 merged as `d499298b9051ebbbd9a30d5ac971aad4bce6c624`. Workflow https://github.com/gorankomar/stitch-animations/actions/runs/43063255297 succeeded, including upload verification and staging activation/invalidation. Independently fetched staging pointer imports that SHA. Served product bundle SHA-256 `0dedd6b3f7a94df8da8b2759244c47c69316fa20c8d12667fcbea76d6120d79b` matches validated local dist. HTTP 200, JavaScript MIME, wildcard CORS; channel uses no-cache. Production remains `94bba7a2d6da02df2751348a75275863020a1eaf`. No Webflow Preview testing, draft changes, or page/site publication performed. This post-deployment evidence is saved locally.

## Viewport-only entrance with progress status

The next staging update removes the lock-in completion prerequisite from the bar entrance. While filling runs, the existing title says “Changing lock-in period to 3 months”, the stop square is visible, and the existing Webflow `.lp-product-arrow` is hidden. At lock-in 3 the final title and arrow replace the in-progress state. The local markup mirrors the existing managed arrow asset. Full release validation passed all 226 tests and shared dependency checks. User requested staging; prior instruction to skip Preview remains in effect. No Webflow publication or production promotion is included.
