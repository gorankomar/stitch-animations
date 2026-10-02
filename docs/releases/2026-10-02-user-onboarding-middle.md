# User Onboarding — middle saved

Date: 2026-10-02, Europe/Zagreb. Request: push User Onboarding to middle.

Merged release: `fa0a98ee5c61fe7b115a5ea19b9779b20b6cfd0d`, [PR 10](https://github.com/gorankomar/stitch-animations/pull/10), based on current main `3e32d84370b5d08c485258917185f28960d9ffff`. Fresh source and dist committed; unrelated working-tree edits preserved in the original checkout.

Active CDN base: `https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@fa0a98ee5c61fe7b115a5ea19b9779b20b6cfd0d/dist/`.

Previous site footer and Playground release: `43af496c8ba8fadfa12bfcd90eaa54d410ccb0d7`. Both saved loaders now point to the new base plus `page-all-lite.js`. Read-back confirmed exact expected code with unrelated custom code preserved. Financial Architecture (`feature-financial.js`), Change Due Date (`feature-due-date.js`), and Create New Card (`feature-create-card.js`) component URLs were synchronized from the previous SHA. User Onboarding's self-contained draft script was replaced with the same release's `feature-user-onboarding.js`; its stable registry prevents double initialization with the shared resolver. All four component code settings were read back and matched exactly. Other inspected component embeds contain no pinned external loader and were preserved.

Validation: `npm run validate:release` passed, including 26 tests, full build, both shared loaders, Product Variety/wallet swap and Country Flags inclusion, and complete local dependency closure. All 69 shared entries/chunks/CSS files served by jsDelivr matched local release bytes. Regenerated portable embeds with the pinned STITCH_ASSET_BASE. The refreshed Webflow desktop preview loaded all five pinned scripts from this SHA; onboarding was ready at width 540 and its loading gradient advanced. Prior desktop/mobile, reduced motion and fallback checks passed.

Outcome: **middle saved — ready for user publication**. No domains selected or published. Existing served staging/production releases were not changed or reverified. User publication and live-site HTML/interaction verification remain pending. Other pending drafts are outside this release's source scope.
