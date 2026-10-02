# Stitch project instructions

Keep prompts focused on the desired result. Read only the documents relevant to the task.

Established reusable components must retain their internal appearance unless the user explicitly requests changes. Use supported variants/props and outer layout/motion wrappers; avoid illustration CSS overriding component descendants. See docs/workflows/component-preservation-complaint.md for the recorded Credit Card complaint and integration rule.

## Project map and routing

- src/animations: animation modules; src/embeds: component markup/motion/styles/assets; src/lib/effects: canonical shared effects; src/entry: shared and feature loaders. Keep this structure. legacy is read-only reference.
- Figma graphic/illustration → docs/workflows/illustration-creation.md: static unless animation requested; default is saved Webflow draft. Preserve aspect ratio, scale all parts with parent width, style natively in Webflow with scoped in-component CSS only for unsupported needs. Local preview CSS stays local; Figma appearance must remain visible if animation fails. SVG work → docs/workflows/svg-handling.md.
- New/changed motion → docs/workflows/animation-changes.md, docs/workflows/motion-defaults.md, and docs/effects/index.md. Use Global Styles --motion-ease-primary for non-opacity motion; opacity is linear, unless explicitly specified otherwise. Read durations from the same global tokens. Reuse before creating. “Reveal”, “Card Hover”, and “Pointer Follow” mean the cataloged implementations.
- Component lookup → docs/components/index.md. Short prompts/handoffs → docs/prompt-guide.md.
- Saving/publishing stages → docs/workflows/publishing.md. Webflow changes → docs/workflows/webflow-integration.md. Release work → docs/workflows/shared-release.md.
- Default: save locally except Figma illustration creation defaults to a Webflow draft. Other stages: save to Webflow (draft/Animations Playground), middle (agent saves the verified jsDelivr SHA in site settings and matching draft loaders; user publishes), publish to staging, publish to production. Middle and publishing include agent-owned synchronization of the site-wide footer, playground, and component loader SHAs; never ask the user to update them manually. Active CDN is commit-pinned jsDelivr while the admin resolves S3/CloudFront CORS. Read publishing.md for domain selection and verification. Durable decisions belong in component notes; publication evidence belongs in docs/releases.
- npm run dev previews locally; npm test checks behavior; npm run validate:release tests/builds/checks the full shared release.

# Shared animation releases

- This repository is edited by multiple chats. Fetch origin before starting release work and base the release on current `origin/main`; preserve unrelated working-tree edits.
- Never change Webflow's site-wide loader to a feature branch built from an older main. Combine the requested feature with current main, run tests and build all shared entries, then merge the release before changing the site-wide URL.
- Product Variety's wallet swap and Country Flags must both remain in the shared bundle. Run `node scripts/check-shared-release.mjs` after building to verify their inclusion and local module/CSS dependencies.
- Keep the playground's shared preview loader on the same immutable release as the site-wide loader. Do not use an older playground override to hide a missing feature in the published bundle.
- Preserve all unrelated Webflow custom code. Publish only to the user-authorized domains. Verify the published HTML's actual loader and the affected interaction after publishing.
- CloudFront deployment success does not prove edge caches refreshed. Verify served content before selecting CloudFront as the active loader.
