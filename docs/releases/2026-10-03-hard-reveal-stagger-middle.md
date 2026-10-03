# Hard Reveal — overlapping stagger middle save

2026-10-03, Europe/Zagreb. User requested overlapping right-to-left entrances for Instant Virtual Cards and this behavior as the Hard Reveal default. Continues the previously authorized GitHub/middle workflow.

Shared Hard Reveal now defaults to 100ms between starts. Explicit target/group data-reveal-stagger and controller timing overrides take precedence; Soft Reveal retains its existing default. Externally clocked Instant Virtual Cards uses the same exported constant. The four elements start at0/100/200/300ms and settle at1.07s with current770ms duration, then the cursor starts. Cursor choreography,1.5-second hold and3-second concealed rest preserved.

Merged runtime SHA: `274a904a8338d03e5c7c00ed8de5f80c777e10e2` ([PR #24](https://github.com/gorankomar/stitch-animations/pull/24)), based on current main5f4b7fdf3c0c727f4b776b05726fe1e987f097d6. Isolated checkout preserved unrelated work. Shared effect, illustration source, tests, documentation and fresh dist included.

npm run validate:release passed all70 tests, full shared builds and dependency closure including Product Variety/wallet swap and Country Flags. Tests verify overlapping progress on all four tracks,100ms default, explicit250ms/0ms overrides, final arrival and unchanged cursor lifecycle. All79 CDN runtime JS/CSS files matched local bytes.

Site settings Footer code and Playground page-settings footer saved at https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@274a904a8338d03e5c7c00ed8de5f80c777e10e2/dist/page-all-lite.js, replacing cc36aebca08ca74baf9e6bddeb5e25f8cb19499c. Complete site footer read-back after reload exactly matched SHA-only replacement; unrelated code retained. Preview contains exactly one shared loader at the new SHA and zero scripts inside Instant Virtual Cards. Component runtime embed read-back remains empty.

Actual desktop Preview observed all four transforms active simultaneously: x0.0375659/3.47255/6.62968/15.5486px, confirming overlapping entrances. Root ready=true, desktop630×324.331. Mobile345.2×177.713 remained initialized; desktop restored. Cursor continued its loop afterward. Reduced-motion/lifecycle checks covered by tests; OS settings unchanged.

Proof: [Preview](assets/2026-10-03-hard-reveal-stagger.png).

Outcome: **middle saved — ready for user publication**. No domains selected or published; user publishes next and live-site verification pending.
