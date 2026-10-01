# Shared release

Inputs: approved features, repository state, current loader URLs, target Webflow pages/components, and user-authorized publish domains.

1. Fetch origin and inspect current origin/main plus all working-tree edits. Preserve unrelated work; prepare an isolated release checkout based on current origin/main and combine only approved changes. Never point the site-wide loader at a feature branch based on older main.
2. Run npm run validate:release in that checkout. This builds every shared entry/embed, runs tests against fresh artifacts, then checks dependency closure and Product Variety/wallet swap plus Country Flags inclusion. Single-feature builds are insufficient.
3. Review and merge the release before changing site-wide URLs. Use the merged full commit SHA for immutable asset URLs; publish all dependent chunks/styles/assets together.
4. For CDN module embeds, set STITCH_ASSET_BASE to the commit-pinned dist URL and regenerate embeds with node scripts/build-embeds.mjs. Keep every component module, playground shared preview, and site-wide shared loader on the same release. Inspect generated URLs before copying.
5. Inspect served loader, chunks, CSS, and assets. CloudFront upload success is insufficient: compare served bytes with release artifacts before selecting CloudFront as active loader. Preserve old immutable assets for rollback; the current S3 sync uses --delete and a mutable prefix, so do not treat it as immutable hosting.
6. Preserve unrelated Webflow code. Publish only to authorized domains. Verify each published page's actual loader URL, required shared interactions, and the changed component. Roll back loader and matching embeds together to the last verified immutable release if verification fails.
7. Record commit, URLs, domains, checks, and outcome in a dated release record. Do not claim completion for unverified serving or publishing.

Completion: release merged and served content verified; Webflow published-and-verified only when authorized. If domains or publication authorization are missing, finish the reviewable release preparation and request the missing information before publication.
