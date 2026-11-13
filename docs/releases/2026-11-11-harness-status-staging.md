# Real AI Harness status sequence staging

Authorized staging only; user approved the local preview and requested no Webflow Preview.

- Based on main `1560281ecdd81ecd836cb58401e8d683581e003e`, previously active on staging.
- Build → Built, Test → Tested, Publish → Published follow the card reveal. Counterclockwise #FF3609 perimeter and equal-distance outward completion bursts; Built/Tested get checks and gray backgrounds.
- Reusable Webflow component: `8d35cc44-b66a-563b-336d-8b924758028c`; native final labels and scoped CSS saved in its draft.
- `npm run validate:release`: 228 tests passed, all shared entries built, Product Variety/wallet swap and Country Flags inclusion/dependency checks passed.
- Main deployment workflow activates staging only. Production and permanent loader URLs remain unchanged. Animations Playground must remain unpublished.
- Local desktop/393px mobile visual checks and sequence/replay/offscreen/cleanup/reduced-motion behavior test passed. Webflow Preview omitted at user request.

## Activation evidence

- PR #79: https://github.com/gorankomar/stitch-animations/pull/79
- Merged release: `913d869ac1cbe8e421cd1e83dadeac41e373753f`.
- Workflow https://github.com/gorankomar/stitch-animations/actions/runs/43103222378 completed successfully, including CDN bytes/CORS verification and staging activation/invalidation.
- Served staging channel independently verified importing that exact release SHA.
- Real AI single-page staging publication rejected: HTTP 400, `Invalid parameter: pageId`. No site-wide publish attempted because it would include unrelated pending pages. New scoped status CSS remains in the saved component draft, absent from published staging HTML. Published motion therefore awaits publication of that draft for full appearance.
- Animations Playground metadata confirmed `draft: true`; no Webflow publication performed. Production unchanged. Webflow Preview skipped as requested.
