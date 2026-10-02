# Real-Time Approvals — middle saved

Release SHA: `83bf1b8bb97cc4649fa3245f7be8ad7292e5e620`.
Merged PR: https://github.com/gorankomar/stitch-animations/pull/13.

Prepared in an isolated checkout from current main `344cebec2916643f039c1f8705dc9e0ae9023b87`. Includes native illustration source/assets, Real-Time Approvals motion, shared Demo Cursor, and corrected cubic Bézier evaluation. Native Webflow connector layer changed to 3 above both card wrappers (2); cursor switches behind (1) before its inward exit, returning to foreground (4) for interaction.

Previous site/Playground/portable loader SHA: `344cebec2916643f039c1f8705dc9e0ae9023b87`.
New base: `https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@83bf1b8bb97cc4649fa3245f7be8ad7292e5e620/dist`.
Site footer and Playground resolver load page-all-lite.js. Financial Architecture, Change Due Date, Create New Card, User Onboarding, Credit Check, Buy Now Pay Later and Real-Time Approvals portable loaders use the same base. Real-Time Approvals draft IIFE replaced with feature-real-time-approvals.js. Unrelated custom code and style-only embeds preserved.

Verification: npm run validate:release passed (45 tests, full build, Product Variety wallet swap and Country Flags dependency closure). Local browser checks passed: stacking, reveals, continuous cursor/slider alignment, peak values, return loop, adaptive hover connector, offscreen pause, reduced motion, responsive repeated instances, cleanup and no-JavaScript fallback. All 72 runtime JS/CSS files on jsDelivr match release bytes. Site footer and Playground footer read back exactly as expected; all seven changed portable embeds read back exactly as expected.

Webflow desktop Preview loaded all eight release module URLs from the selected SHA; the illustration mounted and reached 95,000 USD with connector layer 3. Screenshot: /tmp/real-time-approvals-middle.png.

Middle saved — ready for user publication. No domains published; live-site verification pending user publication.
