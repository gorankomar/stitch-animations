# Historical verification notes

Migrated on 2026-10-01. Original verification dates, commits, and current deployment state are unknown. These are historical claims, not checks performed during this change.

## src/embeds/COUNTRY-FLAGS.md

The draft page footer includes the compiled module. When shipping a new pinned
shared library that contains country flags, the inline preview can be removed.
The source module imports the existing shared animation-stage controller.


## src/embeds/COLLECTIONS.md

Verified in Webflow Preview on desktop and at 393px mobile: 258 × 232 stage,
loaded original assets, correct window dimensions, and alternating front/back
positions. Saved as draft without publishing.


## src/embeds/BALANCE.md

Verified in Webflow Preview at desktop and 393px mobile: exact final amounts,
correct ledger variant rows, no page or ledger overflow, hover lift, running pulse
animations, and a fresh entrance showing zero, intermediate, then final amounts.
Saved as draft; no site publish was performed.


## src/embeds/EMBEDDED-CONNECTIVITY.md

Changes are draft-only; this task does not publish the site.

## src/embeds/EMBEDDED-CONNECTIVITY.md

Verified in Webflow Preview at 1950px desktop and 393px mobile (345px illustration):
all four providers in original colors, restored SVG filters/gradients, outward
pulses, and no horizontal page overflow. Nine automated checks pass, including
card directions, decreasing ring response, remount deduplication, offscreen/tab
pausing, and reduced motion. Full production build passes.

## src/embeds/TRANSACTION-HISTORY.md

Changes are saved as a draft; no publish performed.


## src/embeds/README.md

Verified in Webflow Preview on desktop and 393px mobile: all 19 Audit and 18 Timeline
reveal elements complete, portraits load, variants align correctly, no page overflow,
and grid/fade/action controls independently remove their elements. Changes remain
unpublished; no production or staging publish was performed.

## src/embeds/README.md

Verified in Webflow Preview: current/local dates and offsets, both original assets,
 72 rows including loop copies, upward motion, and card-only pointer movement.
 Changes are saved as a draft and have not been published.

## src/embeds/LEDGER-SHEET.md

Changes are saved as a draft and are not published.


## src/embeds/CREATE-NEW-CARD.md

Verified: Webflow Preview at desktop and 393px mobile, code progression and
looping, five staggered pulses, original asset positions; local asset loading and
66 rows including loop copies. Existing 10 tests and the complete build pass.
Webflow remains a draft; no site publication was performed.


## src/embeds/PAYMENT-WALLET.md

Verified in Webflow custom-code Preview at desktop and 393px mobile: zero and
intermediate counter states, exact final amounts, all 15 completed reveals,
gentle pointer-follow movement, ABC Diatype body-font inheritance, logo height
matching its wrapper font size, all SVG assets present, and no graphic overflow.
The existing 18 tests pass; the portable runtime builds successfully.

