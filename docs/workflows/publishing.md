# Publishing

## Two release destinations

The standard workflow is **Figma → Webflow draft/Animations Playground → publish to staging → publish to production**. Local files and localhost remain available for experiments and implementation before release. Draft work and local work are preparation, not extra release destinations.

| Request | Agent action | Completion evidence |
| --- | --- | --- |
| Publish to staging | Prepare and validate the complete shared release when animation code changes, merge to current main, wait for staging channel activation, save requested Webflow changes, verify Playground Preview, and publish only the Webflow staging domain when page/markup/style changes need publication. | Expected staging SHA served; intended markup published where needed; affected interactions verified. |
| Publish to production | Reuse the exact verified staging animation release, promote it through the protected production workflow when needed, and publish requested Webflow changes only to authorized production domains. | Expected production SHA served and intended page changes live; affected interactions verified on selected domains. |

**“Publish to staging” and “publish to production” are the two normal release commands.** Each authorizes the necessary GitHub release preparation, Webflow draft edits, animation channel activation and relevant Webflow publication for the approved change. No routine loader/SHA edit is needed.

If the user says only “publish” and the destination is unclear, ask staging or production. Production always needs production authorization; staging or visual approval alone does not provide it. If multiple production domains are configured and scope is unclear, establish the domains before Webflow publication. A production channel promotion affects every live page using that channel, including all four configured production hosts; disclose this scope if a request is limited to one domain. Per-domain animation releases require a different routing design.

## Preparation and compatibility

- A Figma illustration request defaults to a saved Webflow draft with Preview verification, per [illustration creation](illustration-creation.md). Do not infer publication. Include a staging release only if the user has authorized staging delivery or it is necessary within an explicitly requested release stage.
- Other work without a release request defaults to saving locally. Explicit “save locally”, “save to Webflow draft”, “test in the Playground”, or “do not publish” constraints remain valid and must be honored.
- To test NEW compiled animation code through the permanent Playground staging loader, its validated release must be merged and activated on staging. A new draft alone does not make new JavaScript available. This can update animations on the live staging site even before publishing Webflow page drafts; state that distinction.
- **Middle is retired as a normal stage.** If an older prompt says “middle” or “I'll publish”, interpret it as preparation: merge/upload/verify the staging animation release and save the requested Webflow drafts, then stop before Webflow publication or production activation. Report the exact states; do not change permanent URLs or ask the user to replace a SHA.
- A GitHub-only push/merge updates staging animations through the enabled main workflow; it does not authorize production promotion or publishing Webflow drafts. All approved chat-owned source/assets/effects/docs/instructions/tests and fresh dist outputs belong in that merge; preserve unrelated work.

## Permanent loaders

CloudFront channel delivery is active and the Webflow router cutover was verified on 2026-10-06. See [CloudFront releases](cloudfront-releases.md), [shared release](shared-release.md), and the [cutover record](../releases/2026-10-06-cloudfront-cutover.md).

- Site Settings → Custom Code → Footer owns the router on published pages.
- Animations Playground → Page Settings → Footer contains the same router for Designer Preview.
- The router selects `channels/staging/page-all-lite.js` for staging/Preview, and `channels/production/page-all-lite.js` for `stitch.co`, `www.stitch.co`, `stitch.sa`, and `www.stitch.sa`.
- Both router copies use `stitch-code-page-loader`, so published Playground pages initialize once. Do not add the loader to every page, append a second shared loader, or reinstall feature-module/inline animation runtimes covered by page-all-lite.
- Channel files import immutable `releases/<full SHA>/page-all-lite.js`. The full release includes dependent modules, CSS and assets. Permanent URLs stay unchanged between releases; record their imported SHAs internally.
- Keep native markup, component appearance, data attributes, style-only embeds and unrelated Webflow custom code. For mixed embeds remove only redundant animation scripts. Portable loaders are retained only when the user explicitly requests independent use.
- Read saved router code and affected embeds before release work; never infer configuration from old notes. Keep root delivery and commit-pinned jsDelivr only as historical/emergency fallback. Fallback requires authorization for affected live destinations, complete dependency verification and synchronized router replacement; it is not the routine publishing process.

Known site: Stitch Website, site ID `6823036cd77b3093eaf9154d`; Playground page ID `6ab4079ac7ca32e3a6c168c8`. Staging is `stitch-website.webflow.io`. Re-read configured production domains rather than guessing. Preserve unrelated pending drafts and inspect publication scope before publishing; surface unavoidable unrelated publication.

## What each release actually changes

Webflow publication and animation channel promotion are separate operations, combined by the agent under the requested destination:

- **Animation-only:** validate/build/merge and activate the relevant channel. Existing markup gets the new motion without a Webflow publish. Verify the published interaction; do not republish unrelated drafts.
- **Markup/style-only using existing effects:** save/verify and publish the Webflow changes. Reuse the already verified animation release; do not rebuild or promote solely to publish page changes.
- **Combined changes:** prepare compatible markup and animation code, verify both on staging, then coordinate production promotion and page publication. Account for the interval between these operations; retain compatibility with currently live markup, or arrange the appropriate safe order. Rollback may need both the animation pointer and Webflow changes.

## Verification and reporting

Confirm the actual published router, one active shared loader, the expected imported release SHA, successful module/CSS requests without CORS errors, and the changed interaction. Check desktop/mobile and reduced motion where relevant. Product Variety wallet swap and Country Flags must remain in the shared bundle and work wherever present. Preview success or an S3 upload alone does not prove live serving.

For production, use the protected GitHub `production` environment, `main` branch rule and required reviewer. Complete the agent-owned work; leave a pending review to the user if the interface requires their approval. Do not weaken approval protections to finish a deployment. Only promote the exact verified staging SHA; retain prior releases and use the rollback operation when authorized.

Record full release SHA, workflow/invalidation outcomes, verified URLs/domains, Webflow saved/published state and interaction results in [release records](../releases/README.md). Distinguish user publication verified by the agent from agent publication. Report **staging release verified** or **production release verified**, explicitly stating whether Webflow publication was necessary/performed. For preparation-only work report **saved locally** or **saved to Webflow draft**, plus any staging animation activation. Never call a release complete while required publication, approval, serving or interaction verification is pending.
