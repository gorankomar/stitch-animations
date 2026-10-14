# Reveal visible fallback — staging runtime release

2026-10-14, Europe/Zagreb. User authorized staging, then explicitly selected **Keep Webflow drafts; runtime staging only**. No production activation or Webflow edits/publication performed.

- All chat-owned changes merged through [PR #52](https://github.com/gorankomar/stitch-animations/pull/52), including source, tests, expanded Reveal notes, local preview CSS and fresh distribution files. Based on freshly fetched main; no unrelated working-tree edits existed before the build. Build-deleted legacy portable consumer-verification artifacts restored to preserve them.
- Released SHA: `5bf38387e9d3b4e3723bd7b2236b1510b877e47a`.
- [Workflow 38551319105](https://github.com/gorankomar/stitch-animations/actions/runs/38551319105) succeeded. Logs confirm 219 release files verified for staging origin; staging activation completed at 10:42:22 UTC (12:42:22 Zagreb), including CloudFront invalidation and served-loader verification.
- Independent channel reads confirmed staging imports this SHA. Prior staging and current production remain `484ec3e9b144318935364d96806ed10a0b148cca`.
- Permanent channel endpoints remain `https://d280qq257tic0i.cloudfront.net/Stitch+Animations/channels/staging/page-all-lite.js` and the corresponding `production` path. Saved site and Playground routers read back unchanged, selecting staging for Preview and staging hosts.
- `npm run validate:release` passed: all shared entries/embeds built, 137 tests passed, dependency closure and Product Variety/wallet swap plus Country Flags inclusion checked. Tests cover readiness before/after ensure, cancellation and scheduling failure cleanup.
- Read-only Webflow inspection confirmed the user installed both gated Soft Reveal selectors in Global Styles' separate animation embed (`489deebb-81c3-5d09-471d-1439e300992d`), retaining Hard exclusions, Designer override and existing tokens. No Global Styles changes made by this chat.
- Playground Preview uses the staging loader and saved gated CSS. Desktop and 393px mobile checks confirmed all six Hero targets ready/revealed at opacity 1. Product Variety's 12 reveal targets completed at opacity 1; Country Flags mounted with translated tracks. This is focused verification, not a complete visual regression of all illustrations or an OS reduced-motion browser test.
- Playground remained Draft throughout. Published staging Home HTML still contains older CSS. Single-page publish attempt was rejected by Webflow (`Invalid parameter: pageId`), with no publication. User declined a full staging site publish; all Webflow drafts remain saved. Therefore the new no-JavaScript CSS fallback is available in saved Preview but has not been published to the staging site's HTML by this chat.

Outcome: staging runtime release verified; Webflow publication deliberately deferred by user. Production unchanged. Release-record-only follow-up commits use `[skip ci]` so they do not move the verified runtime pointer.
