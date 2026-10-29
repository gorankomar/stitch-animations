# Omnichannel onboarding — staging verified, production review pending

The user requested push to production, clarified push/merge plus the production workflow, and instructed that they place reusable Playground components on destination pages. Later, they explicitly chose **Keep Webflow drafts unpublished**. No Webflow publication completed.

## GitHub and shared release

PR https://github.com/gorankomar/stitch-animations/pull/60 merged as `a70f4b4c70e5eb3f2f05a9ec8e361e09ba55c075`. Includes chat-owned component notes, untouched Lulu SVG source, index entry and standing illustration workflow. Unrelated Bilateral lending work was preserved outside the release. Full `npm run validate:release` passed: shared entries/builds, 209 tests and Product Variety/wallet swap plus Country Flags dependency closure. Fresh shared dist bytes were unchanged; three unrelated portable artifacts removed by the build were restored.

Upload run https://github.com/gorankomar/stitch-animations/actions/runs/40845542959 completed successfully, including immutable upload, served-byte/MIME/CORS verification and staging activation/invalidation. The staging channel was independently fetched and imports `a70f4b4c70e5eb3f2f05a9ec8e361e09ba55c075`. Production still imports retained `a2bb18cfa2215922e1c35091a59f2ab201a89fd9` at the check.

Dispatched https://github.com/gorankomar/stitch-animations/actions/runs/40845762390 from main with operation promote, channel production and release `a70f4b4c70e5eb3f2f05a9ec8e361e09ba55c075`. Activate job `123352731770` is **waiting for the protected Production environment review**. The agent did not approve the deployment or bypass protections. Production activation and served-pointer verification remain pending; this is not a completed production release.

## Webflow

The user created reusable component `3a021236-71fa-3378-02f4-9ac3a82bbc1a` and placed it on Onboarding. Reveal `i-9f822ff5` and pointer follow `i-286a2e02` were changed from Playground-only scope to this component scope. Onboarding native Preview verifies oc-revealing on viewport entry, the exact global cubic-bezier plus linear opacity, and the loading sweep. Native layout and in-component styles do not require a new shared JavaScript module.

Single-page publication was rejected by Webflow (pageId unsupported). A full staging-site publication was rejected by automatic approval review because it could publish unrelated pending pages without specific authorization. The user subsequently chose to leave Webflow drafts unpublished, so no alternative publication was attempted. Site's last published timestamp remains 2026-10-29T08:07:24.746Z. Playground and Platform Screens were read back draft:true. No loader URL or shared definition appearance was changed. The new native markup/interaction changes will remain saved until a future Webflow publication; CDN promotion alone cannot publish those changes.
