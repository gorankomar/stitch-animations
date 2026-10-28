# Local icon playground

Preview: `/icon-playground.html` with `npm run dev`. Local experiment only; no Webflow edits or shared release registration.

Sources: Figma file `PCbd0DyXWAD2cDANtl7bpH`, nodes `414:1527` (globe), `414:1555` (transfers), `414:1562` (card upload), `414:1615` (credit card). Untouched SVG exports are in `assets/`; no lossy optimization was performed. All paths and source clipping are retained. Instance IDs are namespaced. Runtime splits existing move subpaths only for optional arrow motion.

Containers are 32, 48, 64, 96px. The three 16px sources scale from a 32px frame. Credit card retains its source 17:33 ratio, normalized to the same container sizes. Background #EFEFEF, stroke #3D3D3D, hover #0070FF, original stroke width 1.4 SVG units. Stroke width scales with the artwork.

Rising Color Soft Fill overlays a second copy of each stroke with a soft vertical alpha gradient, moving from below the artwork to above it. Reverse on pointer exit; keyboard focus has the same preview. The optional motion switch enables a globe turn, opposing transfer arrows, upload arrow lift, and card tilt. Reduced motion immediately changes color and disables extra movement.

Controls update live; reset restores defaults. Duration/easing read repository Global Styles tokens via shared helpers. Live Webflow Global Styles were not inspected for this local experiment; token parity with the live site remains unverified. No claim of production-ready timing is made.

Verification: browser rendered all 16 samples, measured 32/48/64/96 square containers, checked full-blue hover endpoint, inspected original/resting geometry and upload/credit-card rows, exercised checkbox and range keyboard controls, no browser errors. JavaScript syntax check passed. Original export root dimensions remain unchanged; outer scale controls rendered size. No release build required for this local-only page.

## Stroke Trace

The second dropdown effect draws hover-colored strokes over the original gray geometry using normalized SVG stroke dashes. Each disconnected source subpath has its own start/end. Transfer shafts run left-to-right (upper) and right-to-left (lower), using the original curve coordinates; at 70% of eased progress each shaft reaches its tip and splits into two simultaneous arrowhead branches. The upload arrow runs upward and branches at 65%. Other source subpaths trace in parallel in their exported direction. Exit reverses the same routes. Effect switching preserves current hover progress; reset selects Rising Color Soft Fill. Both effects share duration, colors, stroke width, optional motion and reduced-motion behavior. No source SVG exports changed.

Validation: targeted route tests verify branch timing and shared tip origins; browser checked dropdown selection and traced transfer artwork across the existing size grid.

Stroke Trace dims only the original base strokes from 100% to 10% opacity over the first half of the selected hover duration, interpolated linearly on an independent opacity clock in both directions. The hover-colored trace remains fully opaque. Rising Color Soft Fill retains full base opacity. Reduced motion applies the endpoint immediately.

Opacity timing correction: the base reaches 10% opacity halfway through hover, while the trace continues for the full duration. Exit begins restoring the base immediately over half duration, independently of trace progress and its primary easing.

## Full navigation icon set

All 14 icons from menu-popup `414:1521` are present, in Figma menu order. Display labels/descriptions live in `src/animations/icon-playground/icons.js`. Stable original asset keys map to semantic labels: globe → Overview, transactions → Transactions, card-upload → Deposits, credit-card → Virtual cards. New keys match their semantic labels: integrations, ledgers, cards, loans, applications, bnpl, onboarding, digital-loans, digital-wallets, routing.

All use both effects and all four container sizes. Source artwork is 16px for Platform/Solution items and 17px for Use Cases; outer scaling uses `size / (source width + 16)` to preserve the original 8px padding proportions, normalizing every container to 32/48/64/96px. Untouched new SVG masters are stored alongside the initial exports. All fourteen icons now have additional optional motion, described below. Trace routes for the new icons follow each exported subpath direction in parallel, preserving geometry.

Full-set verification: all 14 SVG files are non-empty, browser renders 56 samples and 14 correct labels/descriptions, measured every sample's container/artwork scaling, visually reviewed the entire narrow layout against the Figma menu artwork, and exercised Stroke Trace on Routing. No browser errors. Existing arrow-branch tests pass.

## Extra icon motion — creative first pass

Enabled by default for review; Reset also enables it. The checkbox controls the entire set; reduced motion disables all transforms. All movement uses the existing primary-eased hover progress and the selected duration, reversing on exit. Both color effects retain their independent behavior; opacity remains linear. Source files are untouched, and existing move subpaths are split only at runtime to isolate moving pieces.

- Overview: world turns 9°.
- Integrations: cube connection segments expand outward from their center.
- Ledgers: book leans 5° while the lower page edge shifts slightly left.
- Transactions: opposing arrow groups move apart.
- Deposits: upload arrow lifts.
- Cards: card swipes right with a 6° tilt.
- Loans: wallet top edge lifts and tilts open.
- Applications: form lines slide in opposing directions.
- BNPL: shopping bag swings 7° as its handle lifts.
- Onboarding: magnifier moves up and left across the document.
- Digital loans: mouse scroll mark moves down while the mouse lifts slightly.
- Virtual cards: card tilts 7°.
- Digital wallets: clasp slides outward.
- Routing: circular nodes expand 16% around their centers.

Implementation: `extra-motion.js` owns per-icon geometry hooks, movement labels and transforms; `index.js` owns hover progress and color. Layout sizing stays on the SVG root; internal pieces have independent transforms shared by base, rise and trace layers. Motion descriptions appear beneath semantic labels only while enabled.

Verification: exercised 96px hover for all fourteen icons in the browser; each produced its intended whole/part transform. Confirmed the three Onboarding magnifier layers have identical transforms in Stroke Trace. Checked toggle disable restores neutral transforms. Existing arrow trace tests and JavaScript syntax checks pass. Local experiment only; no release or Webflow changes.

## Motion review — 2026-10-19

Latest review supersedes the first-pass values above. Whole-icon planar left/right tilts are removed throughout. Overview spins its two longitude curves through a full turn (horizontal projection around the globe center); the outer circle/equator stay fixed. Cards and Virtual cards use matching 180° vertical-axis perspective flips. Ledgers opens its cover 38° around the left edge, retaining the page edge. BNPL uses a small lift rather than rotation; it remains open for later direction.

Integrations retains outward connection expansion; its center's top-left/top-right branches additionally grow 55% and move outward, and its lower branch lengthens 45% downward. Deposits dips .35 design units before rising to -.6 units, less than the earlier -1.1 lift. Applications retains opposing line travel but shortens both lines by 18% during hover, preserving edge clearance. Routing retains 16% node expansion; top-right/bottom-right nodes additionally travel .8 units right and the left node .8 units left. Their connecting path ends extend along with them; middle-right node stays in place.

**Transactions is user-approved and locked.** Preserve its present motion and trace branching unless explicitly asked to revise them. Onboarding, Digital loans and Digital wallets remain unchanged. Loans retains its accepted opening/lift, with the small planar tilt removed per the global no-tilt request; connection/graphic cleanup is deferred at user request.

Validation: five focused tests pass (deposit sequencing/lift amount, card flip/no whole-icon planar tilt, globe curve projection, existing arrow branching). Browser checked globe internals, card flip, book opening and routing line/node movement with Stroke Trace; no console errors. Primary easing still comes from the repository's local Global Styles token, and base opacity stays on its independent linear track.

## Follow-up review — globe, Integrations, Ledgers

Supersedes their previous motion settings. Overview now uses a longitude sweep: the two internal curves change curvature in opposing phases, preserving at least 55% of their original width instead of flattening through zero. The outer circle and equator remain fixed. Geometry is morphed directly, keeping all stroke widths constant; the two curves return exactly to their exported shapes at the endpoints. This is a stylized rolling motion rather than an edge-on physical globe rotation.

Integrations' central three branches now extend their path endpoints away from a fixed central junction. No CSS scaling remains on these branches, so their stroke weight matches the surrounding segments and follows the stroke slider. Ledgers has **no extra motion**; its shared hover color effect remains. Card flips and all other motion settings are unchanged, including locked Transactions.

Verification: seven focused tests pass. Browser confirmed uniform 1.4-unit Integration strokes with unscaled center geometry, static Ledgers geometry, and matching globe base/rise/trace paths during the longitude sweep. No browser errors.

## Eight shared color effects

The dropdown now includes the original Rising Color Soft Fill and Stroke Trace plus:

- Color Sweep: soft horizontal gradient replaces base color from left to right.
- Center Bloom: radial hover-color gradient expands from the icon center.
- Color Pulse: one soft hover-color band passes along every source path. Reuses canonical `createSoftPathPulse`; normalized progress controls its one-pass duration, with lazy allocation on first selection. Base strokes fade linearly to 55% during this effect, and return to full opacity on exit. Pulse disappears at the end; re-enter to replay.
- Soft Glow: hover-color strokes fade in linearly with a tight .45-unit Gaussian halo.
- Ink Spread: normalized stroke dashes grow symmetrically from the middle of each source path toward both ends.
- Highlight Pass: hover color fades in over the first 35% of duration, followed by one soft white sheen through the remainder. Re-enter to replay.

Implementation: `color-effects.js` owns added gradient/filter/overlay layers and pulse controllers. All copied layers retain semantic part classes so extra motion and geometry morphs remain aligned. Instance IDs are unique; root sizing and SVG masters are unchanged. Existing motion bindings preserve source geometry across lazy pulse initialization to avoid compounding globe/Integration morphs. Effect switching restarts hover/focus progress; stationary icons remain at rest. The selected duration and both color controls work across all eight effects. Reset selects Rising Color Soft Fill.

Reduced motion uses immediate color endpoints, suppresses pulse travel and the highlight pass, and retains the existing suppression of extra icon transforms. Opacity uses linear progress; gradient boundaries/drawing use the existing primary easing. No global style tokens, shared releases or Webflow drafts were changed.

Verification: browser rendered and inspected all six added modes on representative globe, Integrations, Ledgers and Transactions samples; no console errors. Canonical pulse successfully initializes across all 56 samples. Existing motion/arrow tests remain the regression checks for approved extra motions.

## Cards and Virtual cards — three-card stack

Replaces both vertical card flips. With Extra icon motion enabled, the original card remains foremost and moves down 2.2 design units; two full-artwork copies appear behind it at 0 and -2.2 units. This gives equal spacing around the resting center. Hover out reverses the same translation and hides the collapsed copies. Motion uses primary-eased hover progress; copy opacity uses independent linear progress. Reduced motion or disabled extra motion shows the original static card only.

`card-stack.js` wraps the live artwork and references it twice with instance-local SVG use elements. All eight existing color effects, including lazily initialized pulse samples, are reproduced in the copies. Each face has an opaque container-colored backing derived from the supplied closed outline, so overlapping card contents do not show through. Source stroke geometry is unchanged. No flips/rotation remain on either card icon.

Verification: eight targeted tests pass, including balanced stack spacing, collapsed offsets and absence of card flips. Browser inspected Cards and Virtual cards at 96px, measured final offsets -2.2/0/+2.2, exercised Stroke Trace and Color Pulse, and checked the 32px stack. No browser errors observed.

### Stack refinement: solid, progressively narrower rear cards

Supersedes copy-opacity behavior above: both rear cards are fully opaque whenever the stack is open; there is no stack fade. They reveal through the original card as spacing opens, and disappear only after collapsing. The middle card narrows to 92% and the top card to 84% around the shared horizontal center; front card stays full width. Horizontal narrowing follows the same movement progress as spacing.

All face paths use SVG non-scaling strokes so the rear cards retain the foreground pen weight despite horizontal compression. The common root CSS scale still sizes the complete icon consistently. Source paths, existing color-effect alpha tracks and original stroke slider are retained; lazily generated pulse paths inherit the non-scaling stroke behavior.

Verification: both card types visually inspected at 96px; rear copies report opacity 1 and widths .84/.92; source strokes report non-scaling-stroke with the current 1.4-unit pen. Two stack geometry tests pass; browser reports no errors.

### Live stroke-slider inheritance correction

Card face source paths now declare `stroke-width="var(--stroke, 1.4)"` directly. SVG use instances do not reliably match the outer `.icon-art path` selector inside their reference trees; without this authored presentation attribute, their strokes could fall back to a fixed default. Both rear faces now resolve the same live custom property as the foreground, including subsequently cloned pulse layers. Non-scaling stroke behavior still protects pen weight during horizontal narrowing.

Browser verified Cards at both slider limits (.6 and 2.6) and Virtual cards at 2.6, visually confirming rear stroke changes; the referenced source reports 2.6px from the live variable. Reset restored the 1.4 default. Stack tests pass.

## Loans hinge restoration and rotation clarification

User clarified that internal-element rotations are welcome; the restriction concerns rotating the entire icon. Loans now rotates only its back panel by -4° around the actual left hinge at (2, 3.33333), replacing its upward translation. The wallet body and closure button remain fixed. The panel's closing endpoint is inverse-rotated in local coordinates so it remains attached to the fixed rim at (11.3333, 4.66667). Thus the left hinge stays connected and the right closing segment lengthens naturally rather than leaving the screenshot's gaps. No source SVG is edited, and no thick strokes/overlap patches conceal the joins. All shared effect layers receive the same panel geometry and transform.

Verification: browser reviewed at the user's 0.6 stroke setting; base and all effect panel layers have identical d/transform/origin. Ten focused tests pass, including fixed-rim endpoint preservation at intermediate opening amounts. Left/right join appearance remains available for the user's next visual review.

### Loans opening amplitude for menu-size readability

Increased back-panel opening from 4° to 10° so the right-hand corner rises more visibly at the site's 32px container size. `WALLET_OPEN_DEGREES` is the single value used by both panel rotation and fixed-rim endpoint compensation. Hinge/body remain stationary. Endpoint continuity tests pass at intermediate and full opening, and the 32px preview was reviewed in-browser.

## Stronger motion at 32px — latest review

User explicitly authorized stronger Transactions motion, superseding its prior amplitude lock only: opposing travel increases .8 → 1.4 units; direction and trace branching remain approved. Deposits anticipation increases .35 → .85 units downward and uses 40% of eased progress before rising; final -.6-unit position is unchanged. BNPL bag lift increases .6 → .95 units during its arc and handle lift .6 → 1.05 units. Onboarding now anticipates down-right by (1, .8) units before returning to the same (-.8, -.65) final offset. Digital loans scroll travel increases 1.1 → 1.8 units and body lift .3 → .45 units.

Routing horizontal node travel and connecting-line extensions increase .8 → 1.35 units in both directions; circle expansion remains exactly 16%, with no additional circle growth. Cards, Virtual cards, Loans, Applications and Digital wallets are unchanged.

Verification: eleven focused tests pass, including unchanged anticipation endpoints. Browser exercised all six revised motions at 32px; transforms confirm stronger travel, routing circles retain their existing scale track, and no console errors occurred.

## Globe reference and smoother anticipation

Reference inspected in browser: https://www.flaticon.com/free-animated-icon/ssl-globe_19014325 — fixed outer globe with traveling meridians. Overview now rolls its meridians through staggered phase projections instead of moving both curves in a shared shrinking/sweeping phase. An additional traveling meridian supplies grid continuity during the turn; its visibility ramps linearly at the ends, leaving the exact supplied static shape at rest and full hover completion. The reference asset is not downloaded or reused. Source outline/equator and pen width stay fixed.

Integrations outer expansion increases from 10% to 12.5% of each segment's center offset. Center branches extend .9 horizontally/.5 upward and .95 downward (previously .7/.4/.75), preserving the fixed junction and stroke weight.

Deposits and Onboarding now use the raw hover clock for their anticipation sequence: 34% eased first move, 10% stationary dwell, 56% eased second move. Each leg uses a symmetric combination of the primary token curve and its time-reversed counterpart, giving acceleration/deceleration on each leg without applying the primary ease twice to the overall timeline. The dwell is about 77ms at the default 770ms duration. Previous amplitudes and final endpoints are preserved. Other extra motions and color effects retain their existing timing. Hover exit reverses the same continuous track.

Validation: twelve tests pass, including exact pause samples and soft arrivals/departures. Browser reviewed rolling globe, Deposits at extended duration, and Onboarding at normal duration/32px; no console errors. Transactions unchanged in this pass.

## Globe boundary correction from recorded review

The local runtime equator now ends exactly at the outer circle's centerline intersections (1.33331, 8.00036) and (14.6666, 8.00036), replacing the source export's protruding x=1/15 endpoints. Untouched SVG master remains retained. Both pole coordinates stay exactly fixed while meridian control points move; no endpoint scaling or drift occurs.

Rolling meridians are limited to 4.8 units horizontal excursion, keeping them inside the 6.6666-unit outer rim. Rear meridians are softly occluded when they approach another longitude, avoiding nearly coincident strokes combining into a heavy band. Visibility is applied at dedicated per-meridian groups, consistently across base, color overlays and pulse samples; the exact static globe is restored at rest and full completion. Added meridian still hides at both endpoints.

Validation: thirteen focused tests pass, including bounded longitude excursion and overlap occlusion. Browser at 2400ms confirms corrected equator endpoints, identical pole endpoints across all curves, and clean rim intersections in the rendered hover. No source asset or unrelated icon changes.

## Third globe meridian: disappear behind the rim

Replaces its arbitrary endpoint fade and restricted excursion. The third longitude now derives from the original right outer-circle curve and projects all the way to either rim (±6.66663 units). It stays fully opaque throughout its travel. A per-instance luminance mask matching the outer circle's stroke occludes it at the rim, so it disappears through geometric overlap rather than fading while still inside the globe. It is hidden only at the exact rest/completion endpoints where its curve coincides with the rim. Pole coordinates and corrected equator remain fixed; other two meridians retain their prior bounded travel.

Mask stroke width follows the same live stroke variable as the icon, and all color/pulse layers share the mask. Browser checked slow 96px hover, full-opacity mask application and retained equator endpoints, with no console errors. Focused globe tests verify rim reach and absence of interior timed fades.

## Global icon effects × extra icon motions: compatibility correction

UI names the shared dropdown **Global icon effect**. Fixed the actual Integrations mismatch: hidden effect layers return empty `getBBox()` results, which previously produced different expansion translations from visible source strokes. `bindExtraMotion` now measures each visible base piece once and shares that box with every matching effect layer, including lazy pulse samples. No per-effect hidden-path measurements determine expansion offsets.

Render order now updates extra motion/geometry and the card stack before measuring artwork or rendering spatial effects. Rising Color Soft Fill, Color Sweep, Center Bloom and Highlight Pass derive their coverage from live artwork bounds. Completed spatial fills explicitly use solid hover color, ensuring expanded endpoints remain covered. Color Pulse refreshes current path length, span and speed after geometry changes, preserving a normalized one-pass duration across lengthening center branches, moving globe curves, wallet connections and routing connectors. Canonical soft-path-pulse exposes optional `refreshGeometry(span,speed)`; existing consumers are unchanged unless they call it.

Validation: browser exercised all 112 combinations (eight global effects × fourteen icon motions) at the actual menu size of 32px, comparing every matching base/effect part's live path geometry and transform. Zero mismatches after the source-box correction; no browser errors. Additional visual checks cover Integrations with Trace at 96px, Bloom at 64px and Pulse at 48px. Eighteen focused tests pass, including new hidden-layer measurement and expanding pulse-route regressions. Existing accepted extra motions are preserved. Local-only work; no shared release or Webflow edits.

## Thin Stroke Trace completion seams

At 0.6 stroke width, Loans' animated rim and Routing's circles could retain tiny gaps when a normalized full-length dash remained on the completed, morphed SVG path. Completed trace segments now switch to `stroke-dasharray: none` with zero offset, producing a genuinely solid final stroke. Partial/reversing segments restore the normalized drawing dash, so hover-out and arrow branching behavior remain intact. Other global effects and motion geometry are unchanged.

Validation: regression test covers completed/near-completed solid state and reverse partial state. Browser at 0.6/Stroke Trace/extra motion on confirms all four Loans traces and six Routing traces finish undashed, with closed joins visible in the rendered 96px samples.

## Playground page usability

Heading: “Small icons. Colossal motion.” Hover activation now belongs to `.sample`, including its label/padding area, so the cursor can stay clear of the icon. Keyboard preview remains on the actual button's focus-visible state. Parent enter/leave controls the same animation clock; transitions between the button and label do not restart it.

Controls and the live global-effect description share a sticky wrapper at top:0, above scrolling samples, with the same #FAFAFA background as the page. A single wrapper border sits below the description. Narrow layouts arrange controls in two columns to leave more space for icons. Verified at a narrow viewport: sample hovered with button not hovered, and toolbar top remains exactly 0 after scrolling to Routing; description stays inside the pinned panel.

Client sharing discussed only: existing repository build/workflow publishes animation bundles, not this HTML playground. A separately configured standalone build/static host (e.g. GitHub Pages) would be needed for a durable client link. No push, hosting setup, or deployment is authorized by that question or performed in this change.

## Ledgers — first opening-cover and page pass

User requested replacing static Ledgers with a book-opening experiment, permitting geometry changes. The supplied SVG master remains untouched. Runtime `ledger-motion.js` lifts the cover's right-hand points via y shear (0.13 × distance from left spine), keeping x=2.66667 fixed and retaining the original cover curves. This gives a slight opening without rotating the whole icon or changing stroke weight. A lower backing curve and small page corner are added behind the cover; the page slides down .35 design units. Added details reveal linearly over the first 22% of the hover duration and collapse/hide on exit. The original two-path appearance is restored at rest or when extra motion is disabled/reduced.

All new parts use semantic motion-piece hooks, participate in all eight global effects, and share the live stroke-width/color controls. The extra-motion label is “Cover opens, page slips.” Prior instructions to leave Ledgers static are superseded by this request.

Verification: twenty focused tests pass, including left-spine invariance, upward movement of both right corners and page travel. Browser compared source/effect geometry across all eight modes on Ledgers at 32px with 0.6 stroke width, with zero mismatches. Reviewed 96px original/hover and completed Stroke Trace; no browser errors. Ready for visual iteration; local only.

## Ledgers — user-sketched closed/open targets

Supersedes the earlier improvised cover/page geometry. References: Figma `504:1664` (closed) and `504:1668` (opened), file `PCbd0DyXWAD2cDANtl7bpH`. Untouched exports are retained as `ledgers-closed-master.svg` and `ledgers-opened-master.svg`. Closed state retains the supplied 16px artwork and existing container proportions. Open export dimensions are 16.2 × 17.3665, positioned at y=-1.3665 within the original 16px slot to reproduce Figma's overflow/inset while keeping the lower binding aligned.

The cover, lower binding, tiny hinge segment and paper use the actual exported path geometry at the endpoints. Between endpoints, 96 arc-length samples per path interpolate; closed contours are aligned by orientation/start position to avoid twisting. Endpoints use exact exported curves rather than sampled approximations. The sheet begins tucked 2 units left/.7 up from its opened position, then moves into the supplied rightward protrusion. Its visibility waits for 20% of raw hover duration and reveals linearly through 70%; closing reverses the same sequence. The small hinge segment hides at rest, preserving the closed sketch. No entire-icon rotation or stroke scaling.

Asset strings load locally through Vite raw imports; no temporary Figma URLs are used at runtime. All motion-piece hooks and global-effect geometry synchronization remain intact, including pulse length updates and completed trace seams. Extra motion disabled/reduced returns the closed sketch.

Verification: twenty-one focused tests pass. Browser compared the 96px open endpoint visually with Figma and checked every global effect on the new 32px book at .6 stroke, finding no path mismatches. No browser errors observed. Saved locally; no Webflow or release changes.

## Ledgers redraw — three always-present parts

Supersedes the prior two-sketch implementation and all delayed paper visibility. Updated Figma frame `504:1664` now contains Book Original, Book Closed and Book Opened. Untouched exports are saved as `ledgers-original-size-master.svg`, `ledgers-redrawn-closed-master.svg`, and `ledgers-redrawn-opened-master.svg`; earlier masters remain archived references.

Runtime maps the named `book-top`, `paper`, and `book-bottom` paths in the closed and opened exports to matching motion pieces 0/1/2. All three are always present at full extra-motion opacity. There is no paper visibility wrapper, fade, or delayed reveal. The paper is tucked into coincident cover/bottom geometry when closed; its path moves outward/downward as the three paths morph to the supplied opened state. Global effect alpha rules still apply uniformly, e.g. Stroke Trace dims the base strokes as on all icons.

The redraw's 11 × 14 closed centerline bounds are normalized to the original 10.66663 × 13.33337 bounds at x=2.66667/y=1.33333. Both states use the same coordinate mapping, with the opened export shifted up .5102 units to account for its Figma overflow inset. Stroke width is never scaled with this geometry conversion. Exact supplied normalized curves are used at endpoints, with aligned 96-point interpolation between states. Closed state is also the reduced-motion/extra-motion-off fallback.

Verification: browser measured closed bounds 10.6666279 × 13.333374 and paper opacity 1, without an opacity wrapper. All eight effect/geometry checks passed at 32px/.6 stroke with no browser errors; 96px endpoint visually reviewed against the new Figma sketch. Twenty-two focused tests pass, including size normalization, unchanged lower baseline and always-opaque paper contract. Local preview only.

### Paper upper-left endpoint refinement

The paper's hidden upper corner no longer interpolates from the book's top arc across the moving cover. Its closed runtime path is tucked against the right cover edge; the redundant arc remains supplied by book-top, preserving the closed silhouette. Paper now uses matched path commands/corners instead of unrelated arc-length samples. Its upper-left endpoint initially coincides with the adjoining top corner, then extends left smoothly after 30% of eased opening progress, reaching the exact supplied open endpoint. No paper fade, cover/bottom changes or source-master edits.

Verification: four focused ledger tests pass, including a real-open-export correspondence check that early upper endpoints coincide and later extend left with finite coordinates. Slow 96px hover reviewed in-browser with no console errors; full opacity retained.

## Transactions anticipation experiment

Explicit user request supersedes the earlier straight-travel behavior. Upper arrow first moves .65 units left while the lower moves .65 right, then they return outward to their unchanged final +1.4/-1.4 offsets. Sequence uses the same 34% anticipation / 10% dwell / 56% final-leg timing as the other anticipation motions. The final outward leg applies the resolved primary motion token directly to that leg's raw normalized time; it is not symmetrized or double-eased. All matching base/effect arrow paths share the transform; trace branch routing stays unchanged.

Verification: fifteen focused motion/trace tests pass, including exact pullback, dwell and final positions and direct primary-ease sampling. Browser observed negative/positive initial arrow offsets followed by exact +1.4/-1.4 endpoints; reviewed normal-speed 32px sample. Default 770ms controls restored. Local only.

## Directional rule for Transactions / Deposits / Onboarding

Hover-in retains the anticipation/dwell/final-move structure. The final leg now uses the resolved primary default easing directly for all three. Hover-out is a separate one-leg track from the actual current offset straight to zero with the same primary easing, over the selected hover duration; it never revisits the anticipation pose. Early exit and re-entry capture their current positions, avoiding jumps. Existing amplitudes, 34%/10%/56% entry phases, sample-hover and keyboard behavior remain. Global icon effects run their existing independent tracks.

`two-way-motion.js` owns the per-instance directional position clock; the shared effect layers receive the same explicit position through `bindExtraMotion`. The clock remains active until return completes even if a color track finishes first. Reduced motion/disabled extra motion renders zero offsets. Rule also recorded in motion-defaults workflow documentation.

Verification: parameterized tests cover direct primary-eased exits, monotonic return without second anticipation, interrupted entry/re-entry continuity, and exact final-leg primary easing for all three icons. Browser exercised all three at normal 770ms duration with no console errors.

## Compact sample hover area

Supersedes whole-sample hover activation. A sample triggers only when the pointer is within the button rectangle expanded by 20px, or directly over its size caption. Pointer movement in the remaining sample-column padding returns the icon to rest. Targets are naturally bounded by their sample columns to avoid neighboring hover overlap. Keyboard focus-visible preview remains unchanged; layout/spacing and all motion clocks are retained. Intro copy now describes icon/label hover.

Verification: browser at 32px confirmed the caption triggers, a point 15px above the button triggers with the button itself unhovered, and a point 43px above returns to rest even though the parent sample is still hovered. JavaScript syntax check passed.

## Resource icons — Blogs, Whitepapers, Developers guide, API references

Added four entries from Figma frame `505:1717` (file `PCbd0DyXWAD2cDANtl7bpH`) with the exact menu labels/descriptions. SVG masters are `blogs.svg` (image-indent-left), `whitepapers.svg` (file-06), `developers-guide.svg` (code-02), and `api-references.svg` (file-code-01). All exports are 16px, displayed with the existing 8px padding proportions at 32/48/64/96px. Total set: eighteen icons, seventy-two samples. Source files remain untouched.

First-pass extra motions:
- Blogs: image block lifts .65 units; adjacent short text lines shift .6 units in opposing directions; outer lines remain fixed.
- Whitepapers: two long text lines move down .35/.7 units; short introductory line extends .95 units by geometry, with fixed pen weight and document outline.
- Developers guide: brackets spread ±1.1 units; center slash slides down .45 units. No whole-icon movement/rotation.
- API references: internal brackets spread ±.55 units and lift .6 units together; file outline/fold stay fixed.

These use primary-eased motion and reverse directly with existing hover progress. Extra motion disabled/reduced restores exported geometry. Every overlay/pulse clone shares the named moving geometry, measured source boxes and stroke variable. All eight global effects and all controls apply.

Validation: browser visually inspected all four at 96px against the supplied Figma artwork. Checked all 32 new effect/icon combinations at actual 32px size with .6 stroke width: no source/effect path or transform mismatches. All 72 samples render; no browser errors. Existing 31 targeted regression tests pass. Local only; no hosting or release changes.

## Blogs — scrolling article experiment

Replaces the rejected image-lift/text-shift first pass. Original top/bottom horizontal strokes remain stationary as a window. The original image-left/two-text-line layout scrolls upward, followed by four longer text lines, then a mirrored image-right/two-text-lines-left layout. Scroll advances 10 units in the first 42% of hover, holds the text block through 58%, then advances another 10 units by completion. Each scroll leg uses the primary ease. Middle text lines extend left-to-right sequentially through geometry changes rather than stroke scaling/opacity, preserving pen weight and compatibility with global drawing effects. Hover-out reverses the article back to the exact original layout.

`blog-motion.js` owns page layout, scroll timing, typing geometry and a unique per-instance content clip. Every moving base/effect/pulse layer is clipped inside the fixed horizontal borders; the borders are never clipped or moved. Global spatial effects use the visible fixed window bounds rather than the offscreen article's full height. Extra motion disabled/reduced renders the original image-left layout, with later article sections outside the clip. Existing asset master remains untouched. Other resource icon motions are unchanged pending individual user review.

Verification: thirty-three focused tests pass. Browser reviewed scrolling and final image-right layout at 96px/2400ms, plus all eight global effects at 32px/.6 stroke. Every matching effect path, transform and clip agrees with its base; no console errors. Controls reset to default 770ms/1.4 stroke after review. Local only.

## Whitepapers — stack behind and below

Replaces the rejected text-spacing motion with the existing three-sheet stack implementation, configured in the opposite direction from Cards/Virtual cards. The front paper rises 1.3 units, middle stays centered, and rear moves down 1.3 units. Rear widths taper to 92% and 84%, with constant opacity and stroke width inherited from the playground slider. All global effect layers are reused through the same SVG face references. The two long text lines retain their exact vertical spacing; only the short first line extends slightly. Other resource icon motions remain unchanged.

Verification: all 34 focused regression tests pass. Visually reviewed the stack at 96px; exercised all eight global effects at 32px/.6 stroke and confirmed fixed text-line transforms and downward rear-sheet positions. Local only.

## Whitepapers — sideways spread revision

Supersedes the below-stack experiment, which crowded the tall paper outlines at normal stroke width. Two full-size rear papers now move symmetrically 3.2 units left/right; the original stays centered in front. No rotation, compression or opacity change. The original folded corner and rear corners are preserved, with the existing opaque paper backing hiding overlapping interior content. Long text lines remain fixed; the short first line retains its width extension. Cards and Virtual cards retain their existing vertical stack.

Verified in the local browser at 96px/1.4 stroke and 32px/1.8 stroke. Four stack layout tests pass, including symmetric side spacing and unchanged card defaults. Controls reset to 1.4. Local only.

## Whitepapers — plain distant rear sheets

Rear sheets now have independent plain rounded-paper outlines, without folded corners or text. Their geometry is 10.4 units tall versus the front sheet's 13.33, centered vertically; each moves 3.2 units left/right behind the unchanged original. Geometry is drawn smaller rather than scaled, retaining the identical slider-driven pen weight. Rear sheet groups participate in the original base/rising/trace/global effect setup and own lazy pulse layers, so all effects follow the simplified outlines. Opaque backing hides overlapped interiors. No opacity animation.

Verified default 1.4 stroke visually at 96px, and all eight effects at 32px: two plain rear-sheet groups retain identical outline geometry across their effect layers. Sixteen stack/extra-motion checks pass. Local only.

Whitepapers refinement: rear-paper corner control distances increased from 1 to 2 units for softer rounding closer to the front sheet. Side travel reduced from 3.2 to 2.8 units per sheet. Same height, plain outlines and slider-driven stroke retained. Visually checked locally at 96px/1.4 stroke.

## Whitepapers — Stroke Trace parent fix

The rear plain outlines originally had no routing identity. Their trace routes were appended to the central SVG instead of the moving rear groups, leaving two stationary traces over the front sheet while the rear base strokes faded out. Each plain outline now has an explicit side class; trace creation puts its overlay into the corresponding rear group. Thus movement, backing occlusion, visibility and collapse apply to the entire rear sheet including its trace. Backing clones strip the routing class.

Reproduced visually with Stroke Trace at 96px/1.4 before fixing. Verified both rear traces share their moving parent, complete with solid dash-free outlines at ±2.8 units, and hide/reset on hover-out; checked 32px/.6 as well. Nineteen focused trace/stack/motion tests pass. Preview left on Stroke Trace at default 1.4 stroke. Local only.

## API references — shared rear papers

API references now uses the same two plain, shorter background papers as Whitepapers: matching rounded corners, ±2.8-unit side travel, full opacity and slider-driven stroke width. Existing code-bracket motion and front artwork remain unchanged. Reuses the corrected per-paper trace parents and all global effect layers. Visually checked Stroke Trace at 96px/1.4 and exercised all eight effects at 32px; both rear groups retain plain geometry and their own trace. Local only.

## Developers guide — slash anticipation

Bracket travel remains unchanged. The centered diagonal slash now contracts to 50% length, briefly rests, then extends to 120% using the shared two-way anticipation controller (34% contraction, 10% dwell, 56% primary-eased final leg). Hover-out returns directly to its original length; interruption/re-entry remain continuous. Endpoint geometry changes around (8,8), preserving diagonal angle and constant stroke width without vertical translation or stroke scaling. Every global effect/pulse copy uses the same geometry. Disabled extra motion/reduced motion restores original length.

Verified at 96px/1.4 visually and all eight effects at 32px with matching slash geometry. Ten controller checks pass, including the new contraction/end-length and direct-return cases; existing extra-motion checks pass. Local only.


## Highlight Pass — slower, subtler sheen

Highlight travel now uses an independent track at three times the selected hover duration, retaining primary movement easing. Color change and extra icon motion keep their existing timing. White gradient peak opacity is 50%, tapering to zero at both edges. Reduced motion suppresses the moving sheen. Browser verified the selected effect and gradient stops 0/.5/0. Local only.

Highlight Pass endpoint refinement: highlight layer opacity remains full through 60% of spatial travel, then falls linearly with travel to zero at 100%. This multiplies the existing 50%-peak gradient, removing the lingering bright corner before the layer hides. Movement timing/easing unchanged. Browser confirmed final sheen opacity zero on API references. Local only.


## Digital wallets — angled card peek

Preserves clasp motion and adds a small rounded card outline with a payment stripe, tilted upward toward the right. Card rises three design units from behind the top edge, leaving only its upper portion visible. A unique fixed clip above the wallet hides the inserted portion without opacity animation or scaling stroke width. All base/color/pulse layers and the two trace routes live within the moving card group. At rest/disabled extra motion the card group is hidden. Primary eased hover progress controls emergence and collapse.

Visually checked 96px/1.4 and exercised all eight effects at 32px; each card keeps its clip and both trace routes in the moving group. Local only.

Digital wallets card-size refinement: widened the inserted card toward the wallet's left corner (left edge about x1.7 versus wallet x1.42), retaining its upward-right tilt and stripe. Enlarged outline geometry instead of scaling preserves stroke weight. Starts 1.6 units lower and rises 4.6 units to the same final top position, keeping the larger card tucked away initially. Visually reviewed at 96px/default stroke. Local only.

## Digital wallets — banknote revision

Replaces the payment-card outline and stripe with one plain tilted rectangular banknote, using square geometry with the shared rounded stroke join. The note's occlusion now follows the actual rounded wallet-body silhouette via an even-odd clip, rather than cutting off at the top horizontal line. This lets the visible left edge continue down to the curved wallet rim, eliminating the gap. Existing emergence timing, clasp motion and shared effect participation remain. Visually checked default 1.4 and thin .6 Stroke Trace. Local only.


Banknote entrance refinement: note starts horizontal (counter-rotating its authored 11.86-degree tilt around the upper-left corner), rises behind the wallet, then turns into the existing final angle during the final 35% of eased movement. Final shape/position, stroke and clasp stay unchanged. The complete base/effect/trace group shares the rotation inside the fixed wallet-silhouette clip. Local only.


Banknote final-position refinement: eased travel now ends 0.45 units farther right and 0.4 units higher. Horizontal entrance, final tilt, silhouette occlusion and wallet clasp motion remain unchanged. Local only.

## Digital wallets — clasp anticipation and second banknote

Clasp now moves 0.6 units left, briefly dwells, then opens 1.1 units right using the same two-way controller as Transactions/Deposits/Onboarding. Hover-out returns directly with primary easing; interrupted/re-entry motion is continuous. Two banknotes now emerge together: rear note offset .8 right/1.2 up and 7 degrees relative to front. Each has an opaque backing and its own color/trace/pulse layers, all within the existing moving and clipped note group. Foreground note retains the approved shape/position.

Twelve controller tests pass, including digital-wallets direct return and interruption. Visually reviewed two notes at 96px; checked 32px Stroke Trace with one route inside each note and clasp endpoint 1.1. Local only.


Banknote spacing/stagger refinement: rear note now sits .8 units right and 2.4 units above the front with matching tilt, leaving a clearer gap instead of converging outlines. Each note owns its emergence/rotation transform, with front delayed by 14% of the selected hover duration (about 108ms at default); both use primary easing and finish within the hover duration. Clasp controller unchanged. Local preview reviewed at 96px/default stroke.


Removed the rear/second banknote after user review. Keeps the front banknote exactly as configured, including its current emergence timing, final position and tilt. Clasp anticipation unchanged. Local only.

## Digital loans — outer-outline anticipation

Outer outline dips .7 units downward, pauses briefly, then lifts to its previous -.45-unit endpoint via the shared two-way controller. Hover-out returns directly, with continuous interruption/re-entry. Removed the old whole-icon lift; inner mark keeps its previous net +1.35-unit travel while outline now moves independently. All effect layers share the outline controller position. Twenty-six focused motion checks pass, including Digital loans return/interruption. Browser checked Stroke Trace overlay alignment and final positions. Local only.

## Playground control styling

Sliders now show a plain 1px #efefef rail matching icon backgrounds, with existing 16px blue circular thumbs and 24px interactive input height. Native range click/drag/keyboard behavior retained, with browser-specific thumb/track styling. Extra icon motion remains the native labeled checkbox internally, exposed as an accessible switch and styled with the same thin silver rail/round knob: gray left when off, blue right when on. Knob translation uses global primary easing/duration and color interpolates linearly; reduced motion removes transition. Browser checked switch off/on, corresponding motion state, range keyboard change, and reset. Local only.


Controls refinement: darkened thin slider/switch rails from #efefef to #ccc for visibility. Widened switch from 34px to 44px, increasing knob travel to 28px. Local only.

## Control panel alignment and dropdown polish

Controls now use shared label/control rows (16px label, 42px control) rather than mixed flex baselines. Duration/stroke values sit beside their labels, leaving the slider rails and switch rail centered on the same control row. Desktop uses seven columns with Reset at far right; tablet uses three columns and mobile two, with the effect selector spanning mobile width and Reset right aligned. Selector has a custom chevron, softer 11px corners, subtle border/shadow and blue keyboard focus ring, while retaining native selection/keyboard behavior. Color fields and Reset match the selector's height/corner treatment. Sticky description/divider retained. Browser visually reviewed mobile alignment and control semantics. Local only.

## Digital wallets — definition-path exclusion

Fixed the large rectangle/duplicate wallet outline in Stroke Trace: the banknote's even-odd clip path had been included in the artwork path collection, generating visible trace routes from hidden clipping geometry. Artwork initialization now excludes paths inside defs, clipPath and mask before recoloring or duplicating them. Clipping remains one untouched path; Digital wallets now has exactly three trace routes (body, clasp, banknote), with no clipping rectangle. Banknote/clasp motion unchanged. Reproduced visually before fix and verified clean 96px/1.4 output plus 32px/.6. Sixteen focused trace/motion checks pass, including definition exclusion regression. Local only.

## White Papers Alt — paper-copy experiment

Separate playground-only row beside existing Whitepapers; original icon and animation unchanged. Inspired by user-provided Flaticon Copy reference (https://www.flaticon.com/free-animated-icon/copy_8948314), with original locally constructed SVG geometry rather than downloaded animation assets. Four standard container sizes, all global effects and stroke/color controls apply.

`paper-alt-motion.js` owns two sheets, morphing corner geometry, staged transforms and content drawing. Corner collapses in first 18%; second sheet emerges below (16–30%); sheets separate while original shrinks (28–50%); right sheet flaps across through horizontal compression (52–78%), then gains text (72–90%) and its folded corner (84–100%). Layer order swaps during handoff; old sheet moves behind the foreground, restoring the initial visual composition. Opaque backings handle overlap; no opacity-based sheet appearance. Non-scaling strokes retain slider pen weight during the flap. Every effect/trace/pulse path belongs to its corresponding sheet. The alternative uses an independent extra-motion track at 3× selected hover duration; shared color timing remains unchanged. Hover-out reverses the experiment; extra-motion disabled/reduced restores the idle arrangement.

Verification: 32 focused motion/trace tests pass, including exact foreground endpoint equivalence and sequencing checks. Browser reviewed 96px endpoint and all eight effects at 32px, with no geometry mismatches across layers and five trace routes in each sheet. Local experiment only; no release or publication.

## Whitepapers Alt — exact single-sheet endpoints

Supersedes the first copy experiment. Label corrected to Whitepapers Alt. Start and end now render exactly one original Whitepapers sheet using the original SVG's five path strings, dimensions, corner and text locations. Extra sheet is hidden at rest; old sheet is fully concealed by completion. Corner unfolds, original shrinks to 60% and shifts left while a blank, unfolded copy emerges below/right; sheets swap draw order and positions without a flip. As the new sheet grows to original size and draws its lines, the old sheet's lines contract and it shrinks to 20% beneath the new sheet. Folded corner then reforms. No sheet opacity fades.

Regression checks compare every initial/final path directly against whitepapers.svg and verify single-sheet visibility, position, scale and absence of flip. Both pass. Browser confirmed the final foreground is the exact original geometry at identity transform and old sheet hidden; visually reviewed 96px output. Existing Whitepapers row unchanged. Local only.

Whitepapers Alt corner refinement: the unfolded upper-right corner now uses a cubic rounded profile matching the other paper corners, on both sheets. Radius grows from zero with unfolding; the inner fold shifts with that rounding so it stays within the outline. Fully folded endpoints still use exact original source geometry. Endpoint/sequence tests pass; visually reviewed unfolding at extended duration. Local only.


Blogs middle section refinement: removed one long text row, leaving two long lines and one shorter line. Increased vertical spacing from 1.78 to 2.67 design units across the same text-block height, reducing congestion at 32/48px and 1.4 stroke. Scrolling, drawing and other article sections unchanged. Local only.

## Whitepapers Flip — expanding-fold experiment

Separate local-only row; Whitepapers and Whitepapers Alt are unchanged. Inspired by the user's Flaticon Attachment reference (https://www.flaticon.com/free-animated-icon/attachment_14674206), with new SVG geometry/motion built locally. No whole-sheet swing, rotation or top-left pivot. Start/end use the original Whitepapers paths at original size.

`paper-flip-motion.js` advances a diagonal crease across the sheet over the first 64% of its timeline. The old sheet is clipped to the unturned region; the turned region is geometrically reflected over the crease to form an expanding fold surface. Its opaque backing covers content while its shared effect paths draw the fold edge. The folded surface clears away, leaving a blank folded sheet underneath. Original content draws back from 66–96%. One sequence per hover; hover-out reverses it, with reduced/disabled motion showing the static endpoint. Uses the existing independent 3× hover-duration experiment track and primary movement easing. All base, trace, color and pulse copies share each sheet/panel's geometry and clip. Definition geometry stays excluded from artwork.

Verified new crease/clipping sequence tests and existing Alt endpoint tests (four pass). Browser checked 96px endpoint and all eight effects at 32px: eleven artwork trace routes, zero traced clip paths, no geometry mismatches. Existing experiments remain separate. Local only; no release/publication.

## Whitepapers Flip — moving front, anchored fold revision

Replaces the rejected uniform diagonal sweep. Front sheet first shifts slightly left/down and tilts 7 degrees about its center, revealing a stationary folded sheet behind. Fold movement begins after 18%: local upper point remains (9.33333,1.33333), while its lower tip extends strongly down/left and right endpoint stretches down less. Fold surface shares the moving front sheet's transform, remains clipped to its page and covers its content. Front sheet subsequently exits left; rear sheet never transforms. New text starts at 28% and finishes by 76%, overlapping the departing front rather than leaving a long empty-page pause. Timeline extended from 3× to 4× selected hover duration. Shared color/other icon timings unchanged. No opacity fades.

Updated phase tests verify front motion precedes folding, fixed top point, growing lower tip, and content drawing during exit. Eight focused Flip/Alt/trace checks pass. Browser reviewed early front tilt at 96px/extended duration, and 32px Stroke Trace confirmed identical front/fold transforms, untouched rear transform and no traced clipping paths. Local only.

## Whitepapers Flip — fixed frame and connected fold

Corrects the prior rejected turn. A stationary wrapper now clips BOTH moving front sheet and fold surface to the original rear paper outline. The wrapper never transforms, so departing artwork cannot escape the paper frame. The front paper's outline now morphs its right crease attachment to the fold's moving right endpoint; the upper attachment remains shared. Its backing and content clip update with that silhouette. Original source geometry is retained at rest. Replacement text drawing delayed from 28% to 62%, with three sequential rows starting at 62/68/74% and drawing over 20% each. Existing stationary rear, slight front tilt and 4× duration retained.

Five Flip/Alt phase/endpoint checks pass, including shared crease attachment coordinates and delayed drawing. Browser inspected the fold mid-turn at 96px/extended duration and confirmed untransformed fixed clip wrapper contains front and panel; also exercised 32px Stroke Trace. Other Whitepapers variants untouched. Local only.

Whitepapers Flip synchronization refinement: replaced independent lead/exit/fold tracks with one primary-eased turn parameter across 0–78% of the sequence. Paper translation, modest scale change, clockwise rotation (up to 7 degrees), and asymmetric crease expansion are now proportional to that same parameter. Fold and front use identical transforms; fixed paper-frame clip remains untouched. Delayed sequential replacement-text drawing retained. Three Flip checks pass, including proportional motion/expansion and shared crease attachments. Browser confirmed identical front/fold transforms with positive clockwise angle inside untransformed clipping wrapper. Local only.

Whitepapers Flip fold-direction/content refinement: lower fold tip travel changed from 10.5 left/13 down to 1.4 left/10.5 down, so downward travel dominates rather than pulling the corner diagonally outward. Front-outline attachment remains linked to the same fold geometry. New text timing now follows actual turn/clearance: starts when shared turn reaches 72%, with sequential lines finishing as the front clears, rather than waiting for 62% of total timeline. Four Flip checks pass, including predominant downward travel and clearance-driven content. Browser confirmed completed Stroke Trace endpoint. Local only.

Whitepapers Flip fold-axis/loop refinement: fold upper-left and lower-left now share X throughout deformation; lower-left and lower-right share Y. Both left points shift only 1.4 units while lower edge moves 10.5 down, preserving the requested right-angle fold geometry. Front outline's upper start and both closing attachment coordinates use those same fold points. Cycle shortened from 4× to 2.6× selected hover duration (about 2 seconds by default). While hovered, the extra-motion sequence now restarts forward at its identical endpoint instead of stopping/reversing; hover-out restores idle without a reverse turn. Reduced motion suppresses repeat. Other variants unchanged. Four geometry/timing checks pass; browser checked equal point coordinates during a live turn. Local only.

Whitepapers Flip exit-edge repair (user recording 21.47.13): inspected extracted video frames and found the moving sheet's closing edge could descend beyond the lower-right arc, creating a retraced segment near exit. Crease bottom is now bounded by the paper bottom; lower-right radius contracts as the attachment approaches it, keeping the final vertical segment monotonic. Added a stationary interior luminance mask derived from the same paper outline, with black boundary stroke inheriting --stroke, so moving lines cannot overpaint/thicken the stationary rim. Idle has no inset mask and retains original full strokes. Timing and looping unchanged. Five tests pass, including a 101-phase no-backtracking check. Browser confirmed mask attachment and live stroke variable. Local only.


Whitepapers Flip interrupted-hover return: removed the immediate extra-progress reset on hover-out. An unfinished turn now reverses continuously from its current progress to the original idle sheet. Completed cycles still restart forward while hovered; color timing and reduced-motion behavior unchanged. Local only.


Whitepapers Flip tilt experiment: increased clockwise rotation from 7 to 10 degrees, still proportional to the shared fold/drag progress. All other timing, clipping and return behavior retained. Local only.

Whitepapers Flip refinement: clockwise tilt now reaches 12 degrees. Expanding fold's lower-left edge now preserves the original corner's three cubic segments and 1.06667-unit radius instead of using a sharp triangle vertex. Opaque fold backing uses the identical rounded path, excluded from effect artwork to avoid stray trace routes. Ten Flip/trace checks pass; live browser confirmed matching backing/edge geometry and unchanged eleven trace routes. Local only.


Playground blue updated to #0A1BFF for default hover color, Reset and interface accents. Shared site effects/tokens unchanged.


Reverted the blue experiment at user request: default hover color, Reset and playground interface accents restored to #0070FF.

## Cursor-driven holder tilt and light

“Holder tilt & light” is a separate, default-on top control for every icon size, independent of icon color and extra motion. `src/lib/effects/holder-tilt.js` owns only the `.icon-button` transform and holder lighting variables; SVG transforms/paths stay with the existing icon runtime. Proximity fades over 80px outside each holder; directional rotations reach 24 degrees at the holder edge, with 320px perspective. A restrained radial white highlight (19% peak white alpha) follows cursor position over the original gray surface. CSS uses global fast duration and primary easing for tilt, linear opacity for lighting (repository preview tokens; live parity remains unverified).

`createHolderTilt({root,selector})` returns `setEnabled(boolean)` and `dispose()`. Pointer work is coalesced into animation frames; there is no idle frame loop. Disable, touch/coarse pointer, reduced motion, window exit/blur, scrolling, resizing and hidden tabs clear the effect. Reset restores enabled state. Page teardown disposes listeners. Browser verified directional transform and highlight coordinates, toggle clearing and enabled control layout. All 50 holder/icon tests pass. Local only.

Holder refinement: normalized tilt to holder half-size rather than proximity radius, making all sizes visibly responsive. The parent button rotates its background and SVG child together; independent inner icon motion remains composed beneath that parent transform. Resting bounds are cached to avoid transformed-size feedback. Browser verified an 18° horizontal / 11° vertical tilt with the icon visibly following the plane. All 51 holder/icon tests pass.

Midpoint tuning at user request: maximum tilt is now 17° per axis (reached at holder edges), perspective 410px, and radial gradient stops are white 44.5% at center, white 9.5% at 45%, black 2% at outer edge. Cursor tracking, parent/child composition and proximity behavior retained.

## Client presentation / GitHub Pages

The user authorized a shareable interactive playground on 2026-10-28. `npm run build:icon-playground` builds only this page, its imported SVG artwork, CSS and motion dependencies into ignored `dist-icon-playground/`. The page works at the site root and `/icon-playground.html`, using relative build URLs. SVG sources are bundled at build time; no deployed `/src/` fetch is needed. `.github/workflows/icon-playground-pages.yml` tests/builds/deploys the isolated presentation on relevant main pushes or manual dispatch. GitHub Pages must use the GitHub Actions publishing source. This is separate from the Webflow Animations Playground, which remains an unpublished draft, and from production animation channel activation.

Initial presentation is interactive only, per user choice. No votes or feedback are collected or sent. Shared feedback can be added separately after choosing a collection method. Pages publishes the presentation publicly; only icon presentation files are in its artifact.

Client URL: `https://gorankomar.github.io/stitch-animations/icons-playground/`. The dedicated Pages build emits a nested index with assets relative to its parent; the root and original HTML URLs remain usable.
