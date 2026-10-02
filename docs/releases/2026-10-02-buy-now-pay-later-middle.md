# Buy Now Pay Later — middle saved

Release SHA: `344cebec2916643f039c1f8705dc9e0ae9023b87`.
Merged PR: https://github.com/gorankomar/stitch-animations/pull/12.

Prepared from current main `b0b2a91a2f1247a806ee6983a3c3a075371d1c44` in `/tmp/stitch-bnpl-middle`, preserving all unrelated working-tree edits. Includes Buy Now Pay Later motion/assets, shared Path Pulse, fresh distribution assets, and the user complaint/preservation rule in project instructions.

User explicitly authorized loader URL updates only after asking to leave Webflow component cleanup to them. No native component markup or styles were changed. Existing style-only embeds were read back unchanged; mixed style/script embeds changed only the pinned SHA. Buy Now Pay Later's portable inline runtime was replaced with the release's feature module loader; its style embed was preserved exactly as read.

Previous site and Playground loader SHA: `b0b2a91a2f1247a806ee6983a3c3a075371d1c44`.
New base: `https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@344cebec2916643f039c1f8705dc9e0ae9023b87/dist`.
Site footer and Playground preview load `page-all-lite.js` from this base. Financial Architecture, Change Due Date, Create New Card, User Onboarding, Credit Check, and Buy Now Pay Later module loaders use this same base.

Verification: `npm run validate:release` passed (39 tests, all shared entries/embeds, dependency closure including Product Variety Wallet Swap and Country Flags). All 71 runtime JS/CSS files at jsDelivr matched committed build bytes after a transient 503 retry. Site footer read back after reload exactly as expected, preserving unrelated code. Playground footer read back after draft save exactly as expected, preserving formatting. All inspected component embed settings matched expected URL-only updates or untouched original code.

Middle saved — ready for user publication. No domains published by the agent; live-site verification is pending publication. Rejected card CSS must not be reapplied from source artifacts; the user owns cleanup. See `docs/workflows/component-preservation-complaint.md`.
