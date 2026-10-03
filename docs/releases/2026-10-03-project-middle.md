# Consolidated project middle release

2026-10-03, Europe/Zagreb. User requested all project changes pushed and merged, and confirmed that “Medium publish” means the middle stage: save Webflow loaders and leave publication to the user.

Runtime release: `a709e00369056281d0141f1228dec77c6bdd348a`, merged into GitHub main. Combined the complete local snapshot with current origin/main `b0ceb94`, retaining newer animation releases, the continuous Instant Virtual Cards cursor, and the 100ms Hard Reveal stagger. Remaining local work includes the realistic phone experiment, Omnichannel's shared marquee/rings refactor, component/effect documentation, and browser verification changes. Fresh shared distribution files are committed. Existing Consumer Verification portable artifacts were preserved after the build, which does not regenerate them.

Validation: `npm run validate:release` passed all 70 tests, full shared builds, and dependency closure including Product Variety/wallet swap and Country Flags. All 80 runtime JS/CSS files served by jsDelivr matched the merged release bytes.

Site-settings footer and Animations Playground footer now use:

`https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@a709e00369056281d0141f1228dec77c6bdd348a/dist/page-all-lite.js`

Previous release: `274a904a8338d03e5c7c00ed8de5f80c777e10e2`. Both saved code blocks read back exactly as the SHA-only replacements; all unrelated code preserved. Component embed read-back for Omnichannel, Income Verification, Revolving Credit, Email Statement, and Instant Virtual Cards contained styles or empty runtime embeds, with no redundant animation scripts to remove.

Webflow Preview compiled and served exactly one shared loader at the new SHA. The affected roots contain zero scripts. Omnichannel initialized, its three marquee transforms advanced, and its three rings rendered. Income Verification initialized through the loader; Revolving Credit pulses and Instant Virtual Cards initialized; Email Statement's sending state was visually observed. Omnichannel also initialized at the 393px mobile breakpoint with a 345px component width. Desktop restored. Reduced-motion behavior is covered by the release tests; OS settings were unchanged.

Evidence: [desktop Preview](assets/2026-10-03-project-middle-desktop.png), [mobile Preview](assets/2026-10-03-project-middle-mobile.png).

The original workspace was fast-forwarded to the merged release after confirming no changes since the release snapshot. Its previous local snapshot is retained in a named Git stash as a recovery backup.

Outcome: **middle saved — ready for user publication**. No domains selected or published. User publishes next; live-site verification is pending.
