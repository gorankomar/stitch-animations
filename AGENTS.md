# Shared animation releases

- This repository is edited by multiple chats. Fetch origin before starting release work and base the release on current `origin/main`; preserve unrelated working-tree edits.
- Never change Webflow's site-wide loader to a feature branch built from an older main. Combine the requested feature with current main, run tests and build all shared entries, then merge the release before changing the site-wide URL.
- Product Variety's wallet swap and Country Flags must both remain in the shared bundle. Run `node scripts/check-shared-release.mjs` after building to verify their inclusion and local module/CSS dependencies.
- Keep the playground's shared preview loader on the same immutable release as the site-wide loader. Do not use an older playground override to hide a missing feature in the published bundle.
- Preserve all unrelated Webflow custom code. Publish only to the user-authorized domains. Verify the published HTML's actual loader and the affected interaction after publishing.
- CloudFront deployment success does not prove edge caches refreshed. Verify served content before selecting CloudFront as the active loader.
