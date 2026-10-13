# Deposits — Digital Wallet staging release

User authorized staging on 2026-10-13 (Europe/Zagreb), after approving the rebuilt illustration and requesting Added z-index:7, fade z-index:6, a 1-second blue-fill fade and 0.5-second rest before restarting the pulse.

Release preparation is based on fetched `origin/main` `3f9ee0ba85392a382dfb9035ba437d5289fdfea0`. All approved chat-owned source, exact connector asset, local previews/generator, component notes, draft evidence, tests, loader/build registrations and fresh distribution outputs are included. The pre-existing unrelated production release note remains outside this change.

`npm run validate:release` passed: 128 tests, complete shared build and Product Variety/wallet swap plus Country Flags/dependency verification. Aggregate build removes two existing Consumer Verification portable artifacts; preserved their original committed contents.

Saved site and Playground footer code were read directly: permanent environment routers and `stitch-code-page-loader` guard are intact. Previous served staging pointer: `e07e43bec7691727813d76d6140a3a1a5724f8a0`. No router edits or component inline runtime were introduced.

Webflow edits are restricted to the new Playground illustration/screen and their own styles. Homepage and established component definitions are unchanged. Animations Playground must remain draft and will not be published. No Webflow publication is needed: the affected markup exists only in the draft Playground; staging channel activation enables its Preview animation.

## Verified activation

Merged [PR #50](https://github.com/gorankomar/stitch-animations/pull/50). Exact staging animation release: `9e3d95d3041f371b7e42f81c9e423e75b3940724`. [Workflow run 38434342969](https://github.com/gorankomar/stitch-animations/actions/runs/38434342969), upload job `115424329392`, succeeded. Logs confirm 217 release files checked for the staging origin; staging activated at 18:55:33 Europe/Zagreb with invalidation completed and served loader verified.

Independent CDN read: HTTP 200, text/javascript, wildcard staging CORS, no-cache/max-age=0/must-revalidate, exact new release import. Published staging homepage retains the permanent router. Production still imports `e07e43bec7691727813d76d6140a3a1a5724f8a0`; production was not promoted.

Refreshed Playground Preview: one staging shared loader, `data-dw-ready` set, 28 pulse samples, moving rings, completed $25,450.00 counter. Native stacking is Added z-index:7 and fade z-index:6. Live sampling observed blue fill opacities 0.834343, 0.567343, 0.401143 and 0.115743, then zero-opacity gray rest before restarting. Unit tests verify exactly 1-second fade and 0.5-second rest; shared stage handles hidden/offscreen clocks and reduced motion. No fresh OS preference change was performed.

393px mobile Preview: component width 345px, correct proportions, mounted animation, final counter and stacking preserved. Desktop breakpoint restored. Country Flags transforms changed across samples; Product Variety swap moved blue/gray cards and set blue z-index:2. No Deposits setup warnings observed. Existing Webflow React property warnings, unrelated tracking fetch failures, missing navbar/page-inline targets and Webflow compilation warnings remain outside this change.

Evidence: [desktop staging](assets/2026-10-13-deposits-wallet-staging.jpg), [mobile staging](assets/2026-10-13-deposits-wallet-staging-mobile.jpg). Playground metadata re-read: draft:true. No Webflow publication was performed or required; new illustration remains Playground-only. Homepage markup/component definitions remain untouched. Outcome: **staging animation release verified**.
