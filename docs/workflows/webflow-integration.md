# Webflow integration

Inputs: component/page identity, approved local behavior, requested stage (draft or publish), and authorized domains for publishing.

1. Read component notes and inspect the current native component, properties, slots, assets, and custom code. Preserve unrelated custom code and native editability.
2. Map motion to documented data attributes. Use existing components/assets where suitable. Replace the component's prior implementation rather than appending duplicate initialization.
3. Build the matching embed using its documented builder. For a published change, follow [shared release](shared-release.md) before changing a site-wide loader.
4. Verify Webflow Preview at desktop/mobile, all variants, repeated instances, and reduced motion. Keep playground and site-wide shared loaders on the same immutable release.
5. Save a draft when that is the requested stage. Publish only when explicitly authorized for specified domains, then inspect served HTML and the affected interaction.

Completion: explicitly report local, saved draft, or published-and-verified. A repository push or CDN upload does not establish Webflow publication. Record evidence using [release records](../releases/README.md).
