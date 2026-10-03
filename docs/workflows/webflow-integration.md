# Webflow integration

Inputs: component/page identity, approved local behavior, requested stage ([save locally, save to Webflow/Playground draft, middle, staging, or production](publishing.md)), and authorized domains for publishing.

1. Read component notes and inspect the current native component, properties, slots, assets, and custom code. Preserve unrelated custom code and native editability.
2. For graphics, follow [illustration creation](illustration-creation.md): static by default, proportional sizing, native Webflow styles, and Figma-visible fallback without JS. Add scoped in-component CSS only for unsupported native styles. Map requested motion to documented data attributes. Use existing components/assets where suitable. Replace the component's prior implementation rather than appending duplicate initialization.
3. Build the matching embed using its documented builder if required, excluding local-preview-only styles; do not overwrite native styling with generated preview CSS. For middle or a published change, follow [shared release](shared-release.md) before changing a site-wide loader.
4. At middle or publication, remove component-level animation scripts and inline runtimes already resolved by page-all-lite. Preserve style-only embeds and unrelated custom code; for mixed embeds, remove only the animation script. The Playground page-settings shared loader provides Preview initialization with custom code enabled. Verify Webflow Preview at desktop/mobile, all variants, repeated instances, and reduced motion. Keep playground and site-wide shared loaders on the same immutable release.
5. Follow [saving and publishing](publishing.md). For middle, the agent saves and verifies the site-wide footer SHA and the matching Playground page-settings shared loader, then stops for the user to publish. For a staging/production request, the agent updates the site-wide footer SHA and synchronizes the shared preview URL before publishing to the selected domains; the user does not edit URLs manually.

Completion: explicitly report saved locally, saved to Webflow (draft), middle saved — ready for user publication, staging published-and-verified, or production published-and-verified. A repository push or CDN upload does not establish Webflow publication. Record evidence using [release records](../releases/README.md).

## Animations Playground layout

Features Wrapper uses the page-specific native `playground-features-grid` class: two equal columns, 20px gaps, top-aligned cells, and one column below 768px. Place existing component instances directly in the grid wherever possible; retain parents carrying preview settings or required sizing, including `cv-shell-wide` (540:324) and `cv-shell` (258:232). Keep Phone Shell — Realistic Experiment in its separate section outside the grid. Reorganizing the Playground must not change component definitions, slot contents, motion, or shared loader URLs.
