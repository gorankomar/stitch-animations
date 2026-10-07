# Stitch project instructions

Keep prompts focused on the desired result. Read only the documents relevant to the task.

Established reusable components must retain their internal appearance unless the user explicitly requests changes. Use supported variants/props and outer layout/motion wrappers; avoid illustration CSS overriding component descendants. See docs/workflows/component-preservation-complaint.md for the recorded Credit Card complaint and integration rule.

## Project map and routing

- src/animations: animation modules; src/embeds: component markup/motion/styles/assets; src/lib/effects: canonical shared effects; src/entry: shared and feature loaders. Keep this structure. legacy is read-only reference.
- Figma graphic/illustration → docs/workflows/illustration-creation.md: static unless animation requested; default is saved Webflow draft. Preserve aspect ratio, scale all parts with parent width, style natively in Webflow with scoped in-component CSS only for unsupported needs. Local preview CSS stays local; Figma appearance must remain visible if animation fails. SVG work → docs/workflows/svg-handling.md.
- Raster images in supplied Figma illustrations → docs/workflows/raster-image-optimization.md: export a PNG master, create an optimized WebP for delivery, size for maximum rendered dimensions at 2× by default, and visually verify. Protect large/detail-sensitive images; allow stronger compression for tiny photographic avatars. Keep vectors as vectors.
- New/changed motion → docs/workflows/animation-changes.md, docs/workflows/motion-defaults.md, and docs/effects/index.md. Use Global Styles --motion-ease-primary for non-opacity motion; opacity is linear, unless explicitly specified otherwise. Read durations from the same global tokens. Reuse before creating. “Reveal”, “Card Hover”, and “Pointer Follow” mean the cataloged implementations.
- Component lookup → docs/components/index.md. Short prompts/handoffs → docs/prompt-guide.md.
- Saving/publishing stages → docs/workflows/publishing.md. Webflow changes → docs/workflows/webflow-integration.md. Release work → docs/workflows/shared-release.md.
- Animations Playground must always remain a draft and must never be published (user requirement, 2026-10-07). Exclude it from all page/site publication.
- Release commands: publish to staging and publish to production. Local/localhost work and Webflow drafts/Animations Playground are preparation, not extra release stages. Without a release request, save locally except Figma illustration creation defaults to a Webflow draft. New compiled motion needs an authorized staging release before Playground Preview can use it. Permanent CloudFront staging/production routers are active in the site-wide footer and Playground page footer; do not change Webflow SHAs routinely. Remove redundant feature-module/inline runtimes covered by page-all-lite, preserving styles, native markup and component appearance. “Middle” is only a legacy preparation alias (staging animation release plus saved drafts; no Webflow publication or production promotion). Follow docs/workflows/publishing.md and docs/workflows/cloudfront-releases.md. Production promotion changes live animations without a Webflow publish and requires production authorization plus the protected GitHub review. Keep pinned jsDelivr as emergency fallback. Never ask the user to replace URLs or remove scripts manually. Durable decisions belong in component notes; publication evidence belongs in docs/releases.
- npm run dev previews locally; npm test checks behavior; npm run validate:release tests/builds/checks the full shared release.

# GitHub completion scope

- “Push and merge” includes all approved work from the current chat: animation source, assets, reusable effects, documentation, project instructions, tests, and fresh generated distribution files. Fetch current main, resolve conflicts, validate, push, and merge into main without asking the user to perform Git steps. Preserve unrelated work from other chats; do not silently omit chat-owned documentation.
- Legacy “middle” includes that same GitHub scope, verified staging animation activation and saved Webflow drafts; page publication and production activation remain unauthorized. Visual approval alone does not authorize production. Normal release requests are publish to staging or publish to production.

# Shared animation releases

- This repository is edited by multiple chats. Fetch origin before starting release work and base the release on current `origin/main`; preserve unrelated working-tree edits.
- Never change Webflow's site-wide loader or activate a CloudFront channel using a feature branch built from an older main. Combine the requested feature with current main, run tests and build all shared entries, then merge before activating staging; promote the exact staging-verified SHA to production. Permanent site URLs do not change routinely.
- Product Variety's wallet swap and Country Flags must both remain in the shared bundle. Run `node scripts/check-shared-release.mjs` after building to verify their inclusion and local module/CSS dependencies.
- Preview/staging use the staging channel and production hosts use the separately approved production channel; differences must be deliberate and recorded. Do not use an older playground override to hide a missing feature in the published bundle.
- Preserve all unrelated Webflow custom code. Publish only to the user-authorized domains. Verify the published HTML's actual loader and the affected interaction after publishing.
- CloudFront deployment success does not prove edge caches refreshed. Verify served content before selecting CloudFront as the active loader.
