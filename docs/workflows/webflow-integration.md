# Webflow integration

Inputs: component/page identity, approved local behavior, requested stage ([save locally, save to Webflow, staging, or production](publishing.md)), and authorized domains for publishing.

1. Read component notes and inspect the current native component, properties, slots, assets, and custom code. Preserve unrelated custom code and native editability.
2. For graphics, follow [illustration creation](illustration-creation.md): static by default, proportional sizing, native Webflow styles, and Figma-visible fallback without JS. Add scoped in-component CSS only for unsupported native styles. Map requested motion to documented data attributes. Use existing components/assets where suitable. Replace the component's prior implementation rather than appending duplicate initialization.
3. Build the matching embed using its documented builder if required, excluding local-preview-only styles; do not overwrite native styling with generated preview CSS. For a published change, follow [shared release](shared-release.md) before changing a site-wide loader.
4. Verify Webflow Preview at desktop/mobile, all variants, repeated instances, and reduced motion. Keep playground and site-wide shared loaders on the same immutable release.
5. Follow [saving and publishing](publishing.md). For a staging/production request, the agent updates the site-wide footer SHA and synchronizes preview/component URLs before publishing to the selected domains; the user does not edit URLs manually.

Completion: explicitly report saved locally, saved to Webflow (draft), staging published-and-verified, or production published-and-verified. A repository push or CDN upload does not establish Webflow publication. Record evidence using [release records](../releases/README.md).
