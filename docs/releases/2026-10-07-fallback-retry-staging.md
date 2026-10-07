# Fallback and Retry Logic — staging, 2026-10-07

User authorized publish to staging after approving the illustration. Playground must always remain a draft; no Webflow page publication or production promotion is included.

PR39 merged: https://github.com/gorankomar/stitch-animations/pull/39. Feature release SHA `cae53fa557e4a0c7128d36702149600acc0f6359` includes all source, shared effects, local preview, documentation/instructions, tests and fresh generated distribution files. Based on current main `ee20a2165dba36d07cd1f59be3269b021d9201b5`; unrelated Consumer Verification portable embeds preserved.

Full validation passed101/101 tests and the shared dependency check retaining Product Variety/wallet swap and Country Flags. Workflow https://github.com/gorankomar/stitch-animations/actions/runs/37678356297 completed successfully. Upload and pre-activation validation verified203 release files for the staging origin; activation logged completed CloudFront invalidation and verified served loader at19:58:10UTC. Actual staging channel independently returned the expected full SHA, HTTP200, text/javascript, and cache-control:no-cache,max-age=0,must-revalidate.

Previous staging pointer: `ee20a2165dba36d07cd1f59be3269b021d9201b5`. Production remained `418f5b3456270c678384990e6db49ffb70c8e175`, independently compared before/after; no promotion occurred. Permanent site/footer and Playground loaders were read and preserved.

Playground Preview uses exactly one `stitch-code-page-loader` from the permanent staging channel. Desktop runtime verified630px frame, six native rows, four visible resting rows, full visible scale1, hidden scale.72 and active canonical Dots Field. Mobile verified345×177.609375px; during movement the three interior rows retained scale1 while the outgoing/incoming rows scaled and faded. Native Label variants and icon appearance retained. Local two-instance, reduced-motion, cleanup/remount and JS-disabled checks passed before release. Existing Product Variety wallet swap showed changing opposing translations; Country Flags retained three moving tracks and their original image elements.

Webflow component `3cf6fc65-bb97-16dd-da16-23a9b37e01a8` remains a saved draft on Playground `6ab4079ac7ca32e3a6c168c8`. No page publish call was made. Public staging Playground path previously verified404; draft metadata checked again at completion. This evidence-only follow-up changes no source or distribution files; main's automatic workflow may re-upload the identical animation build under its documentation merge SHA.
