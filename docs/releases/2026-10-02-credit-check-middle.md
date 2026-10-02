# Credit Check — middle saved

Date: 2026-10-02. Publication remains with the user; no domains were published.

Merged PR: https://github.com/gorankomar/stitch-animations/pull/11

Release SHA: `b0b2a91a2f1247a806ee6983a3c3a075371d1c44`.

Prepared in an isolated clone from current origin/main (`fa0a98ee5c61fe7b115a5ea19b9779b20b6cfd0d`) to preserve unrelated working-tree edits. Includes reusable CC Card and CC Badge components, Plus Circle variants, Reveal, card lift with attached badge, moving connector endpoints, and two-turn icon spins.

## Saved loaders

Previous base: `https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@fa0a98ee5c61fe7b115a5ea19b9779b20b6cfd0d/dist`.

New base: `https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@b0b2a91a2f1247a806ee6983a3c3a075371d1c44/dist`.

Site Settings footer and Animations Playground footer now resolve `page-all-lite.js` from the new base. Financial Architecture, Change Due Date, Create New Card, and User Onboarding component module loaders use the same SHA. Credit Check's portable inline runtime was replaced with `feature-credit-check.js` at this base. Scoped styles and unrelated custom code were preserved. All saved code read back exactly as written.

## Verification

- `npm run validate:release` passed: 32 tests, all shared entries built, shared release dependency checker passed (including Product Variety wallet swap and Country Flags).
- All 70 runtime files served by jsDelivr matched the committed release byte-for-byte.
- Refreshed Webflow custom-code Preview contained all five component module URLs plus the shared loader at the merged SHA. Credit Check rendered with Reveal styling and its connector overlay. Icon spin was observed in Preview after the loader change.
- Screenshot: `/tmp/credit-check-middle-preview.jpg`.

Middle saved — ready for user publication. Live-site verification is pending publication.
