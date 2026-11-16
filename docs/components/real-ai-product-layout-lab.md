# Product AI layout studies

Local-only comparison: `/real-ai-product-layout-lab.html` (`npm run dev`). Requested 2026-11-15. No Webflow changes, shared-entry registration, distribution build, or release.

Both studies use a #F6F6F6 stage with .75rem corners. The enlarged native LP product bar begins in the center, types the existing request, collapses its lower prompt row upward and becomes a compact working status without replacing the request with another-change copy or a stop button. Extracted product fields then fill as they pass through the illustration. The complete sequence resets and loops; Pause and Replay both are available.

- Vertical: equal-width fields, with native taller description. Outer wrappers move continuously upward at roughly .91 seconds per field, grow at the center and shrink/tilt along a curved sine path at the edges. Approximately five fields are visible. The collapsed status holds for one second with the shared working effect, then fades upward. Top/bottom gradients match the stage background. Continuous travel is linear; spatial scale uses the primary motion curve. Each field fills near center. All product fields and a group of three rescheduling toggles are included.
- Rows: three equal-height rows of variable-width fields alternating left/right, using the existing `createSeamlessMarquee` helper from Omnichannel Origination. Native textarea uses its standard input-height variant for this authorized study. The collapsed working bar stays centered over already-moving rows for five seconds, then scales up slightly while the entire scene fades out. Rows never translate vertically. Repeated staggered field changes run about every 2.2 seconds; marquee speed is 1.8 times the original study. Description width is 83cqi to fit a single line. Three toggles share one compact, centered box. Edge fades match the stage.

Markup is cloned from `real-ai-product-markup.html?raw`; its asset URLs are resolved locally. Native stylesheet and internal appearance are preserved. Authorized study changes include collapsed bar dimensions, description height/width, input border feedback, animated label markers and toggles. Other native appearance is preserved. Example values are supplied for otherwise empty deferral/rescheduling fields. No full screen, sidebar, navigation or product card groups are shown.

Source: `src/embeds/real-ai-product-layout-lab.js` / `.css`. Root selector: `[data-product-study="vertical"|"rows"]`. `init(root)` guards repeat mounting and returns cleanup. Each instance owns its prompt, fields, generated marquee copies, clock and animations. `animateStage` pauses offscreen/hidden tabs and rebuilds measured rows on resize. Reduced motion shows a static completed field composition. Cleanup cancels animations, clears working effects and removes generated DOM. Outer prompt owns translation; its size wrapper owns proportional enlargement. Field wrappers own movement/scale; native descendants retain their styles.

Local motion-token fallbacks (770ms and cubic-bezier(.11,.61,.27,.99)) are inherited from the prior preview; live Global Styles were not freshly verified. Entrance/exit translations and focus scale use the resolved primary easing; opacity and continuous marquee travel are linear. Study loop periods derive from the default duration and are experiment parameters. This must be revisited against Global Styles before Webflow integration.

Validation: product behavior tests pass (4 cases); local browser review covers prompt/working transition, vertical focus/fades, alternating rows and mobile viewport. No browser errors observed. Release validation is intentionally separate from this local experiment.

## Dynamic update — 2026-11-15

Select values switch in one step, never type. Text values type quickly; numeric fields count from zero or one to their final number, including lock-in period → 6. Inputs begin neutral, then turn orange with a brief expanding outline and primary-eased marker scale/rotation plus linear opacity. The toggle group changes a stable subset per pass to give varied enabled states without frame-to-frame randomness. Field and marquee clocks run during the entrance fade. Both studies retain visibility clocks, cleanup and static completed reduced-motion compositions. Local browser review found no console errors and no document overflow at 1280px; description width measures 996px within the 1200px stage.

## Vertical loop refinement — 2026-11-15

Only version one changed. The prompt now wipes its bottom edge upward over .32 × default duration (about 246ms), linearly as requested: native prompt content retains its height and padding and is masked, not compressed. Its fixed outer geometry prevents premature upward recentering. After the status-only height is reached and the working hold completes, upward departure begins. The outer shell preserves the working shadow outside the clipped bar. Field spacing advances every .72 × default duration (about 554ms), with the rotateX direction reversed to follow the circular path. During the final fields' departure, the full prompt returns from below and fades in. Its return completes before the clock wraps; typing begins at the wrap as the final field vanishes, without a scene-wide fade/reset. The second study keeps its previous timings and behavior.

## Vertical spacing and pinned edge — 2026-11-15

Version one only: the prompt size wrapper scales around its top edge, removing the downward drift caused by center-origin scaling during masking. After the mask reaches status height, the prompt pushes upward by twice its original rendered height over 1.8 default durations, using the primary curve to slow the finish; opacity fades linearly over the latter portion. The prompt-return overlap remains intact.

Vertical field width is now 32.2cqi (70% of 46cqi), centered at left 33.9cqi. The roll advances every .84 default duration (~647ms), slightly slower than the previous 554ms. Each item's actual height is projected through its scale/tilt before positioning the next item, with a shared 3cqi visible gap. This preserves the taller description and wrapped labels without inconsistent edge gaps. Perspective belongs to the inner shell; outer wrappers own translation/scale. Browser measurements at 375px stage width found visible gaps ~11.12–11.18px against the 11.25px target (subpixel/projection rounding). The prompt wrapper's computed transform origin is its top edge. Version two is unchanged.

## Interactive tuning panel — 2026-11-15

Version one now has an adjacent tuning panel with paired sliders and exact numeric inputs. Controls: background speed multiplier, signed tilt amount (negative reverses direction), bar travel as percent of original rendered height, push duration, mask duration, field width relative to the original 46cqi, visible gap as percent of stage width, smallest/center field sizes, prompt typing duration and field-start delay after masking. Defaults retain the latest study values. Speed and intro timing changes preserve the current field phase rather than resetting the animation. Geometry applies live; Replay vertical restarts only this study. Number edits commit on change/blur; sliders update continuously.

Settings are clamped to the displayed ranges and stored under localStorage `product-vertical-study-v1`; unavailable storage is nonfatal. Copy settings writes a human-readable list with units to the clipboard, with a selectable textarea fallback. Reset defaults restores and saves the defaults. The shared Pause and Replay both controls remain available. On desktop the panel and preview remain beside each other; on smaller screens the panel stacks above the preview and can be collapsed. Version two is unaffected.

Validated in the local browser: slider-to-number synchronization, numeric stepper update, reset, vertical replay and successful Copy settings feedback. Syntax check passes. These are local experiment parameters; this panel is not registered in Webflow/shared runtime.

## Selected settings and final-field exit fix — 2026-11-15

Applied the user's selected defaults: speed 1.05×, tilt 60°, upward travel 140%, push 1125ms, mask 246ms, field width 57%, gap 1%, smallest size 25%, center size 150%, typing 2146ms, field delay 250ms. Browser storage uses `product-vertical-study-v2` so prior experimental values cannot silently override this selected baseline. The prompt is proportionally enlarged from 1.24× to 1.4× on desktop (1.8× to 2× on mobile); its top-origin mask and travel calculation use the new scale.

Extracted local geometry into `real-ai-product-layout-geometry.js`. Virtual neighbors continue the path beyond the final real field, replacing extrapolation from the last two shrinking items (the source of end-of-list reversal). Rotation is capped at the chosen degree value rather than multiplying it beyond 60° toward a near-edge-on collapse. Edge-size fields continue traveling until fully above the stage; the loop's end is calculated from actual projected geometry, including tall descriptions, instead of fading them out at an arbitrary logical slot. Prompt return remains overlapped with the final departure. Two regression tests cover the last fields' exit/tilt bound and equal projected gaps around the taller description.

The last field's continuation uses its center-pass stride rather than the edge-sized neighbors' shrinking stride, so final items leave promptly instead of lingering flattened inside the top fade. Exit focus is cached per geometry/settings combination. Six targeted tests (two geometry regressions and four existing product cases) pass; the updated local browser reports no errors.

## Full rotational exit — 2026-11-15

Outgoing fields now continue from the selected main-pass tilt into a full ±90° edge-on finish between .75 and 2 slots above focus. The final turn preserves direction for positive/negative tilt controls and is included in projected-height/gap calculations. The top fade is removed for this study; field opacity remains fully visible until the quarter-turn completes, with backfaces hidden, so the exit is carried by rotation rather than background fading. Bottom entrance fade is retained. Prompt return starts .8 default durations (~616ms) earlier, allowing the last fields to rotate behind the foreground bar. Main settings and version two remain unchanged. Geometry regressions include full positive/negative edge-on exits.

The loop now finishes when the final field completes its edge-on turn (or clears the stage), so it does not wait through an empty interval for an already-invisible field to travel farther. Earlier foreground return therefore overlaps the last two or three fields' actual rotation.

## Frame-based exit and Rolodex prompt return — 2026-11-15

Supersedes the preceding logical-slot turn: main-pass geometry retains the chosen tilt, while the final ±90° rotation is driven by actual vertical frame position. The final turn starts in the upper 22% of the frame and completes exactly at the top edge, regardless of item height or list index. Opacity switches off only once the turn reaches 90°. This fixes ordinary fields becoming invisible early while the differently extrapolated last field appeared correct.

The prompt is now an extra measured item following the last field in the same geometry calculation, sized to preserve its native resting appearance. It rises/scales/rotates with the Rolodex, with no return opacity fade. The loop ends when this terminal item reaches the center: the prompt becomes flat and remains there as typing starts. Remaining fields retain their preceding clock and continue upward behind it during the next typing phase, avoiding a background reset at the stop. Initial prompt centering accounts for the full scaled height while retaining the pinned top during masking. Controls and version two are preserved.

Regression coverage now checks every item's full turn against the physical top boundary, the final fields' continued upward travel, description spacing, and the terminal prompt's flat centered pose. Eight targeted tests pass.

## Unified bars, fades and soft arrival — 2026-11-15

Both prompt appearances are now measured entries in the same stream: status bar → product fields → returning full prompt. The initial bar holds its top edge through the quick mask, then the shared roll pushes it up. The return bar follows the same path under the same top/bottom fade; its stacking level is below the fade, fixing its unmasked pop at the lower edge. Both bars use the shared field width and center scale. The full prompt reserves a six-cqi lower row and wraps to two lines, with the same native typography and assets.

A continuous signed sine-based spatial tilt replaces the late-stage blend that sped up near the top. There is no hard opacity switch on individual fields; clipping, the edge-on finish and matching #F6F6F6 fades handle disappearance. Top/bottom fade defaults to 15% and is controllable.

The returning bar disengages .7 items before center and settles over 680ms. A Hermite position track matches incoming scroll velocity and ends at zero velocity without overshoot; orientation and scale ease into their flat resting pose. Fields continue on the shared clock behind it while it settles and during the next typing phase. This prevents an abrupt center stop.

Controls now reflect this composition: Rolodex speed, tilt strength/direction, mask duration, shared item width, gap, smallest/center size, top/bottom fade, prompt settling duration, disengage distance, typing duration, and roll delay after mask. Separate bar travel/push-duration controls are removed because the bar now follows the roll. Previously selected compatible values remain stored under v2. Geometry regression coverage includes matching arrival velocity, monotonic settling and a zero-velocity stop.

## Selected lighter-tilt configuration — 2026-11-15

Removed **Maximum deferrals per year** and **Maximum reschedules** from the vertical study only; **Maximum reschedules over loan lifetime** remains. The shared source component and second study are unchanged. Selected defaults: speed 1.05×; tilt strength 8; mask 198ms; shared width 70%; gap 1%; edge size 74%; center size 150%; fades 18%; settling 680ms; disengage .7 items; typing 2146ms; post-mask roll delay 250ms. Storage key advances to `product-vertical-study-v3` so these defaults replace stale experiments. Browser inspection verified all twelve settings and the filtered field labels, with no errors. Nine targeted tests pass.

## Bottom-fed entrance and stable typing — 2026-11-15

The entrance now has a lead-in (1.15 default durations): the first field starts fully below the frame, and the whole field stream travels upward to dock beneath the stationary collapsed status bar. The prompt and fields then share the same origin correction and clock; the previous prompt-only correction is removed. A .65-default-duration acceleration ramp starts the shared roll at zero velocity and joins its constant speed continuously, removing the perceived pickup/gap discrepancy. Ramp time is accounted for in the return clock and settling calculation, preserving the approved ending and continuation across the loop.

At low tilt strength, outgoing rotation now peaks between 65° and 90° according to the chosen strength (about 68.3° at strength 8), with the existing top fade handling the final disappearance. Incoming geometry and the returning prompt's settle tracks remain unchanged. The prompt text reserves a fixed two-line block (3.33334cqi) from the first character, so adding the second line does not vertically recenter it. Eleven targeted tests pass, including continuous launch acceleration, inverse clock timing and the softer outgoing/incoming distinction.

## Rotating start instead of translated entrance — 2026-11-15

The previous lead-in translated fixed poses upward; this is replaced with the actual Rolodex geometry evaluated from a negative starting focus. `verticalEntryFocus` finds an initial wheel angle with the first field completely below the frame. During the approach, each field changes its own rotation and scale as the wheel turns, beginning from rest; no group entry translation remains. The status bar stays stationary while these fields approach. At focus zero the first field reaches the shared pickup spacing, and the existing acceleration ramp takes the status bar into the same stream. The approved ending and two-line typing block remain unchanged. Twelve targeted tests pass, including the hidden starting angle, changing tilt/scale and zero-focus pickup alignment.

## Continuous wheel and virtual status-bar pickup — 2026-11-15

Replaced the separate eased approach and subsequent acceleration ramp with a single linear focus clock: `entryFocus + elapsed / step`. The hidden starting angle is still measured to place the first field below the frame, but there is now no pause, slowdown or restart at focus zero. All fields retain the same clock and change rotation/scale continuously before and after pickup.

The original collapsed bar remains stationary until the wheel's virtual index-zero status bar reaches the same pose. At that point transform ownership switches to the wheel; identical width, scale and upper-edge alignment prevent a visible replacement. No extra DOM duplicate or physical collision is needed. Timing includes the hidden lead-in distance and preserves the approved returning-bar disengage/settle and stable two-line typing. Regression verifies equal nonzero focus velocity on both sides of pickup. This supersedes the previous eased-approach/ramp notes.

## Immediate visible start — 2026-11-15

Removed the 250ms post-mask pause (default is now 0ms). The initial edge-on field starts just below the lower frame edge, instead of an entire unrotated field-height plus 4cqi of padding below it. This removes the invisible travel responsible for the perceived ~1.5s delay while preserving the same continuous speed and pickup. Browser settings migrate from v3 to v4, retaining compatible user values while setting this newly requested delay to zero. Thirteen targeted tests pass, including a near-edge start bound.

## Click-synchronized start and entrance speed correction — 2026-11-15

The wheel clock now starts when typing finishes/collapse starts, rather than waiting for the mask to finish. The timing control is renamed **Roll delay after click** (default 0ms); mask duration remains independent.

Measured the user's 375px-stage configuration: the first field moved around 68–70px/s before pickup and 48–55px/s afterward. The logical clock was linear, but the fading origin correction and variable-height anchor stride changed visible speed. Removed the global origin-shift correction. Pickup is now measured where the virtual status bar actually reaches the stationary bar's collapsed position, instead of moving the whole field stream to meet it.

`createEntranceClock` parametrizes the initial path by the first field's actual travel distance, preserving integer-slot boundaries in the inverse lookup. This holds entrance speed through pickup without a staged ease, stop or restart, then rejoins the normal clock beyond focus 1.5. The selected speed multiplier still scales the full motion. Returning-bar geometry, settling and two-line typing remain intact. Regression samples visible speed before/after pickup within 3% and checks positional alignment of the virtual bar.

## Hold and smooth engagement controls — 2026-11-15

Added **Hold after typing** (0–2000ms, default 600ms) and **Prompt engage distance** (0–1.5 items around pickup, default .7). The hold leaves the complete typed request visible without the typing caret; collapse/click and the zero-delay Rolodex clock begin afterward. Both controls participate in the saved settings and copied summary.

Instead of switching the first bar abruptly from its static pose to the virtual moving pose, engagement starts before pickup and completes after pickup. A Hermite track starts at zero velocity and ends at the actual wheel position and velocity, including rotation and scale derivatives. Its duration follows the selected distance and wheel clock, keeping the fields uninterrupted. The shell height follows the bottom mask continuously with an equivalent position correction to pin its top, eliminating the single-frame full-wrapper → short-wrapper switch that could make the ghost handoff visible. Setting engage distance to zero allows comparison with the direct pickup. The returning bar and its settling track are preserved.

Fifteen targeted tests pass, including engagement endpoint pose/velocity continuity, initial rest, and monotonic travel.

During the post-typing hold, the vertical bar retains its native typing state: dark prompt text and the blinking caret remain visible until collapse/click begins. This supersedes the earlier note about hiding the caret during the hold. Timing and motion are unchanged.

Selected default Rolodex speed is now **1.4×**. The v5 settings migration updates speed while preserving other stored v4 controls, including hold and engagement choices.

## Third alternative: perspective crawl — 2026-11-15

Added local-only `data-product-study="crawl"` below the existing studies; versions one and two retain their render paths and settings. A flat centered native Ask Stitch AI bar types the request over 2.8 default durations, holds the completed request for .85 duration (~655ms with the local fallback), then masks its lower row upward over .65 duration. The existing Product Working effect animates the collapsed bar while two columns of all original fields climb a shared 48° perspective plane, receding toward the top behind the bar. Fields retain the native description height, update feedback and toggle group. Continuous travel and opacity are linear; collapse and numeric changes use the inherited primary curve. Timings derive from the existing local default token; live Global Styles remain unverified as noted above.

Replay perspective restarts only the third study; Replay all restarts all three. It shares stage visibility/hidden-tab clocks, pause, resize rebuilding, initialization guard and cleanup. Reduced motion shows a static completed composition with the prompt hidden. CSS is scoped to the third study and stays local; no Webflow or release changes.

Validation: syntax check and all 15 targeted existing product/layout geometry cases pass. Local browser visual inspection at its narrow viewport confirmed typing, collapsed working bar and receding field plane. Desktop, repeated-instance and reduced-motion visual review have not been performed for this alternative.

## Perspective crawl refinement — 2026-11-15

Third study only: prompt input is a single line with a shorter lower row; the centered header and collapse/working transition remain. Fields now form centered, widening rows of 1, 2, 3, 4, then the remaining 4 fields. Widths vary from 23–30cqi; all cards use 9cqi height, with .8cqi horizontal gaps and 1cqi vertical gaps. This study uses the supported standard input-height description variant; long labels truncate within their card. The unchanged native source and other studies retain their appearances.

Travel speed is 18% faster than the prior two-column crawl at the same stage dimensions. Field updates now trigger from their moving position near the lower visible part of the plane, with a small within-row stagger, so later rows no longer finish filling below the frame. It reuses the first study's exact fill renderer (text typing, numeric counts, select switching, orange border/marker feedback and toggles). Syntax check passes; desktop browser inspection confirmed equal 108px card heights in a 1200px stage, varied widths, the 1/2/3 silhouette and visible mixed fill states. No browser errors observed. Existing first/second render paths are unchanged.

## Irregular pyramid and center-triggered fade — 2026-11-15

Third study rows now use art-directed widths: [32], [36,39], [28,88], [40,48,39], [44,51,47], [57,48,55] cqi. Their spans widen progressively while counts vary (1/2/2/3/3/3). The third row pairs Type with an 88cqi description so the full value fits one line. Values explicitly use nowrap. Equal card heights, tight gaps and native fill feedback remain. The background plane scales up 10% around its bottom edge; the foreground bar retains its size.

Fade timing solves the same 48-degree, 1.1-scale, 65cqi perspective projection used by CSS: once the last row's bottom projects to stage center, the scene fades linearly over 1.4 default durations, then resets during a short blank interval. The next prompt fades in over .5 default duration. Travel remains at the previously selected speed. This replaces the far-distance exit timing. The first two studies remain unchanged.

Validation: JS syntax check and desktop browser inspection confirmed the complete description fits its wide card, and observed the last row above center during the closing fade (layer opacity .17), followed by the returning prompt. No release or Webflow edits.

## Client presentation on GitHub Pages — 2026-11-15

Public share route: `https://gorankomar.github.io/stitch-animations/relayer/product-layout-lab/`. The existing Pages build now includes this lab alongside the unchanged icon presentation. Title: Relayer · Product Layout Lab. `.study-workbench-presentation` hides the tuning panel with display:none while retaining all markup, settings and handlers; it also changes the grid to a single full-width preview column. Remove this modifier to restore the editing layout.

The dedicated Vite Pages build bundles native CSS, fonts, motion helpers and SVG assets. Raw component markup resolves its icons through Vite asset imports, avoiding localhost-only absolute source URLs. Nested route HTML uses relative bundled asset paths. This is a public client comparison page; no Webflow page or production animation promotion is part of this request.

## 04 / Product camera

Local fourth study (2026-11-16): clones the complete native `.lp-product-content` without a sidebar. Stage background matches its #f9f9f9. The third study's flat typing/masked-collapse introduction leads into a camera plane: enlarged product name, three fast selector pans, a longer description typing shot with changing tilt, interest accrual and lock-in (1 → 2 → 3), then a full-form pullback fading into the idle prompt. The original component markup and styles stay intact; transform ownership belongs to `.study-camera-screen`. Timing is intentionally cinematic, expressed as multiples of the existing default duration; movement uses the resolved primary curve and fades use linear progress. Local fallback tokens remain unverified against live Global Styles. Replay camera and the shared Pause/Replay controls apply; Animation Stage owns visibility, resize, reduced motion and disposal. Reduced motion presents the completed full form.

Polish pass: native CSS zoom owns magnification, with a separate outer camera plane for perspective (avoids scaling cached text). Removed forced compositor hints. Closer shots, stronger alternating tilt plus continuous subtle angular drift, protected left margin for the name shot with a blended exit, selector commits during incoming pans, ~0.89s name typing and ~1.42s description typing at the local 770ms token. The full loop is ~13.7s. Camera plane now owns transforms; native content owns zoom only.

Second polish pass: name completion has a brief ~350ms reading beat before the selector pans; fields start with gray outlines and transition to the first study's orange outline/soft working pulse as they populate. Label markers fade linearly while scaling from .35 and rotating from -65° using the primary curve. The description alone has an authorized 32cqi width / 8.5cqi textarea height so the entire field and copy fit in its close-up; its camera uses the same 9% left inset as the name shot. The final pose uses full-width 1× content with a stage-height minimum, and the returning prompt resets its mask before fading in so both rows appear together.

Loop/feedback polish: retain full prompt opacity across the loop seam (only the initial pass fades it in), eliminating the end-to-start flash. The returning idle prompt and next idle prompt now share height, content and opacity. Category/type camera legs are extended from .5 to .9 default-duration units, with commits retimed into the incoming pans. Sparkles now settle through three turns over .85 default-duration units; the Updated text badge scales/fades only, with zero rotation. Loop duration is now 18.6 default-duration units (~14.3s locally).

Exit experiment: pullback starts at 14.58 duration units, just before lock-in changes from 2 to 3 (~14.683 units). Tilt continues concurrently. Zoom alone uses an explicitly requested accelerating progress^2.2 curve, starting slowly and gaining speed through the existing linear fade; framing/rotation retain the primary easing. Prompt return and all earlier shots keep their timing.

Pullback correction: lock the final shot's form-space focal coordinates to the lock-in field for the entire zoom-out, including the invisible end hold. The screen-space anchor remains fixed; only magnification and tilt change. Removed interpolation toward the full-form center, which caused the lock-in field to pan out of view before returning. Reduced-motion full-form framing is unchanged.

Earlier continuous pullback: begins at lock-in arrival (13.6 duration units), before the count starts. Zoom uses the requested accelerating progress^1.25 curve; tilt remains at the incoming angle until 16.0 units, then resolves to zero at 17.7 as the fade completes. The focal point remains locked. To address flicker, native zoom is fixed at 3.2 and geometry is cached before zooming; the outer camera scales that high-resolution rendering down. This replaces per-frame native zoom and zoom-rounded offset measurements, avoiding continuous layout/raster invalidation. Earlier native-zoom-per-frame notes are superseded.

Smooth tilt refinement: removed the late tilt hold/correction. Rotation now resolves from the incoming angle to zero across the entire 13.6–17.7 pullback using a symmetric remapping of the primary easing (ease(p)/(ease(p)+ease(1-p))). Zoom retains its independent accelerating track. The small angular drift also fades across the full pullback rather than disappearing rapidly when opacity starts fading. Both rotation and zoom reach their final values at fade completion. This supersedes the 16.0-unit tilt hold.

Stronger pullback acceleration: zoom now uses reciprocal magnification with distance progress p^3.5: startScale / (1 + (startScale / endScale - 1) * p^3.5). This gives a restrained opening and a pronounced final rush through the fade. Focal point, timing, opacity and smooth independent tilt remain unchanged. Supersedes the earlier p^1.25 scale interpolation.

Larger/faster pullback trial: scale now drops from 2.9 to .28 (over 10× reduction) over 2.65 duration units (~2.04s), using direct p^2.4 acceleration. Fade now runs from 15.0 to 16.4 units, with the prompt returning at 15.5. The zoom reaches its distant size at 16.25 just before fade completion; tilt resolves smoothly at 16.4. Holds .28 through the invisible tail. Tilt retains its independent smooth full-length track and fixed focal point. Supersedes reciprocal magnification / 1× end scale for the animated exit; reduced-motion full-form view remains 1×.

Frame-filling exit / sliding prompt: animated pullback ends at 1× again (supersedes .28 distant exit). Retains fixed lock-in focal point, accelerating zoom timing, smooth tilt and product opacity fade. Bottom-only atmospheric gradient covers the lower 35% of the stage above the form and prompt. The prompt remains at opacity 1 and translates below the bottom edge during the form entrance, then rises back to center through that gradient on return. It resets expanded while below the frame; the loop seam stays centered and fully opaque. Reduced motion hides the prompt and shows the completed form.

Persistent status composition: supersedes off-frame prompt travel. The collapsed bar parks 3cqi above the stage bottom, z-index 9 above the bottom atmosphere (8), at full opacity. Reuses canonical `renderProductWorking` (2.8s twin shadow orbit / 3.6s conic outline trail) from the original product runtime; an outer shell pseudo-element preserves the shadow outside the collapsed mask, with linear effect fade. At completed field timing (15.1 units), shows “All required details have been completed.” and “Click Create loan product to proceed.” It then rises and expands concurrently, revealing “Ask for another change…” and the circular arrow. At full expansion returns to Ask Stitch AI for the next loop. Product camera, field sequence and bottom fade remain in place.

Outline visibility / loop pause: render the canonical 3.6s single-trail outline on the unmasked prompt shell, above the bar, rather than its clipped native pseudo-element. Gray trail is a local authorized color variant of the same gradient; shared effect remains unchanged. Outline and shadow use the working opacity clock only. Cycle shortened from 18.6 to 16.95 duration units, removing ~1.27s idle delay after expansion without changing any camera or field timings.

Outline color correction: the shell trail uses the shared effect's canonical orange (255 127 98 / #ff7f62), matching the other orange accents. Removed the gray color substitution; visibility fix and shortened loop pause remain.

Prompt tile motion: the orange tile's `.lp-product-sparkle` makes repeated clockwise 90° turns during Creating personal loan. Each turn uses the resolved primary easing over one default duration followed by a .2-duration rest. At completion (15.1 units), sample the exact working angle and ease back to the nearest full-turn/original orientation over one default duration; hold there through the loop. Reduced motion uses 0°. The camera stage owns this transform and clock, so visibility pause, replay and disposal stay consistent. Local preview only until the next publication request.

Prompt sparkle refinement: pause between quarter-turns increased from .2 to .6 default-duration units (~462ms locally), keeping each eased turn at one default duration. Completion now advances clockwise to the next full-turn orientation using ceil(angle/360), never reversing. Supersedes the nearest-orientation return.

## Mobile presentation correction — 2026-11-16

At viewport widths up to 600px, foreground prompts now use a screen-space shell (34px status row plus a 64px prompt row), 88% rendered stage width, 10px source text and wrapped prompt copy. Camera/crawl's unchanged 1.3 outer scale yields 13px foreground text. The existing collapse, pause, replay and working clocks still own motion; the camera's bottom inset uses the actual mobile shell height. Hidden prompt content is clipped after collapse. Desktop sizing is unchanged and restored after resizing.

Camera Product details uses four equal minmax columns on mobile instead of the desktop flexible name column plus three cqi tracks. Camera layout is measured after responsive CSS applies, preserving its close-up pans. The other three studies use larger scoped mobile field typography, controls and markers. Native shared component CSS is unchanged; all overrides belong to this local/client lab.

Browser verification: 390px and 320px phone viewports, readable full prompt and collapsed status, equal camera field widths (79px at 390 viewport and 64px at 320), no page overflow, and desktop recovery to the original 478/164/220/220px proportions at a 1200px stage. Controls remain hidden and all four studies are retained.

## Natural mobile prompt flow — 2026-11-16

Simplified the existing mobile text rule: auto height, normal wrapping and overflow-wrap:anywhere, with the ask row aligned to flex-start. Removed the artificial text max-height and made the existing scoped selectors specific enough to override native typing nowrap and vertical-study centering. Text follows the parent's available flex width and grows downward from its top padding. No scaling or animation changes. Browser inspection at 320px confirmed wrapping and no horizontal text overflow.

## Typing-state wrap specificity correction — 2026-11-16

The native typing rule's :is() includes a legacy span:first-child alternative; its type-selector specificity beats the preceding mobile override even when the actual prompt is a div. Idle-state checks did not reveal this. Added the bar's existing [data-product-state] attribute to the existing mobile rule, with no new declarations or elements. Verified the actual paused typing state at 320px: white-space normal, two text lines (28px source height), no horizontal overflow, and visually top-aligned text. The prompt remains position:static in its normal flex row.

## 05 / Flat product camera

Local comparison of study 04 with `data-product-study="camera" data-camera-flat="true"`. Shares its complete renderer, field timings, focal coordinates, zoom, prompt/status motion, orange outline/shadow and sparkle rotation. Only the camera plane's perspective and X/Y/Z rotations (including angular drift) are omitted, leaving pure translation and scale. Study 04 is unchanged; each has its own replay button, while shared Pause/Replay controls apply to both. Existing camera-scoped styling and stage lifecycle/reduced-motion handling are reused. Published via the dedicated GitHub Pages workflow.
