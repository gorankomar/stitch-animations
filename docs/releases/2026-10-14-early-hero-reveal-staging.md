# Early hero Reveal — staging trial

2026-10-14, Europe/Zagreb. User authorized trying early-start Reveal in staging only. Prior instruction to keep Webflow drafts remains in force. No Webflow publication, Global Styles edits, site-wide code edits, or production activation.

## Release

- [PR #53](https://github.com/gorankomar/stitch-animations/pull/53) adds the opt-in head bootstrap, controller takeover/fallback, immediate early-section startup, generated head artifact, tests and documentation. Initial merged SHA `2b60da59afe4cae2473fa57eba43e97a42bbee1d`; workflow [38553721847](https://github.com/gorankomar/stitch-animations/actions/runs/38553721847) succeeded.
- Browser frame sampling found preparation could itself transition toward the offset. [PR #54](https://github.com/gorankomar/stitch-animations/pull/54) commits starting styles with transitions disabled, then restores the existing declaration before the entrance. Final released SHA **`8641b84e3ce0a36f8c5956132eea62e5f4a8061f`**.
- Final [workflow 38554064422](https://github.com/gorankomar/stitch-animations/actions/runs/38554064422) succeeded: complete build, 142 tests, shared dependency checks including Product Variety/wallet swap and Country Flags, 220 served release files verified for staging origin, activation and invalidation completed. Log activation timestamp 11:05:46 UTC / 13:05:46 Zagreb.
- Independent CDN reads confirmed staging imports final SHA. Production still imports `484ec3e9b144318935364d96806ed10a0b148cca`. Prior staging before this task was `5bf38387e9d3b4e3723bd7b2236b1510b877e47a`; intermediate early-start release was `2b60da59afe4cae2473fa57eba43e97a42bbee1d`.
- All chat-owned source, tests, documentation, bootstrap generator and fresh distribution files included. Clean main fetched before work; build-deleted unrelated portable consumer-verification artifacts preserved.

## Saved Playground draft

- Page `6ab4079ac7ca32e3a6c168c8` head was empty on read. Saved the generated `dist/embeds/reveal-early-head.html` there. Footer router read and preserved unchanged.
- Added `data-reveal-start="early"` only to first `.header84_component`, element `71e47053-f692-e1c9-9f34-0ca8511bd4e5`. Read-back confirms `data-anim="hero"` retained. Three existing Reveal wrappers/group unchanged.
- Header-tag's old Webflow interaction retained as a trial comparison. It is not part of the three Reveal targets. No component internals restyled.
- Read-only animation embed inspection verified actual saved tokens: primary cubic-bezier(.11,.61,.27,.99), movement 770ms, Soft stagger 200ms, opacity ratio .34, offset 7rem. Those tokens and the Global Styles embeds were not edited.

## Verification

- Deterministic browser fixture samples every frame with actual canonical head code, global Reveal CSS and source controller. Normal delayed runtime: first sample opacity 0, first visible sample at ~526ms near its 112px entrance offset, final resting position at opacity 1; no visible-to-hidden reversal. Missing runtime restores opacity 1 at ~1817ms. Runtime delayed to 2300ms restores at ~1801ms and never re-hides. Missing bootstrap remains visible throughout and skips entrance.
- Unit tests cover serialized head execution, idempotence, independent sections, deadline/late claim, missing bootstrap, reduced-motion initial preference and changes, stalled claim guard, original transition restoration, completion and cancellation.
- Actual Webflow Preview required a Designer refresh to load newly saved page-head code. A cold Preview start exceeded the 1800ms budget and correctly showed the expired visible fallback. Warm starts claimed and completed successfully on desktop and 393px mobile, with all three targets ready/revealed, opacity 1, and identity transforms. Preview DOM references final immutable staging release. This is intentional: on slow loads content takes priority over playing an entrance.
- OS reduced-motion browser emulation and every shared illustration were not visually retested; reduced-motion lifecycle has automated coverage, and the full shared build/dependency checks passed.
- Playground remained Draft. No published page HTML changes. The early mode is a draft Preview trial; production requires a separately authorized exact-SHA promotion plus compatible page-head/attribute publication.

Outcome: staging runtime verified and Playground draft saved for user review. Release-record-only follow-up uses `[skip ci]` to preserve the verified channel pointer.
