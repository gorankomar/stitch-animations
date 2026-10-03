# Instant Virtual Cards — middle saved

2026-10-03, Europe/Zagreb. User requested card-concealed cursor entrance/exit, an extra one-second pause, GitHub push/merge and the project middle stage. Final correction routes the cursor around the expanded spending-limit box: right to x510, down to y215, then left behind the Dark Blue card. Opacity stays 1; stacking drops below the card only on the final leftward segment. Both enable and disable clicks repeat. Entrances run once. Period is eight default-duration units plus one second (7.16 seconds at current tokens).

Merged implementation release: `2cd72c3c9cce61a845485513381820080e98cf60` ([PR #20](https://github.com/gorankomar/stitch-animations/pull/20), [path correction PR #21](https://github.com/gorankomar/stitch-animations/pull/21)). Prepared in an isolated checkout from current origin/main; all chat-owned source, shared Hard Reveal, notes, preview assets, tests and fresh distribution outputs included. Unrelated local work preserved. Existing main features retained.

Validation: npm run validate:release passed all 70 tests, all shared builds and local dependency closure including Product Variety/wallet swap and Country Flags. All 79 runtime JS/CSS files served by jsDelivr matched the committed bytes.

Saved site-wide Footer code and Playground page-settings footer both use https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@2cd72c3c9cce61a845485513381820080e98cf60/dist/page-all-lite.js. Prior saved SHA was 780ec77eb6406cf9acf8f7de1be0efb3cd0a2109; an intermediate Playground draft was briefly at 263ad348e3acf681639ef9c869f2b804f5ea595e before the path correction. Site settings reload and complete clipboard read-back matched the exact SHA-only replacement, preserving all unrelated code. Preview shows exactly one shared loader at the final SHA and no feature-module scripts.

Instant Virtual Cards runtime embed 19d1d8d5-ae48-5459-7d5f-d904e1c17c70 was cleared; connector read-back confirms empty. Native styles and component markup retained. Shared-only Preview initializes successfully with zero scripts inside the illustration. Desktop: 630 × 324.328; mobile: 345 × 177.609. Cursor observed opaque at translate(515.412px,250.833px), z4 below the expanded box, then translate(470.936px,203.641px), z1 on the return beneath the card. Expanded box bottom measured 206.5 frame pixels; exit y250.8 gives clearance. Desktop breakpoint restored. Reduced motion and lifecycle cleanup covered by tests; OS preferences unchanged.

Proof: [shared-loader Preview](assets/2026-10-03-instant-virtual-cards-middle.png).

Outcome: **middle saved — ready for user publication**. No domains selected or published. User publishes next; live-site verification remains pending.
