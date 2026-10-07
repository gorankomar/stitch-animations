# Fallback and Retry Logic

Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=436-1618 — 540 × 278.

Webflow site `6823036cd77b3093eaf9154d`, Animations Playground `6ab4079ac7ca32e3a6c168c8`. Reusable Animations / Fallback and Retry Logic component `3cf6fc65-bb97-16dd-da16-23a9b37e01a8`. Saved as draft; do not publish Playground.

Native Webflow styles own layout, type, border, shadow, static four-row positions and concealed spare rows. Source `fallback-retry-preview.css` records native styles only for local preview; it is never imported by deployed JS. `fallback-retry-scoped.css` records the style-only in-component exceptions (containment, gradient/dot fallback, canvas sizing, backdrop filter). Aspect ratio 540/278; cqi measures the outer shell. Text inherits Webflow's Abcdiatype body font.

Utility / Label `fedfee7f-20d9-ac0d-844d-bf845044fd37` uses supported text/variant props. Added Purple Pill, Pink Pill, Orange Pill, Green Pill and Neutral Pill variants; original Blue, Green and Orange styles remain unchanged. Pill variants use proportional 11px/14px type, 8px/4px padding and fully rounded corners. This is an expressly requested Label extension, not illustration descendant CSS. Existing Icons / Icon - Transactions is reused unchanged inside a 12px-equivalent sizing wrapper and 22px-equivalent dark circle. No additional vector/raster asset delivery is required: supplied connector artwork is expressly replaced by one native HTML line; supplied dot artwork is expressly replaced by canonical Dots Field plus a static CSS fallback.

## Carousel

`fallback-retry.js` initializes `[data-fallback-retry]` through stageInitializer and canonical `sampleUpwardCarousel`.

- `data-carousel-visible-slots="4"`: visible row count; requires this count plus two native `[data-fr-row]` wrappers. The shared effect's legacy default remains three visible / five total.
- `data-carousel-scale-mode="edges"`: all fully visible rows stay at scale 1. Only the exiting top row and incoming bottom row interpolate scale. `adjacent` retains the existing effect's scale treatment by default.
- `data-carousel-hidden-scale=".72"`: hidden endpoint scale.
- Local wrapper spacing is 54 design pixels (10cqi); source dimensions scale with parent width.

Six-row cyclic order: Payment initiated / Success → Payment failed / PSP timeout → Retry payment IF Response = PSP timeout → Payment initiated / Success → Payment completed / Success → New payment / Queued → repeat. Initial Figma four rows remain unchanged. Additional completion/new-payment states make the repeat logically coherent. Two invisible slots recycle without flashing or visible travel across the stack.

Movement/scale resolve Global Styles `--motion-ease-primary`; opacity uses raw linear progress. Duration resolves `--motion-duration-default`. Live Global Styles inspected 2026-10-07: cubic-bezier(.11,.61,.27,.99), 770ms. Shared 3×duration hold / 2×duration move retained; existing consumers keep their exact defaults. No unrequested reveal/hover/pointer motion is added to rows.

Dots reuse `createDotsField`, the subtle effect, with a canvas and sensor. Static background remains visible if JS is absent. Dots are created only while visible, tab-active and motion-enabled; disposal removes listeners/RAF/observers. Resize scales dot spacing/size. Carousel stage clock pauses offscreen/hidden; reduced motion, setup failure and cleanup restore the native four-row fallback. Symbol mount guard and stageInitializer support repeated instances and disposal/remount.

## Validation and delivery

Local preview `fallback-retry-preview.html` contains simultaneous 540px/345px instances, with local Arial fallback typography. Native Designer verified at 436.40625px desktop and 345px mobile; ratio and four visible rows preserved, live Abcdiatype inherited, mobile labels 7.02778px and frame height177.609375px. Local preview is not evidence of native Webflow styling; Designer checks supply that evidence.

Behavior tests cover four visible slots, fixed visible scale, entering/exiting scale, linear opacity independent of easing, twelve turns/order, exact six-turn seam, invisible recycling, legacy defaults and attribute validation. Browser verification covers two sizes/instances, edge scale during movement, reduced motion, cleanup/remount, JS-disabled fallback and errors. Full tests and shared build/dependency checks pass.

Saved locally and to Webflow draft. New compiled motion is registered in page-all, page-all-lite and the multi-entry build. No GitHub push/merge, staging activation, production promotion or Webflow publication is authorized/performed in this chat. Playground's permanent staging loader cannot run the new module until a staging release is authorized, merged and activated. Do not add an inline runtime or change its permanent URLs to bypass that boundary.

Playground page metadata was verified draft=true after edits. Its public staging path returned HTTP404 on 2026-10-07; no page publication was performed.
