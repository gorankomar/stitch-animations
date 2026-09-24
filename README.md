# Stitch Animations

Modernized animation playground built on Vite with shared utilities, modular animation bundles, and code-splitting-friendly entry points.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173/` to preview the demo markup. The script tag inside the page defaults to the resolver bundle (`page-all-lite`). Swap it with `/src/entry/page-all.js` during development or with an emitted file from `dist/` after running `npm run build`.

## Scripts

- `npm run dev` – Vite dev server with hot reloading.
- `npm run build` / `npm run build:all` – Generates hashed bundles for every entry in `src/entry/`.
- `npm run build:hero` – Example of building with an SSR manifest (handy for feature-specific deployments).
- `npm run build:hero:single` (and `:api`, `:chart`, `:dots`, `:dots-bulge`, `:radial`, `:cards`, `:deposits`, `:orbit`, `:small-cards`, `:window-graphic`) – Emits `dist/feature-*.js` + `dist/feature-*.css` (no shared chunks) for copy/paste deployments.
- `npm run preview` – Serves the production build from `dist/`.

## Project Layout

```
stitch-animations/
├─ legacy/                  # Original scripts/styles (read-only references)
├─ src/
│  ├─ lib/                  # Shared utilities & effects
│  ├─ animations/           # One module per animation (hero, api, chart, dots, dots-bulge, radial, cards, orbit, window-graphic)
│  └─ entry/                # Bundles: page-all, page-all-lite, feature-*
├─ index.html               # Demo markup
├─ dist/                    # Build output committed for CDN usage
```

### Shared Utilities

- `src/lib/easing.js` – Canonical easing + timing constants.
- `src/lib/config.js` – Centralized selectors, class names, thresholds, and data-attr handles.
- `src/lib/dom.js` – Thin wrappers for `querySelector`, dataset helpers, and attribute builders.
- `src/lib/math.js` / `src/lib/motion.js` – Shared math helpers, REM conversion, reduced-motion detection, and CSS-driven easing readers (`readMotionEaseValue`, `readMotionEasingCurve`).
- `src/lib/observer.js` – IntersectionObserver helpers plus a debounced `observeResize` wrapper for ResizeObserver fallbacks.
- `src/lib/raf.js` – RequestAnimationFrame loop helpers.
- `src/lib/effects/follow-group.js` – Shared pointer-follow engine that lets any `[data-follow-root]` drive one or many `[data-follow-mouse]` layers with depth-aware easing.
- `src/lib/effects/reveal-groups.js` – Timeline builder that understands `[data-reveal-group]`, nested clusters, and inline overrides.
- `src/lib/effects/stacked-windows.js` – Layout helper for the stacked window motif (desktop + mobile patterns, auto-indexing, inline CSS vars).
- `src/lib/effects/threshold.js` – Run animation setups once a section is `X%` visible (default `0.25`, override with `data-visibility-threshold` or options) and reuse `resolveVisibilityThreshold()` wherever the attr is read.
- `src/lib/effects/press-ripple.js` – Pointer-down class toggler that restarts CSS ripple/press animations without duplicating event code.
- `src/lib/effects/glow-sweep.js` – Template-driven glow spawner that snaps to pointer direction, loops while visible, and respects `data-visibility-threshold`.
- `src/lib/effects/zoom-lens.js` – Reusable cursor magnifier for dense graphics; opt in with `data-zoom-lens="true"` and tune size/scale/border from markup.

### Effect Recipes

#### Reveal groups

Every `[data-reveal]` node opt-in to the global entrance styles defined in `global.css`. The `createRevealController` helper adds orchestration on top:

```js
import { createRevealController } from '../lib/effects/reveal-groups.js';

const controller = createRevealController({ root: sectionElement });
controller.ensure(); // kicks off the sequence and returns the total duration in ms
```

Markup contract:

- Wrap any cluster that should resolve as a block with `data-reveal-group`. Siblings on the same level wait for one another, so you can chain rows/columns deterministically.
- Groups can be nested. Child groups finish before the parent moves on to the next sibling.
- Data attributes cascade down to children:  
  - `data-reveal-stagger` – override per-element offset inside the group (default `var(--reveal-stagger-default)`).
  - `data-reveal-delay` – pause before the group or the individual element starts.
  - Elements keep the existing overrides: `data-reveal-duration`, `data-reveal-offset`, `data-reveal-ease`, `data-reveal-opacity-duration`.

Example:

```html
<div data-reveal-group data-reveal-stagger="160ms">
  <h1 data-reveal>Headline</h1>
  <div data-reveal-group data-reveal-delay="220ms">
    <p data-reveal>Paragraph A</p>
    <p data-reveal>Paragraph B</p>
  </div>
</div>
```

`createRevealController` strips/sets the `is-reveal` class for you and exposes `cancel()` / `reset()` hooks for cleanup.

Every `[data-anim="*"]` section automatically spins up this controller via `initAutoReveals`, so dropping `data-reveal-group` + `data-reveal` inside a section is enough to get the default sequencing even before custom animation logic is wired up.

#### Stacked windows layout

`createStackedWindowsController(wrap)` turns a `.stacked-windows_wrap` into an auto-stacked deck:

```js
import { createStackedWindowsController } from '../lib/effects/stacked-windows.js';

const dispose = createStackedWindowsController(wrapElement);
// call dispose() during teardown to remove inline styles/listeners
```

- Provide any number of `.stacked-windows_position` wrappers containing a `.stacked-windows_img-wrap`.
- The helper injects `data-stack-index`, `data-stack-count`, and CSS custom properties (`--stack-x`, `--stack-y`, `--stack-z`, `--stack-layer`, `--stack-position`, `--i`) so the CSS no longer relies on hard-coded `.is-N` classes.
- Desktop pattern: anchor card stays relative; siblings slide by +5%/-19% per step.
- Mobile pattern (<= 991px): anchor starts at `translateY(38%)`, siblings move by +10%/-19% per step.
- Override the layout by passing `{ layout: { desktop: { xStep: 4 }, mobile: { yStep: -15 } } }` or change the breakpoint via `{ breakpoint: 768 }`.

This makes the markup declarative—you can drop in more cards without touching CSS.

#### Visibility triggers

Use `whenVisible(target, setup, options?)` to delay expensive animation wiring until the section is actually on-screen.

```js
import { whenVisible } from '../lib/effects/threshold.js';

export function init(root = document) {
  const section = qs('[data-anim="chart"]', root);
  if (!section) return () => {};
  return whenVisible(section, () => initChart(section));
}
```

- Default threshold is `25%` of the element’s area. Override per-section via `data-visibility-threshold="0.4"` or per call with `{ threshold: 0.4 }`.
- `setup` should return a cleanup function; `whenVisible` ensures that cleanup runs when the animation is torn down.
- Under the hood it uses `IntersectionObserver`, but it falls back to immediate execution when the API is unavailable.
- Need the same logic outside of `whenVisible`? Import `resolveVisibilityThreshold(element, fallback)` from the same module to clamp the attr consistently.

#### Zoom lens

`initZoomLenses(root)` attaches a circular magnifier to any element with `data-zoom-lens="true"`.

```js
import { initZoomLenses } from '../lib/effects/zoom-lens.js';

const dispose = initZoomLenses(document);
```

Markup contract:

- `data-zoom-lens="true"` enables the effect on the hovered element; `data-zoom-lens="false"` leaves it disabled. The value is case-insensitive.
- `data-zoom-lens-size="240"` sets the lens diameter in pixels.
- `data-zoom-lens-scale="1.9"` sets the zoom multiplier.
- `data-zoom-lens-border="#b8b8b8"` overrides the default gray outline.
- `data-zoom-lens-target=".selector"` magnifies a specific child instead of the whole host.

The lens uses a cloned DOM mirror rather than a canvas screenshot. While the lens is active, it watches the source with `MutationObserver`, so reveal classes, inline styles, and animated counter text stay synced with the original element.

### Animation Contract

Each animation exposes `init(root = document)` from `src/animations/<name>/index.js`.

```js
export function init(root = document) {
  const section = qs('[data-anim="hero"]', root);
  if (!section) return () => {};
  return whenVisible(section, () => setupHero(section));
}
```

The paired CSS lives next to the module (e.g., `src/animations/hero/styles.css`). Entry files import both the JS module and CSS to keep dependencies explicit.

### Available Animations

| Name | Description | Shared effects |
| --- | --- | --- |
| `hero` | Lightweight follow chips/orbs powered by the shared follow group. | `follow-group`, IntersectionObserver |
| `api` | Card hover that reuses the follow group plus ripple + glow sweeps. | `follow-group`, glow helper |
| `chart` | SVG sparkline with tooltip + counter easing. | shared DOM helpers |
| `dots` | Subtle proximity dots (scale + alpha only). | subtle dots field helper, ResizeObserver |
| `dots-bulge` | Legacy bulging lattice with full displacement + ripples. | bulge dots helper, ResizeObserver |
| `orbit` | Multi-ring orbit with parallax dots, ripple trigger, and pedestal badge. | `follow-group`, ripple helper, ResizeObserver |
| `radial` | Drag-driven radial console with inertia + intro observer. | IntersectionObserver |
| `cards` | Face unlock inspired credit card stack w/ layered mouse follow + reveal staging. | `follow-group`, IntersectionObserver |
| `deposits` | Hybrid dots background + live counter/time readout inside a phone shell. | dots field helper, value counter |
| `small-cards` | Compact card cluster using shared follow/reveal utilities. | `follow-group`, IntersectionObserver |
| `window-graphic` | Dense loan/payment form graphic with reveal sequencing, value counters, current date labels, and optional zoom lens. | reveal groups, value counter, zoom lens |

### Entry Points / Bundles

| Entry | Purpose |
| --- | --- |
| `src/entry/page-all.js` | Imports and initializes every animation eagerly. |
| `src/entry/page-all-lite.js` | DOM-aware resolver that dynamic-imports only animations present on the page. |
| `src/entry/feature-hero.js` | Feature-specific bundle for the hero section. |
| `src/entry/feature-api.js` / `feature-chart.js` / `feature-dots.js` / `feature-dots-bulge.js` / `feature-radial.js` / `feature-cards.js` / `feature-deposits.js` / `feature-orbit.js` / `feature-small-cards.js` / `feature-window-graphic.js` | Ready-made single-animation bundles for the remaining demos. |
| `npm run build:hero:single` (and `:api`, `:chart`, `:dots`, `:dots-bulge`, `:radial`, `:cards`, `:deposits`, `:orbit`, `:small-cards`, `:window-graphic`) | Emits `dist/feature-*.js` + `dist/feature-*.css` (no shared chunks) for copy/paste deployments. |

All entry files are exposed to Vite via `vite.config.js`, yielding stable entry outputs like `dist/page-all-lite.js` plus hashed shared chunks. Tree-shaking ensures a `feature-*` build only contains the animation it needs plus shared libs once.

### Webflow / CDN Usage

GitHub does not serve repository JavaScript as a production CDN, but committed `dist/` files can be loaded through jsDelivr:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@main/dist/page-all-lite.js"></script>
```

Use `page-all-lite.js` for Webflow pages. It scans for `data-anim="<name>"` sections and loads only the matching animation chunks from `dist/chunks/`.

### Authoring Markup

```html
<section data-anim="cards">
  <div class="cards-stage" data-follow-root>
    <article class="card" data-follow-mouse data-strength="0.08"></article>
    <aside class="badge" data-follow-mouse data-follow-depth="12"></aside>
  </div>
</section>
```

- Wrap each block in `data-anim="<name>"` so the relevant module can discover it.
- `data-follow-root` + `data-follow-mouse` opt elements into the shared pointer-follow engine. The helper auto-maps z-index (or `data-follow-depth`) to stronger motion so deeper layers drift more subtly.
- Optional tuning attributes per follower:
  - `data-strength` – lerp factor while the pointer is moving (default range `0.04–0.12` mapped from depth).
  - `data-max-offset` – maximum pixel offset per axis (default range `10–40` mapped from depth).
  - `data-axis` – limit motion to `x`, `y`, or `both`.

### Effect Data Attributes

Every section is discovered through `data-anim="<name>"`. The helpers below key off additional data attributes so you can author markup declaratively.

Future docs note: planned Webflow-facing tooltip copy, optional attribute behavior, and editor-safe toggles are tracked in [docs/future-builds.md](/Volumes/WD40/Soo.ba%20Dropbox/Soo.ba%20Studio/Goran/Projects/Stitch/Code/stitch-animations/docs/future-builds.md).

#### Shared handles

| Attribute | Scope | Description |
| --- | --- | --- |
| `data-anim="<name>"` | Section wrapper | Registers the block with the resolver so the matching animation module can boot. |
| `data-visibility-threshold="<0-1>"` | Sections or effect sub-wrappers | Overrides the default IntersectionObserver threshold (see each module for defaults); read it programmatically via `resolveVisibilityThreshold(el, fallback)`. |
| `data-reveal-group` / `data-reveal` | Any element | Opts into the shared entrance controller. Optional overrides: `data-reveal-delay`, `data-reveal-duration`, `data-reveal-offset`, `data-reveal-stagger`, `data-reveal-ease`, `data-reveal-opacity-duration`. |
| `data-follow-root` | Container | Enables pointer-follow for all nested `[data-follow-mouse]`. |
| `data-follow-mouse` | Layer | Marks an element as a follower. Optional tuning: `data-follow-depth`, `data-strength`, `data-max-offset`, `data-axis`. |
| `data-counter-*` | Value labels | Used by `value-counter`: `data-counter-initial`, `data-counter-value`, `data-counter-duration`, `data-counter-prefix`, `data-counter-suffix`, `data-counter-decimals`, `data-counter-locale`, `data-counter-grouping`, `data-counter-snap`. |
| `data-zoom-lens="true"` | Dense graphic wrapper | Enables the reusable magnifier. Set it to `false` to disable it. Optional tuning: `data-zoom-lens-size`, `data-zoom-lens-scale`, `data-zoom-lens-border`, `data-zoom-lens-target`. |

#### Hero (`data-anim="hero"`)

- Wrap screens with `.stacked-windows_wrap`; each child `.stacked-windows_img-wrap` can inherit `data-reveal` overrides.
- Per wrap you can tweak entrance pacing with `data-reveal-duration`, `data-reveal-stagger`, and the module-specific shorthands `data-dur` / `data-stagger` (if present they win over computed CSS custom props).
- The section only needs `data-reveal-group` + `data-anim="hero"`—layout, class toggles, and ready timers run automatically.

#### API hover (`data-anim="api"`)

- Place `data-follow-root` on `.api-graphic_wrap` (or an outer container) and `data-follow-mouse` on `.api-graphic_track`. Optional `data-follow-depth` per badge lets you bias the parallax strength.
- `data-visibility-threshold` on the wrap caps when the glow loop/ripple becomes active (defaults to `0.5` if unspecified).
- The glow template is pulled from `.api-graphic_glow`; keep it `aria-hidden` and the shared `createGlowSweep` helper will clone it when needed—no extra API required.
- Pointer presses run through `createPressRipple`, so every `[data-follow-root]` wrapper can restart both the button animation (`is-pressing`) and the ripple template (`is-ripple`) without duplicating listeners.

#### Cards stack (`data-anim="cards"`)

- Same follow data attributes as above; cards, pills, and floating chips simply add `data-follow-mouse` plus (optionally) `data-follow-depth` to layer them.
- The dots background just needs the standard `.features-graphic_cc_dots-canvas` + `.features-graphic_cc_dots-sensor` pairing; the JS will read them automatically when it sees `data-anim="cards"`.

#### Deposits (`data-anim="deposits"`)

- Reuses the dots background handles plus value counters. The primary balance label accepts the full `data-counter-*` API as shown in the demo (`data-counter-prefix="$"`, `data-counter-initial="0"`, etc.).
- Any element with `[data-deposits-time]` receives the "live clock" update that runs every ~3s.
- `data-visibility-threshold` on the section controls when the dots/counter boot (demo uses `0.5`).

#### Chart (`data-anim="chart"`)

- Drop `data-visibility-threshold` on the section or `.scale-graph_wrap` to delay the setup until the sparkline is a certain percentage inside the viewport (`0.5` by default).
- The large headline number uses a single `data-counter-*` config so you can ship the formatted number in the markup and let the counter animate toward the dataset value.
- The tooltip date labels use `data-date="past"` and `data-date="today"`—the script rewrites their text nodes based on the generated date range.

#### Dots fields (`data-anim="dots"` / `data-anim="dots-bulge"`)

- Both require the expected `<canvas>` + sensor pair. Each section can override the trigger ratio via `data-visibility-threshold`.
- The bulge variant reuses the legacy displacement shader, so it simply switches to the alternate helper by opting into `data-anim="dots-bulge"`.

#### Orbit (`data-anim="orbit"`)

- The parent section usually carries `data-follow-root` because the pedestal badge and inner circles are regular `[data-follow-mouse]` followers.
- Each `.orbit_wrap` should start with `data-orbit-pending="true"` so CSS can keep it hidden until the script computes sizes; the controller removes the attribute once everything is laid out.
- Optional `data-visibility-threshold` works the same as other effects if you need the orbits to wait longer before animating.

#### Window graphic (`data-anim="window-graphic"`)

- Add `data-reveal-group` to the section and `data-reveal` only to the exact elements you want sequenced. The window-graphic module no longer injects reveal targets automatically.
- Value labels use `data-value` plus optional `data-format`. Adjacent `[data-decimal]` nodes can either stay static or animate when `data-animate="true"`.
- Date labels use `data-date="true"` and optional `data-time="true"` to render the current date/time.
- Add `data-zoom-lens="true"` to the graphic wrapper for the magnifier. Set it to `false` to disable it. The demo uses `data-zoom-lens-size="240"` and `data-zoom-lens-scale="1.9"`.

#### Radial console (`data-anim="radial"`)

- Provide `data-visibility-threshold` when you want the drag/inertia logic to wait for a different intersection ratio (defaults to `0.35`).
- The canvas is referenced via `#radial_canvas` and the helper reads theme colors from CSS custom properties, so only the section + data attr are needed for JS.

### Adding A New Animation

1. `mkdir -p src/animations/<name>`.
2. Create `index.js` exporting `init(root = document)` and `styles.css` for scoped CSS.
3. Import the animation in `src/entry/page-all.js` (and optionally add `feature-<name>.js`).
4. Register a resolver in `page-all-lite.js` for conditional loading.
5. Add demo markup to `index.html` (or your host page) with `data-anim="<name>"` blocks plus any data attributes needed by shared effects.
6. If the animation needs shared behavior, add it to `src/lib/` and keep it stateless/parameterized so multiple modules can reuse it.

## Legacy Assets

Original files now live under `legacy/scripts-original/` and `legacy/styles-original/` unchanged for reference. Treat them as read-only while porting logic into the new modules.

### Webhook (`data-anim="webhook"`)

The local demo is at `/#webhook`. Put two bubbles inside `[data-webhook-stage]`, marking the upper/source bubble `data-webhook-from` and the lower/destination bubble `data-webhook-to`. The module generates an SVG connector from the source's bottom center to the destination's top center. Both left-to-right and right-to-left layouts work; placement and bubble appearance are controlled by your host CSS. Keep a vertical gap between the bubbles.

Load `src/animations/webhook/styles.css` (or its built equivalent) for the connector's structural styles. The demo-only bubble styles live in `index.html` so Webflow can supply its own styling. The animation uses CSS `translate` on the two bubble elements; use inner wrappers for any additional translate effects.

Bubbles drift by a few pixels at different speeds. Hovering anywhere in the Webhook section adds eased movement away from the pointer: bubbles near the cursor stay steadier, while farther bubbles travel more (up to 26px). Leaving the section eases them back to their idle drift. Every 4.5 seconds, a continuous blue band passes through the source dot, connector, and destination dot. Each dot fills from top to bottom as the head passes and clears from top to bottom as the tail passes. Dot fills and line movement share the same measured path position. Customize connector colors with `--webhook-line-color` and `--webhook-pulse-color`. Motion pauses offscreen and in hidden tabs; reduced-motion preferences disable drift and pulses. Multiple stages are supported. Build a standalone bundle with `npm run build:webhook:single`.

### Reference (`data-anim="reference"`)

The local demo is at `/#reference`. Inside `[data-reference-stage]`, mark the hub `data-reference-center` and the four cards `data-reference-card="left-top"`, `"left-bottom"`, `"right-top"`, and `"right-bottom"`. Position the cards on their named sides with room for the connectors. Layout and card styling live in the demo markup; Webflow can provide its own styles. Load the structural `reference/styles.css` alongside the animation.

Two blue pulses leave the hub simultaneously every 4.8 seconds, reach the left/right junctions together, and split into upper/lower branches. Source dots fill outward in sync with the pulse. Gray connectors fade toward the outside cards, and blue pulses follow the same gradient fade. All five boxes drift independently and repel from the pointer over the whole section; distant cards move more. The module owns their CSS `translate` property. Motion pauses offscreen/in hidden tabs and respects reduced motion. Multiple stages are supported.

Customize `--reference-line-color` and `--reference-pulse-color`. Build a standalone bundle with `npm run build:reference:single`.

### Access (`data-anim="access"`)

Preview at `/#access`. Wrap rows in `[data-access-stage]`. Each `[data-access-row="view|publish|delete"]` contains a `[data-access-label]` and three `[data-access-option="view|publish|delete"]` elements, each with a `[data-access-status]` circle. Add `data-access-reveal` to the avatar group, label, logo, and each option in entrance order. Load `access/styles.css` for structural connectors, entrance motion, and status states; appearance/layout is supplied separately in the local demo for replacement by Webflow styles. Mark the circular logo wrapper with `data-access-logo`. The pulse splits around its upper and lower outlines, rejoins at the right edge, and continues to the selected permission.

Rows reveal from right to left with staggered parts. Placeholder avatars enter individually from increasingly spaced positions, settling into an overlapping group before the label appears. Once all entrances finish, pulses start at 0, 0.5, and 1 second, respectively. Each travels for 2.1 seconds, including the split around the logo outline, to its matching arrow, switching only that option to a blue check. Checks hold until the 5.5-second pulse cycle resets. No hover movement. The animation pauses offscreen/in hidden tabs and shows the final permissions immediately for reduced-motion users. This is a visual demo, not access-control enforcement.

Customize `--access-line-color` and `--access-pulse-color`. Build with `npm run build:access:single`.

The Webhook, Reference, and Access pulse colors default to the Webflow token `--_primitives---colors--primary-blue`, with `#3342ff` as the local fallback. Per-animation pulse-color overrides still take precedence.

### Collections (local motion study)

Open `/collections.html` on the local dev server for the isolated preview, or scroll to
`#collections` in the main playground. The replay button restarts the entrance.
The windows rise into view at 25% visibility, hold for 1.6 seconds, then the front
window slides out through the bottom-right corner as the remaining windows move
forward. It returns behind the stack, followed by a 3.5-second hold before each
subsequent swap. There is no idle floating.

The animation lives in `src/animations/collections/`. Add or remove
`[data-collection-card]` children inside `[data-collections-stage]` to change the
number of windows; the stack spacing automatically fits the same footprint.
Offscreen sections and hidden tabs pause, and reduced-motion preferences display
a static stack. No Webflow integration is included in this study.

### Shared code typing and scroll

Financial Architecture and Change Due Date reuse `createCodeScrollEffect` from
`src/lib/effects/code-scroll.js`. Both compiled entries import the same small
`dist/effect-code-scroll.js` module. See [effect API and release workflow](docs/code-scroll.md).

Run `npm test` and `npm run build:all` to validate and compile all animations
and Webflow embeds. No new animation dependency is required.
