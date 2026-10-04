# Rules Flow — middle saved

- Date: 2026-10-04, Europe/Zagreb.
- Request: push and merge the approved illustration and complete Webflow middle delivery. No domains published; publication and served-site verification remain with the user.
- Release PR: https://github.com/gorankomar/stitch-animations/pull/30 (merged; both reported GitHub checks passed).
- Full merged release SHA: `95e9aeb18eb4fbec627b3b731cddccf1cf1a6b0a`.
- Includes illustration source, original SVG assets, native markup/style mirrors, component notes, browser verification, shared entry registrations and fresh distribution artifacts.

## Saved loaders

Previous URL in site-wide Footer code and Playground page settings:
`https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@8a6457b36b338d35f961877de66879c6c3edc795/dist/page-all-lite.js`

New URL saved in both locations:
`https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@95e9aeb18eb4fbec627b3b731cddccf1cf1a6b0a/dist/page-all-lite.js`

Only the existing SHA was replaced. The complete 11,632-character site Footer code was read through the editor clipboard before editing, then read back after reload and matched the replacement exactly. Playground code was reopened after Save draft and matched exactly. Unrelated custom code and duplicate-loader guard were preserved.

Cleared the redundant Rules Flow inline animation embed `857447c9-955c-6b25-3042-ea719dafcd78` in component `857447c9-955c-6b25-3042-ea719dafcd45`; code settings read back as empty. Native styles, assets, markup, reveal attributes and the style-only fallback embed remain. Preview contains one shared external loader at the chosen SHA and zero scripts inside Rules Flow. Other embedded runtimes were inspected; those for features not resolved by page-all-lite and unrelated scripts were retained.

## Verification

- Fetched current origin/main `3f93301a87ca06ccdca3ec4acaeec018de2390a7`; it matched the chat starting revision. Release checked in the isolated managed rules-flow-release checkout; no incoming conflicts or unrelated working-tree edits.
- `npm run validate:release` passed: 76 tests, all shared builds/embeds and dependency checks. Product Variety/wallet swap and Country Flags retained. Existing Consumer Verification distribution embeds preserved.
- Local browser suite passed the 50% viewport trigger, staggered Soft entrances, Hard opacity preservation, pointer follow, responsive simultaneous instances, reduced motion, disposal, hidden/offscreen pause, and blocked/disabled/partial-failure fallback.
- All 84 committed dist JS/CSS files fetched from jsDelivr matched local bytes, zero failures.
- Custom-code-enabled Webflow Preview initialized Rules Flow through the shared loader after removing its inline runtime. Verified ready state, active entrance opacity, all 21 reveal targets visible at completion, and foreground pointer translation.
- Mobile 393px Preview: stage 345 × 177.609375px, ready state present, all reveal targets visible, SVG assets loaded. Desktop restored afterward.
- Screenshot evidence: `/tmp/rules-flow-middle-webflow.jpg` and `/tmp/rules-flow-middle-mobile.jpg` (session artifacts).

Outcome: **middle saved — ready for user publication**. No staging or production publication performed. Live-site SHA and interaction verification are pending publication.
