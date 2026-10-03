# Email Statement — Webflow draft

Stage: **saved to Webflow (draft)** on 2026-10-03. Source Figma node 379:1907, 540×278.

Created Animations / Email Statement component `3ba754fe-d3ee-efb7-0939-7087393ac481` and one instance `15e73f06-f1ab-ff6b-c79a-296f826d16fe` at the end of the Animations Playground features grid. Reuses Icon - Mail; two attachments share PDF File Type. New Check Circle preserves the exact blue vector. No publication, Git push/merge, or site/page loader URL change was requested or performed.

Native layout and appearance plus scoped in-component unsupported CSS were saved. Separate portable motion embed was read back and matched the final generated source exactly (5124 bytes). Scoped style embed was read back and matched exactly (832 bytes). The motion progressively adds a staggered attachment entrance and one confirmation pulse; component notes document the Global Styles tokens and lifecycle.

Actual Designer and Preview checks passed at 270/540/630px parent widths and 393px mobile viewport (345px parent), including two different-width instances at the same viewport. Both Webflow SVG assets loaded; all vector geometry and type scaled with the parent. Custom code disabled retained the complete static appearance. Live Preview showed both Reveal classes and a non-identity scale on the check wrapper, confirming script execution. Temporary test copies removed. Final Preview left open on the new graphic with custom code enabled.

Evidence: [actual Preview screenshot](assets/2026-10-03-email-statement-preview.jpg). The separate MCP element snapshot uses a renderer that visibly changes gradient compositing; it is not the visual reference. Compare the actual Preview screenshot to the Figma reference instead.

All 55 existing tests and the six new lifecycle tests passed. A shared build into a temporary output directory passed the shared-release dependency check, including Product Variety/wallet swap and Country Flags. No release SHA is selected for this draft; no live-site verification is claimed.

## Review revision: viewport reveal and shared CSS grid

Saved draft revision at user request. Threshold increased from 25% to 70%. All eight targets arm before entry: label at 0, card at one normal duration, then check, success text, attachment container, heading and PDF rows at successive global stagger intervals. With verified live tokens this is 0, 770, 1540, 1740, 1940, 2140, 2340, 2540ms. Different outer transforms preserve icon/component interiors. Sequence rearms only after full viewport exit. Actual desktop/mobile Preview showed label fully visible while card was beginning and inner contents remained hidden; completed state all eight opacities 1. Mobile parent 345×177.609; desktop parent 630×324.328. One CSS grid block, zero image elements in this illustration.

Both original grid image elements and uploaded assets removed (Webflow asset deletion is soft delete). Added Global Styles → Animation Components embed `489deebb-81c3-5d09-471d-1439e300992d`, containing the exact Window Graphic grid rule plus scoped Email Statement enhancement CSS. Removed only the migrated grid rule from Window Graphic, preserving its other rules. Removed the redundant Email Statement style embed. Local original grid exports removed; icons retained. No publication or loader URL changes.

Full npm test: 62 passed, including 70% threshold and replay lifecycle coverage. Preview custom code enabled for motion; static fallback checked with it disabled. Updated visual evidence: assets/2026-10-03-email-statement-grid-revision.jpg.

## Review experiment: sending dots → circle → check

Saved SVG/WAAPI sending experiment in the Email Statement draft motion embed. Three opacity-only dots, Email sending title, staggered accelerated circular travel, ring draw, check draw, original icon and Email sent restored. Existing reusable icon component unchanged. Global Styles → Animation Components adds only the transient overlay rules. Full viewport exit replays the existing 70% reveal; reduced motion, hidden tab and disposal cancel overlay/title state safely.

Actual desktop Webflow Preview recording: loading state, ring strokeDashoffset 0.0373 approaching completion, then check strokeDashoffset 0.702 approaching completion, then overlay removed/title Email sent. Mobile 345px parent: SVG overlay and its icon wrapper have identical bounding rectangles, including the existing entrance scale. Capture frames and exact sample timing converted to assets/2026-10-03-email-sending.gif; source states are actual Preview captures. Full npm test: 62 passed. Temporary shared build and check-shared-release passed; no loader changes or publication.

## Three-dot loop and clearer entry revision

User requested equal three-dot spacing, restored outer entrances, and an animated repeated sending/sent cycle. Saved updated draft motion and Global Styles Animation Components code. Extra apparent dot was a round stroke end cap; both ring/check paths now remain opacity zero until drawing. Three circles at x=12,20,28; orbital phases are 120 degrees apart. Full loop draws ring/check, crossfades title, holds sent, undraws check/retracts ring, returns dots to row and crossfades back to sending. Existing reusable icon definition remains unchanged.

Outer entrances: 70% threshold, two global stagger settling delay, label first then card, each full-duration opacity fade and larger proportional translation. Actual desktop captured label opacity .758/card 0, then card .065/.260. Mobile captured label .281/card 0, parent345px, exactly three dots and equal coordinates. Recorded two full sent → sending cycles without re-revealing outer parts. Actual replay: assets/2026-10-03-email-loop.gif. Full test suite62 passed. No publication or shared loader URL changes.
