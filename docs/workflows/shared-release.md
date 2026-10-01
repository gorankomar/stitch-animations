# Shared release

Active CDN: commit-pinned jsDelivr until the admin fixes and we verify S3/CloudFront CORS. Follow [saving and publishing](publishing.md) for destination and agent-owned loader updates.

Inputs: approved features, repository state, current loader URLs, target Webflow pages/components, and user-authorized publish domains.

1. Fetch origin and inspect current origin/main plus all working-tree edits. Preserve unrelated work; prepare an isolated release checkout based on current origin/main and combine only approved changes. Never point the site-wide loader at a feature branch based on older main.
2. Run npm run validate:release in that checkout. This builds every shared entry/embed, runs tests against fresh artifacts, then checks dependency closure and Product Variety/wallet swap plus Country Flags inclusion. Single-feature builds are insufficient.
3. Review and merge the release before changing site-wide URLs. Commit the fresh generated dist assets to the release before merging; verify that the merged SHA contains them. Use that full commit SHA for immutable jsDelivr URLs and publish all dependent chunks/styles/assets together. S3 CI output alone does not update GitHub-hosted assets.
4. For CDN module embeds, set STITCH_ASSET_BASE to the commit-pinned dist URL and regenerate embeds with node scripts/build-embeds.mjs. The agent updates the existing Webflow site-settings footer URL and saves it; synchronize component modules and Playground shared preview to that same release. Inspect and verify all saved URLs before publishing.
5. Inspect served loader, chunks, CSS, and assets. CloudFront upload success is insufficient: compare served bytes with release artifacts before selecting CloudFront as active loader. Preserve old immutable assets for rollback; the current S3 sync uses --delete and a mutable prefix, so do not treat it as immutable hosting.
6. Preserve unrelated Webflow code. Publish only to authorized domains. Verify each published page's actual loader URL, required shared interactions, and the changed component. Roll back loader and matching embeds together to the last verified immutable release if verification fails.
7. Record commit, URLs, domains, checks, and outcome in a dated release record. Do not claim completion for unverified serving or publishing.

Completion: release merged and served content verified; Webflow published-and-verified only when authorized. If domains or publication authorization are missing, finish the reviewable release preparation and request the missing information before publication.
