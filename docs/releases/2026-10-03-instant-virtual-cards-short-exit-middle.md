# Instant Virtual Cards — short exit middle save

2026-10-03, Europe/Zagreb. User requested simpler cursor exits, the original entrance on every loop, more rest, GitHub push/merge and middle save.

After both toggle clicks, the cursor moves only 18 design pixels right and 14 down while fading linearly over half a default duration. Repositioning occurs invisibly; each loop starts from the original location behind the Dark Blue card. The longer around-the-box exit is removed. The period is eight default-duration units plus two explicit seconds, 8.16 seconds with current tokens, one second longer than the previous release.

Merged runtime SHA: `a23f9698c80dd258e18c1e3a399ec2bd789fb432` ([PR #22](https://github.com/gorankomar/stitch-animations/pull/22)). Release based on current origin/main `dff87203bad49b67cd4a2e59cab3b520311723f8` in an isolated checkout. Other chats’ working-tree changes preserved. Fresh shared outputs and component notes included.

Full npm run validate:release passed 70 tests, all shared builds and local dependency closure, including Product Variety/wallet swap and Country Flags. Added a rendered-frame regression check after the build: all 71 tests pass; more than 100 sampled fading frames across repeated loops stay within the 18 × 14 design-pixel exit and front stacking. Linear fade, hidden repositioning and the longer rest are tested. No runtime change after release validation. All 79 runtime JS/CSS CDN files matched local committed bytes.

Site settings Footer code and Playground page-settings footer saved at https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@a23f9698c80dd258e18c1e3a399ec2bd789fb432/dist/page-all-lite.js, replacing prior SHA 2cd72c3c9cce61a845485513381820080e98cf60. Complete footer clipboard read-back after reload exactly matched SHA-only replacement; unrelated code preserved. Preview shows exactly one shared loader at the new SHA and no scripts inside the illustration. Connector read-back confirms the component runtime embed remains empty.

Shared-only Webflow Preview: ready=true. Cursor observed at toggle translate(543.54px,139.787px), opacity1; completed short exit translate(564.54px,156.12px), opacity0, confirming scaled displacement 21px/16.333px at 630px parent. Repeated entrance observed at translate(483.004px,193.917px), opacity1, z1 behind the card. Mobile frame345 × 177.609 remained initialized. Desktop restored. Reduced motion/lifecycle behavior covered by tests; OS preferences unchanged.

Proof: [shared-loader Preview](assets/2026-10-03-instant-virtual-cards-short-exit.png).

Outcome: **middle saved — ready for user publication**. No domains selected or published. User publishes next; live-site verification pending.
