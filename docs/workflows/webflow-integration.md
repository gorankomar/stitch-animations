# Webflow integration

Inputs: requested component/page, approved behavior, preparation or release destination, and authorized domains. See [publishing](publishing.md).

1. Read relevant component notes and inspect native properties/slots/code. Preserve reusable component internals and unrelated custom code. For illustrations follow [illustration creation](illustration-creation.md); keep proportional scaling, native styling and visible fallback.
2. Save requested markup/style changes as drafts and use supported motion attributes. New compiled animation code must be validated/merged and activated on staging before the permanent Playground loader can run it; a draft alone does not deploy JavaScript. Local code remains local unless staging is authorized.
3. Keep the permanent environment router in the site-wide footer and Playground page footer. It selects staging for Preview/staging and production for configured production hosts. The shared script ID prevents duplicate initialization on published Playground pages. Do not edit loader SHAs for normal releases.
4. Remove redundant feature-module/inline animation scripts covered by page-all-lite, preserving native markup, attributes and style-only embeds. For mixed embeds remove only the redundant script. Verify Preview through the shared loader, including desktop/mobile, variants, repeats and reduced motion where relevant.
5. **Publish to staging:** complete the staging animation release when needed and publish required Webflow page changes only to staging; verify the live result. **Publish to production:** promote the exact staging-tested release when needed, pass the protected production review, and publish required page changes only to authorized production domains. Coordinate animation/page changes for compatibility; do not publish unrelated drafts. Animation-only releases do not need a Webflow publish.
6. Record the exact animation SHA and the separate Webflow saved/published state. CDN deployment or draft save alone does not establish page publication. Report preparation-only work as saved locally/saved to Webflow draft, and completed releases as staging/production release verified.

## Animations Playground layout

Features Wrapper uses the page-specific native `playground-features-grid` class: two equal columns, 20px gaps, top-aligned cells, and one column below 768px. Place existing component instances directly in the grid wherever possible; retain parents carrying preview settings or required sizing, including `cv-shell-wide` (540:324) and `cv-shell` (258:232). Keep Phone Shell — Realistic Experiment in its separate section outside the grid. Reorganizing the Playground must not change component definitions, slot contents, motion, or shared loader URLs.
