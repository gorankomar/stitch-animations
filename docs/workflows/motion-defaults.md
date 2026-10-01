# Motion defaults

These defaults apply whenever animation is explicitly requested. They do not add motion to otherwise static illustrations. A user-specified easing or documented, explicitly approved component exception takes precedence.

## Source of truth

Use the website's **Global Styles** component → CSS code embed → **Animation defaults** section (user reports it starts near line 209). Locate the section by its token names, not a fixed line number; line numbers can change.

- Primary movement easing: **--motion-ease-primary** (the site's exact cubic-bezier).
- Normal duration: **--motion-duration-default**.
- Fast duration when the requested interaction calls for it: **--motion-duration-fast**.
- Other timing tokens: read the relevant values from that same section rather than inventing replacements.

Read the actual embed/computed styles when implementing motion. Do not replace the primary curve with ease, ease-out, another cubic-bezier, a library preset, spring, or a hardcoded approximation. Do not change Global Styles tokens as part of implementing a component unless requested.

Repository global.css and src/lib/easing.js currently contain local defaults, including cubic-bezier(.11, .61, .27, .99). These are not independent verification of the live Global Styles value; do not assume they remain identical. Preserve the live token reference in deployed styles. If the value is unavailable, obtain it before claiming faithful implementation; report any local preview fallback as unverified.

## Per-property rule

| Property being animated | Default easing |
| --- | --- |
| Opacity (any start/end values, fade in or out) | linear |
| Translation, position, scale, rotation, and other non-opacity animated properties | var(--motion-ease-primary) / its resolved equivalent |

The rule applies in both directions, entrance/exit, hover/return, and to new/revisited effects. Explicitly specified timings and easing override the default; record them in component notes. Continuous loops, constant-speed pulses, and physical/inertia effects may need different timing, but do not silently select linear or a spring simply because it is common: retain an already approved behavior or confirm/document the requested exception.

## CSS and native Webflow

Apply native Webflow animation/style settings where possible. Any special motion CSS that cannot be expressed natively belongs in the component's scoped style embed, following [illustration creation](illustration-creation.md). Use the existing global variables directly; do not redeclare their values per component.

```css
/* Scoped to the owning component in actual use. */
.graphic_part {
  transition:
    transform var(--motion-duration-default) var(--motion-ease-primary),
    opacity var(--motion-duration-default) linear;
}
```

Do not use transition:all with a single easing when opacity and movement change together. For keyframes that combine opacity and transforms, use separate animations/tracks or wrappers so opacity remains linear while movement follows the primary curve. A property-specific explicit duration may differ while preserving its easing rule.

## JavaScript animation

Resolve CSS values after Global Styles is available, at initialization, not only at module import time. Resolve from the animated element when inheritable scopes/approved overrides matter.

- For Web Animations or another engine accepting CSS easing strings, read --motion-ease-primary and pass the exact string to the movement track; use a separate linear opacity track.
- For requestAnimationFrame interpolation, reuse src/lib/motion.js's CSS-reading/cubic-bezier helpers where compatible. Opacity interpolates with raw normalized progress; other properties interpolate with the resolved primary curve. Verify the helper actually accepts the live curve and does not fall back to a different easing.
- src/lib/easing.js exposes getPrimaryEase/getDefaultDurationMs/getFastDurationMs; prefer runtime getters over import-time constants. Inspect duration parsing: Global Styles may use calc()/variable references. Do not treat parseFloat of an unresolved CSS expression as a valid duration. Resolve to a measurable CSS time or update the shared resolver within the task when needed.
- Do not override --motion-ease-primary on the root/element to implement a one-off exception; scope the exception to its own property or animation track.

Keep the full static Figma fallback visible until motion setup succeeds. Easing initialization failure must not leave the illustration hidden.

## Verification and documentation

Confirm the movement track's configured/resolved easing equals Global Styles and opacity uses linear. Check combined opacity/movement, reverse/exit motion, default/fast duration selection, reduced motion, and failed setup fallback. Record token references and any explicitly approved exceptions in component notes.

This procedure sets future implementation defaults. It does not claim that every existing effect has already been migrated or that the live embed was inspected during this documentation update. Apply it to new/revisited effects; broad migration requires its own requested task.
