# Deposits — Digital Wallet staging release

User authorized staging on 2026-10-13 (Europe/Zagreb), after approving the rebuilt illustration and requesting Added z-index:7, fade z-index:6, a 1-second blue-fill fade and 0.5-second rest before restarting the pulse.

Release preparation is based on fetched `origin/main` `3f9ee0ba85392a382dfb9035ba437d5289fdfea0`. All approved chat-owned source, exact connector asset, local previews/generator, component notes, draft evidence, tests, loader/build registrations and fresh distribution outputs are included. The pre-existing unrelated production release note remains outside this change.

`npm run validate:release` passed: 128 tests, complete shared build and Product Variety/wallet swap plus Country Flags/dependency verification. Aggregate build removes two existing Consumer Verification portable artifacts; preserved their original committed contents.

Saved site and Playground footer code were read directly: permanent environment routers and `stitch-code-page-loader` guard are intact. Previous served staging pointer: `e07e43bec7691727813d76d6140a3a1a5724f8a0`. No router edits or component inline runtime were introduced.

Webflow edits are restricted to the new Playground illustration/screen and their own styles. Homepage and established component definitions are unchanged. Animations Playground must remain draft and will not be published. No Webflow publication is needed: the affected markup exists only in the draft Playground; staging channel activation enables its Preview animation.

Activation and browser verification pending at preparation time; final evidence will be appended after the workflow completes.
