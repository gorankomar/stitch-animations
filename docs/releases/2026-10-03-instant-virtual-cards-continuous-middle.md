# Instant Virtual Cards — continuous cursor middle save

2026-10-03, Europe/Zagreb. User requested one continuous cursor visit, a visible hold after switching on, a single diagonal exit after switching off, and a 2–3-second pause before repeating. GitHub push/merge and middle stage authorized.

Original entrance retained. The cursor switches the spending limit on, moves 32 design pixels right and 38 down, holds visibly for exactly 1.5 seconds, returns to the same toggle and switches it off. Final exit is one straight down-left segment to the original resting point beneath the Dark Blue card. Stacking drops below the card just before crossing its right edge; no fade or intermediate disappearance/second entrance occurs. It rests fully concealed for exactly 3 seconds before repeating. The entrance reveals run once. Default movement duration remains the live token; current cursor period is 7.426 seconds at 770ms.

Merged runtime SHA: `cc36aebca08ca74baf9e6bddeb5e25f8cb19499c` ([PR #23](https://github.com/gorankomar/stitch-animations/pull/23)), based on current origin/main `0b3a9cfc645712cd3cc8eae6f49b08ce91656b93`. Isolated release checkout preserved unrelated local work. Source, updated notes/tests and freshly generated shared outputs included.

Validation: npm run validate:release passed all 69 tests, complete shared builds and local dependency closure including Product Variety/wallet swap and Country Flags. Superseded fade tests replaced with checks of continuous visibility, 1.5-second hold, 3-second rest, repeated entrance and rendered straight-line exit across multiple cycles. All 79 runtime JS/CSS files served by jsDelivr matched local committed bytes.

Saved site-wide Footer code and Playground page-settings footer both use https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@cc36aebca08ca74baf9e6bddeb5e25f8cb19499c/dist/page-all-lite.js, replacing a23f9698c80dd258e18c1e3a399ec2bd789fb432. Complete site footer read-back after reload exactly matched SHA-only replacement; unrelated code preserved. Shared-only Preview contains exactly one loader at the final SHA and zero scripts inside the illustration. Connector read-back confirms the component runtime embed remains empty.

Webflow desktop Preview initialized successfully; cursor observed opaque at toggle translate(543.54px,139.787px), then returning/reappearing behind the card at translate(483.96px,193.711px), z1; concealed resting location translate(408.333px,210px), opacity1,z1 with amount0. Mobile initialized at345 ×177.609. Desktop restored. Hold/rest durations and continuous single-segment exit are verified by deterministic rendered-frame tests; OS reduced-motion preferences unchanged.

Proof: [shared-loader Preview](assets/2026-10-03-instant-virtual-cards-continuous-loop.png).

Outcome: **middle saved — ready for user publication**. No domains selected or published. User publishes next; live-site verification pending.
