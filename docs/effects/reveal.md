# Reveal: Soft and Hard

Keep a single reusable effect family in `src/lib/effects/reveal-groups.js`.

**Soft** is the existing default: a short configurable translation and opacity 0 → 1. Movement uses the primary curve; opacity is linear. Its current global default offset is 7rem, and consumers can override it with `data-reveal-offset`.

**Hard** enters completely from outside the designated clipping frame and leaves opacity unchanged. Distance is measured from the target's resting geometry to the frame edge, rather than from the target's own width. Clip the outer frame and animate an inner layout wrapper. Separate wrappers retain component layout and Pointer Follow transforms.

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
