# Reveal: Soft and Hard

Keep a single reusable effect family in `src/lib/effects/reveal-groups.js`.

**Soft** is the existing default: a short configurable translation and opacity 0 → 1. Movement uses the primary curve; opacity is linear. Its current global default offset is 7rem, and consumers can override it with `data-reveal-offset`.

**Hard** enters completely from outside the designated clipping frame and leaves opacity unchanged. Distance is measured from the target's resting geometry to the frame edge, rather than from the target's own width. Clip the outer frame and animate an inner layout wrapper. Separate wrappers retain component layout and Pointer Follow transforms.

## Applying Reveal in Webflow

Reveal is an attribute-driven effect, not a Webflow class you must assign manually. Add custom attributes in Element settings. `data-reveal-group` organizes a sequence; `data-reveal` selects the actual moving target. A wrapper marked `data-reveal` moves its contents together; unmarked descendants do not get individual entrances. Preserve component internals and put Reveal, layout, and Pointer Follow on separate wrappers.

The shared page loader watches each `[data-anim]` section. When 25% of the section is visible, it calls the section controller's `ensure()`. Each section triggers independently, once per initialization. Scrolling away and back does not replay it. A group outside a discovered section needs an explicitly initialized controller. Use the component's registered `data-anim` name; do not change it just to enable Reveal.

```html
<section data-anim="hero" data-visibility-threshold="0.25">
  <div data-reveal-group>
    <h1 data-reveal>Heading</h1>
    <p data-reveal>Description</p>
    <a data-reveal>Button</a>
  </div>
  <div data-reveal-group data-reveal-stagger="250ms">
    <div data-reveal>First card</div>
    <div data-reveal>Second card</div>
  </div>
</section>
```

Targets start in DOM order, not their visual grid order. Within a group, stagger is the interval between starts, so entrances overlap. Sibling groups wait for the preceding group's last entrance to finish. With 770ms movement and 200ms stagger, the first group above starts its targets at 0, 200, and 400ms; the second group starts at 1170ms.

Groups may nest: a nested group finishes before the sequence proceeds past it. For strict block-by-block sequencing, wrap each block in a sibling group. A run of plain targets followed by a nested group advances by its accumulated stagger intervals, rather than waiting for every plain target's movement to finish. The grouping wrapper itself is not an entrance target; use a separate wrapper if the entire group must move.

## Attribute reference and defaults

Live Global Styles is the source of truth for site tokens. The values below are the repository defaults / previously recorded site values, not a fresh inspection of the live embed. Controller fallbacks apply when tokens cannot be resolved.

| Attribute | Where | Default | Options / example |
| --- | --- | --- | --- |
| `data-anim` | Section | None | Existing registered animation name, e.g. `hero`; enables automatic section discovery. |
| `data-visibility-threshold` | Section | `0.25` | Fraction from `0` to `1`; clamped to that range. |
| `data-reveal-group` | Group wrapper | None | Presence creates a sequencing group; value is not a group ID. |
| `data-reveal` | Entrance wrapper or element | None | Presence selects a target. `false` excludes global Soft styling, but currently does not exclude controller scheduling; remove the attribute to fully opt out. |
| `data-reveal-mode` | Target | `soft` | `soft` (movement + fade), `hard` (frame-edge movement, unchanged opacity). Put Hard mode directly on the target for CSS compatibility. |
| `data-reveal-direction` | Target or ancestor | `bottom-to-top` | `bottom-to-top`, `top-to-bottom`, `left-to-right`, `right-to-left`. |
| `data-reveal-stagger` | Group or target | Soft: `--reveal-stagger-default` (`200ms`); Hard: `340ms` | Time between starts, e.g. `250ms`, `.25s`, or `0ms`. Explicit inherited attributes or controller timing overrides win. |
| `data-reveal-delay` | Group or target | `0ms` | Additional start delay, e.g. `300ms`. See inheritance caveat below. |
| `data-reveal-duration` | Target or ancestor | `--reveal-duration-default` (`770ms`) | Movement duration, e.g. `900ms`. Controller fallback: `700ms`. |
| `data-reveal-offset` | Soft target or ancestor | `--reveal-offset-default` (`7rem`) | CSS distance, e.g. `2rem`, `24px`. Hard calculates distance from geometry instead. |
| `data-reveal-opacity-duration` | Soft target or ancestor | Movement duration × `--reveal-opacity-ratio` (`.34`, about `262ms` at `770ms`) | Fade duration, e.g. `250ms`; opacity stays linear. Ratio fallback: `.7`. |
| `data-reveal-ease` | Soft target or ancestor | `--motion-ease-primary` | Existing Soft override accepts a CSS easing string. Normally leave unset to preserve Global Styles; Hard grouped tracks use the resolved primary easing. |
| `data-reveal-frame` | Clipping ancestor | Hard controller falls back to its root | Presence identifies the nearest frame. Apply native overflow clipping; the attribute alone does not clip. |

Always include time units in attributes. The current parser treats a unitless `200` as 200 seconds; use `200ms`. Numeric JavaScript controller timings are already milliseconds.

Target options use the nearest nonempty attribute on the target or its ancestors. Group delay is read directly from the group, and targets also inherit ancestor delay: a group `data-reveal-delay="300ms"` can therefore add 300ms at group level and another 300ms at target level. Nested group delays can accumulate too. Use grouping and stagger first; account for this behavior when adding delays. A target delay shifts that target's start without pushing every later target by the same amount.

## Visible fallback when JavaScript fails

The previous global selector hid every Soft `[data-reveal]` immediately. Without JavaScript to add `is-reveal`, content could remain hidden indefinitely.

The locally prepared replacement gates the entrance CSS with **`is-reveal-ready` on each target**. Merely adding `data-reveal` leaves the static content visible. When `ensure()` starts, the controller adds the readiness class, commits the starting styles, and schedules entrances. Soft targets receive `is-reveal`; Hard targets use Web Animations. Cancellation/reset removes readiness and returns to visible static content; scheduling errors also cancel and restore the fallback.

Do not add `is-reveal-ready` manually in Webflow or use a page-wide early `js` class to hide all targets. Script downloading does not prove that a particular animation initialized successfully. Other component-owned CSS that hides content needs its own successful-setup gate.

CSS location verified on 2026-10-14: **Global Styles → Animation Components / animation embed**, not the style-overrides embed. The user moved the rules and installed the gated selectors there. Read-back confirmed both `.is-reveal-ready` selectors, Hard exclusions, Designer override, and the existing tokens. Do not edit Global Styles as part of the runtime release. The local `global.css` mirrors the entrance rules for local previews. The matching runtime must be active on staging before Preview can animate with these selectors. Publishing Webflow changes is separate from channel activation; the Playground always remains a draft. Gated CSS with an older runtime leaves targets visible but without Soft entrances; the new runtime with old unconditional CSS does not fix failed-load visibility.

The tradeoff is that content stays visible while scripts load and before visibility triggers; late setup can briefly show content before its entrance starts. This favors accessible content over permanent hiding. The gate protects load/setup failure, not a script that crashes after successfully scheduling an entrance. Reduced-motion gating remains the consumer's responsibility; bypass entrance setup to retain the visible fallback.

## Attributes and grouped controller

On each target, set `data-reveal`, `data-reveal-mode="soft|hard"`, and optionally `data-reveal-direction`. Directions are `right-to-left`, `left-to-right`, `top-to-bottom`, and `bottom-to-top` (default). The frame carries `data-reveal-frame` and native overflow clipping. Existing markup without mode/direction retains its prior behavior. Use target-level Hard attributes so the Global Styles soft-only entrance selectors exclude those targets, including before JavaScript loads.

`createRevealController({root})` retains its grouped `ensure()/cancel()/reset()` contract and existing delay/stagger/duration attributes. Hard targets use movement-only WAAPI tracks and preserve opacity. Hard Reveal defaults to 340ms between starts, so entrances overlap; explicit `data-reveal-stagger` on a target/group or controller timing overrides still take precedence. Soft Reveal keeps its existing global stagger. `cancel()` cancels their animations and restores inline transforms. Consumers own visibility/reduced-motion gating; use Animation Stage for more involved choreography.

Numeric controller `timings.stagger` values are already milliseconds (for example, `200` means 200ms). Attribute strings retain the existing time parsing (`200ms` or `.2s`). Do not pass resolved numeric milliseconds through the string seconds parser. Regression coverage in `tests/reveal-groups.test.js` checks the full nine-row User Onboarding and three-layer Credit Check schedules, completion classes, repeated ensure and cancellation.

```html
<div data-reveal-frame style="overflow:hidden">
  <div data-reveal data-reveal-mode="hard" data-reveal-direction="right-to-left">
    <!-- Existing component instance -->
  </div>
</div>
```

## Externally clocked tracks

`createRevealTrack(element,{frame,mode,direction,offset,bleed})` returns:

- `render(progress,ease,opacityProgress)`: progress clamped to 0–1; movement takes the supplied resolved primary easing, Soft opacity takes its separate raw progress, Hard does not write opacity.
- `measure()`: refresh resting frame/target geometry on resize without retaining the current entrance translation.
- `keyframes()`: movement-only endpoints for Hard grouped controller.
- `dispose()`: restore the original inline transform/opacity.

`offset` is Soft's distance in pixels; `bleed` is optional extra Hard clearance for shadows. Target data attributes supply the default mode/direction. Caller owns the clock and timing; use exported `HARD_REVEAL_STAGGER_MS` (340) for overlapping Hard starts, token resolution, reduced-motion fallback and setup failure cleanup. These tracks need no entrance CSS and remain visible until setup succeeds. Instant Virtual Cards uses custom `data-ivc-reveal` selectors to avoid the older generic soft hiding rule.

`revealOffset({mode,direction,frame,element,offset,bleed})` is the pure geometry helper shared by both APIs. The tests verify all four clipping boundaries, opacity preservation and resize remeasurement.

Global Styles' existing soft entrance selectors now exclude `[data-reveal-mode="hard"]`; all prior soft targets retain their appearance and timings. No global easing/duration values changed.
