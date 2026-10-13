# Cards, your way staging release

User authorized publish to staging on 2026-10-13 (Europe/Zagreb). Playground remains a draft; homepage and production changes remain outside scope.

Preparation based on fetched current origin/main `f4fa75b87c8a5ce36df0decdcfe04dfe83ecdf3f`. [PR #51](https://github.com/gorankomar/stitch-animations/pull/51) includes all chat-owned source, original Figma assets, complete local previews, component notes, tests, shared-loader/build registrations and fresh generated distribution files. Unrelated untracked production release note was preserved outside the commit. Preserved original Consumer Verification portable embeds removed by the aggregate builder.

`npm run validate:release` passed: 137 tests, every shared entry/embed built, Product Variety/wallet swap and Country Flags included, local module/CSS dependency closure verified. Both permanent site and Playground footer routers were read directly and preserved. New component has only a style embed; no redundant inline/feature runtime was introduced.

## Verified activation

Exact merged/staging SHA: `484ec3e9b144318935364d96806ed10a0b148cca`. [Workflow run 38454535156](https://github.com/gorankomar/stitch-animations/actions/runs/38454535156), upload job `115493736654`, succeeded. Logs confirm all 219 immutable release files verified for the staging origin, followed by staging activation at 21:25:15 Europe/Zagreb, completed invalidation and served loader verification.

Previous staging SHA: `9e3d95d3041f371b7e42f81c9e423e75b3940724`. Independent CloudFront read confirms the staging channel imports the exact new SHA, with text/javascript, no-cache/max-age=0/must-revalidate, and Access-Control-Allow-Origin:* for https://stitch-website.webflow.io. Production channel is byte-identical to its pre-release state and still imports `e07e43bec7691727813d76d6140a3a1a5724f8a0`.

## Webflow Preview verification

Cards, your way is first in Playground Features Wrapper, component `c3910817-cc63-ac0c-ac92-4ff87c0c0618`, instance `c3910817-cc63-ac0c-ac92-4ff87c0c0617`. The active Preview frame loads the permanent staging page-all-lite router. Root has data-cyw-ready; one generated recognition group and six colored-ring arc paths are mounted. Face/circle/check loop observed visually, including rapid ring phase. Final reveal wrappers remain opacity:1/transform:none. Pointer sampling: Pending translated 12.35/-9.98px while Complete translated 2.27/-1.84px at the same pointer position; dots canvas width 1260 at a 630px parent. Existing Light Credit Card internals and appearance are unchanged.

Mobile 393px Preview: root width 345px, frame height 213px, correct 520:321 proportions, four visible objects, one mounted ring loop. Desktop breakpoint restored afterward. Country Flags track transforms changed across two samples. Product Variety ready class is set; blue/gray translations are ±39.054px, blue z-index:2 after pointer entry. State tests cover reduced motion and shared lifecycle; no fresh OS-level reduced-motion preference change was made.

Existing unrelated Webflow React property warnings, tracking fetch failures, missing navbar/page-inline targets and Webflow compilation warnings are present; no Cards runtime error was observed. Original fallback was verified in Designer/local preparation and remains native markup/styles.

Evidence: [desktop staging Preview](assets/2026-10-13-cards-your-way-staging-desktop.jpg), [mobile staging Preview](assets/2026-10-13-cards-your-way-staging-mobile.jpg).

Playground page metadata re-read after verification: draft:true. No Webflow publication was performed or required: new markup is restricted to the draft Playground, and staging channel activation enables Preview. No homepage modifications or production promotion. Outcome: **staging animation release verified**.
