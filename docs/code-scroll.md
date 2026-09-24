# Code scroll effect

`src/lib/effects/code-scroll.js` exports `createCodeScrollEffect(track, options)`.
The build exposes the same API in `dist/effect-code-scroll.js`. Both
`feature-due-date.js` and `feature-financial.js` import that one URL, so a page
containing both downloads and evaluates the effect once. No new dependencies.

The effect preserves syntax spans, duplicates rows for a continuous wrap, and
starts typing and upward movement together. It measures row height on resize,
not on every frame. Rows must have equal fixed heights and live in an overflow-hidden
viewport. Supply enough rows to extend beyond the viewport.

```js
import { createCodeScrollEffect } from './effect-code-scroll.js';
const effect = createCodeScrollEffect(track, {
  typingSelector: '[data-code-text]', // omit to type all text inside each row
  linesPerSecond: 1.05,
  lineDelay: 145,       // initial typing stagger, milliseconds per row
  characterDelay: 7,   // milliseconds per character
  visibleLines: 15     // line at which subsequent arriving rows begin typing
});
effect.render(elapsedMilliseconds);
effect.showAll(); // static/reduced-motion presentation
effect.dispose(); // restore original text, remove copies, disconnect measurements
```

The caller owns its clock and pauses it offscreen or when the document is hidden.
This lets Financial Architecture synchronize the effect with its existing panel
entrance without adding another animation loop. Its JSON effect starts at 3500ms,
as the panel arrives, rather than waiting until all the text has been typed.
The due-date illustration retains its original timing, dates and pointer follow.

## Build and release

`npm test` checks typing, loop continuity, syntax preservation, reuse and disposal.
`npm run build:all` compiles the library and all Webflow embeds. The two module
embeds default to `/dist` URLs for local serving. For Webflow, regenerate them with
`STITCH_ASSET_BASE=https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@COMMIT/dist node scripts/build-embeds.mjs`
after pushing the compiled assets, replacing COMMIT with that commit's full SHA.
Use the **same commit** for both embeds to share the module cache.

Replace the existing embed in each Webflow component; do not append the new
loader alongside its former inline implementation. Each graphic initializes its
instances once and owns the rest of its animation. A CDN failure leaves static
HTML visible. Webflow publication is separate from pushing this repository.
