# Homepage hero static stack — staging

2026-10-14, Europe/Zagreb. Continuing the staging-only trial; user defers publication. No Webflow publication or production activation. Playground remains a draft.

- [PR #55](https://github.com/gorankomar/stitch-animations/pull/55), final release `8f39344d88597bc8731b2a4aeddbc378a1cf1734`.
- [Workflow 38556781680](https://github.com/gorankomar/stitch-animations/actions/runs/38556781680) succeeded, including immutable upload, served-file/CORS verification, staging activation and completed invalidation. Independent channel reads confirmed staging selects this SHA; production remains `484ec3e9b144318935364d96806ed10a0b148cca`. Previous staging `8641b84e3ce0a36f8c5956132eea62e5f4a8061f`.
- Full `npm run validate:release` passed: 146 tests, all shared builds, Product Variety/wallet swap and Country Flags plus dependency closure. Fresh generated outputs included; unrelated portable consumer-verification artifacts preserved.
- Root cause: unconditional opacity 0 on screenshot pixels, and static overlap selectors restricted to Designer mode. Without JS, position wrappers flowed vertically and images never became visible.
- Final screenshot geometry and image visibility are now default component CSS. Only successful Reveal setup hides/moves entrance wrappers. Static and reduced-motion content stays visible. Hero lifecycle handles each instance independently, waits for Reveal before enabling hover, and removes pending work/classes/listeners/inline positioning on cancellation, preference change or cleanup.
- Updated the existing visible CSS embed only: Playground element `a2918514-06c5-67bc-5c99-7cbddfb14a27`, from generated `dist/embeds/hero-stack-styles.html`. Preserved hidden legacy reference embeds, artwork, Global Styles, page-head bootstrap and footer router.
- Preserved user rearrangement and attributes: homepage hero first, `data-anim="hero"` / `data-reveal-start="early"`; content header below uses `data-anim="content-hero"` without early opt-in.
- Actual Preview with custom code disabled: all three images opacity 1; position modes relative/absolute/absolute; original desktop and mobile transforms. Desktop hero height 747.195px; mobile 705.305px. With the new served runtime enabled and entrance completed, measured the same heights and final transforms; no extra vertical flow.
- Actual desktop early entrance completed: six targets revealed at opacity 1 / identity entrance transforms, all child images opacity 1, stack is-inview/is-ready. A cold runtime load also exercised expired early fallback with visible correctly stacked screenshots.
- Reduced-motion initial/cancel behavior, media resize, two independent instances, readiness timing and cleanup covered by tests. OS reduced-motion browser emulation and every shared illustration were not manually retested.
- Durable component notes: docs/components/hero.md. This release is available through Playground Preview; the hero's inline CSS remains saved in a Webflow draft, not newly published site HTML.

Outcome: staging runtime verified, corrected hero draft saved. Publication deferred as requested. Release-evidence follow-up uses [skip ci] so the runtime pointer remains pinned to the tested SHA.
