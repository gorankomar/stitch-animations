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
- `npm run preview` – Serves the production build from `dist/`.

## Project Layout

```
stitch-animations/
├─ legacy/                  # Original scripts/styles (read-only references)
├─ src/
│  ├─ lib/                  # Shared utilities & effects
│  ├─ animations/           # One module per animation (hero, api, chart, dots, radial)
│  └─ entry/                # Bundles: page-all, page-all-lite, feature-*
├─ public/index.html        # Demo markup
├─ dist/                    # Build output (gitignored)
```

### Shared Utilities

- `src/lib/easing.js` – Canonical easing + timing constants.
- `src/lib/config.js` – Centralized selectors, class names, thresholds, and data-attr handles.
- `src/lib/dom.js` – Thin wrappers for `querySelector`, dataset helpers, and attribute builders.
- `src/lib/math.js` / `src/lib/motion.js` – Shared math helpers, REM conversion, reduced-motion detection.
- `src/lib/observer.js` – IntersectionObserver helpers for guarded entrances.
- `src/lib/raf.js` – RequestAnimationFrame loop helpers.
- `src/lib/effects/follow-group.js` – Shared pointer-follow engine that lets any `[data-follow-root]` drive one or many `[data-follow-mouse]` layers with depth-aware easing.
- `src/lib/effects/reveal-groups.js` – Timeline builder that understands `[data-reveal-group]`, nested clusters, and inline overrides.
- `src/lib/effects/stacked-windows.js` – Layout helper for the stacked window motif (desktop + mobile patterns, auto-indexing, inline CSS vars).
- `src/lib/effects/threshold.js` – Run animation setups once a section is `X%` visible (default `0.25`, override with `data-visibility-threshold` or options).

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
| `radial` | Drag-driven radial console with inertia + intro observer. | IntersectionObserver |
| `cards` | Face unlock inspired credit card stack w/ layered mouse follow + reveal staging. | `follow-group`, IntersectionObserver |

### Entry Points / Bundles

| Entry | Purpose |
| --- | --- |
| `src/entry/page-all.js` | Imports and initializes every animation eagerly. |
| `src/entry/page-all-lite.js` | DOM-aware resolver that dynamic-imports only animations present on the page. |
| `src/entry/feature-hero.js` | Feature-specific bundle for the hero section. |
| `src/entry/feature-api.js` / `feature-chart.js` / `feature-dots.js` / `feature-dots-bulge.js` / `feature-radial.js` / `feature-cards.js` | Ready-made single-animation bundles for the remaining demos. |
| `npm run build:hero:single` (and `:api`, `:chart`, `:dots`, `:dots-bulge`, `:radial`, `:cards`) | Emits `dist/feature-*.js` + `dist/feature-*.css` (no shared chunks) for copy/paste deployments. |

All entry files are exposed to Vite via `vite.config.js`, yielding hashed outputs like `dist/page-all.<hash>.js`. Tree-shaking ensures a `feature-*` build only contains the animation it needs plus shared libs once.

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

### Adding A New Animation

1. `mkdir -p src/animations/<name>`.
2. Create `index.js` exporting `init(root = document)` and `styles.css` for scoped CSS.
3. Import the animation in `src/entry/page-all.js` (and optionally add `feature-<name>.js`).
4. Register a resolver in `page-all-lite.js` for conditional loading.
5. Add demo markup to `index.html` (or your host page) with `data-anim="<name>"` blocks plus any data attributes needed by shared effects.
6. If the animation needs shared behavior, add it to `src/lib/` and keep it stateless/parameterized so multiple modules can reuse it.

## Legacy Assets

Original files now live under `legacy/scripts-original/` and `legacy/styles-original/` unchanged for reference. Treat them as read-only while porting logic into the new modules.
