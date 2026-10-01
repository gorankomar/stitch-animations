# Product Variety

Native Webflow component: `Animations / Product Variety` (`3f910fb0-bc12-a16c-5f52-b11955643fed`).
Wallet content: `Phone Elements / Product Variety Wallet`.

Reuses Phone Shell and Credit Card. Wallet Blue and Wallet Gray are native Credit Card variants; Company and Type visibility are hidden. Layout, dimensions, gradients, shadows and typography live in Webflow.

The root carries `data-product-variety` and `data-anim="product-variety"`. The shared `page-all-lite.js` discovers and loads the module automatically. Do not add a standalone feature script to the component.

The background box is visible immediately. Its title, placeholder lines, card and button reveal sequentially, followed by the phone and wallet contents. The box uses the shared follow effect with a maximum 3px offset. Follow is disabled for coarse pointers and reduced motion, and disposed while offscreen or when the tab is hidden. Reduced motion displays all content without transitions.

Release through the existing main-branch build/publish workflow. Pages pinned to an older jsDelivr commit must update their shared loader; the CloudFront loader receives the published build subject to CDN caching.
