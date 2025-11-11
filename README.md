# Stitch Animations

Modernized animation playground built on Vite with shared utilities, modular animation bundles, and code-splitting-friendly entry points.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173/public/index.html` to preview the demo markup. The script tag inside the page defaults to the resolver bundle (`page-all-lite`). Swap it with `/src/entry/page-all.js` during development or with an emitted file from `dist/` after running `npm run build`.

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
│  ├─ lib/                  # Shared utilities
│  ├─ animations/hero/      # One module per animation
│  └─ entry/                # Bundles: page-all, page-all-lite, feature-*
├─ public/index.html        # Demo markup
├─ dist/                    # Build output (gitignored)
```

### Shared Utilities

- `src/lib/easing.js` – Canonical easing + timing constants.
- `src/lib/config.js` – Centralized selectors, class names, thresholds.
- `src/lib/dom.js` – Thin wrappers for `querySelector`, dataset helpers, and attribute builders.
- `src/lib/mouseFollow.js` – A singleton-friendly pointer engine; call `ensureMouseEngine()` once and subscribe elements via `followMouse(el, options)`.

### Animation Contract

Each animation exposes `init(root = document)` from `src/animations/<name>/index.js`.

```js
export function init(root = document) {
  ensureMouseEngine();
  const section = qs('[data-anim="hero"]', root);
  if (!section) return;
  // wire up DOM + utilities
}
```

The paired CSS lives next to the module (e.g., `src/animations/hero/styles.css`). Entry files import both the JS module and CSS to keep dependencies explicit.

### Entry Points / Bundles

| Entry | Purpose |
| --- | --- |
| `src/entry/page-all.js` | Imports and initializes every animation eagerly. |
| `src/entry/page-all-lite.js` | DOM-aware resolver that dynamic-imports only animations present on the page. |
| `src/entry/feature-hero.js` | Feature-specific bundle for the hero section. |

All entry files are exposed to Vite via `vite.config.js`, yielding hashed outputs like `dist/page-all.<hash>.js`. Tree-shaking ensures a `feature-*` build only contains the animation it needs plus shared libs once.

### Authoring Markup

```html
<section data-anim="hero">
  <div class="hero-orb" data-follow data-strength="0.06" data-max-offset="48"></div>
  <div class="hero-chip" data-follow data-strength="0.12" data-max-offset="18"></div>
</section>
```

- Wrap each block in `data-anim="<name>"` so the relevant module can discover it.
- Add `data-follow` to any element that should use the shared mouse-follow engine. Optional tuning attributes:
  - `data-strength` (default `0.08`) – lower numbers feel slower / floatier.
  - `data-max-offset` (default `24`) – max px offset along each axis.
  - `data-axis` – limit motion to `x`, `y`, or `both`.

### Adding A New Animation

1. `mkdir -p src/animations/<name>`.
2. Create `index.js` exporting `init(root = document)` and `styles.css` for scoped CSS.
3. Import the animation in `src/entry/page-all.js` (and optionally add `feature-<name>.js`).
4. Register a resolver in `page-all-lite.js` for conditional loading.
5. Update markup with `data-anim="<name>"` blocks.

## Legacy Assets

Original files now live under `legacy/scripts-original/` and `legacy/styles-original/` unchanged for reference. Treat them as read-only while porting logic into the new modules.
