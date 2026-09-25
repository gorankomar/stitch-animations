# Connector animations and Webflow

Use one module loader before the closing body tag:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@main/dist/page-all-lite.js"></script>
```

The loader detects sections, loads the matching animation, and automatically loads the structural CSS for Webhook, Reference, and Access. Do not also load their standalone scripts on the same page. For production, replace `main` with a tested commit SHA to pin the code and avoid CDN cache delays.

You supply card appearance and layout in Webflow. Stages need explicit height; positioned cards need room for the lines. Keep stages free of padding/borders (put those on an outer wrapper). The generated SVG fills the stage. Webhook/Reference own the cards' CSS `translate`; put other transforms on nested wrappers. The blue defaults to `var(--_primitives---colors--primary-blue, #3342ff)`.

## Markup attributes

- Webhook: outer `data-anim="webhook"`; inner `data-webhook-stage`; two cards with `data-webhook-from` and `data-webhook-to`. From attaches at bottom center, to at top center. Either left/right arrangement works.
- Reference: outer `data-anim="reference"`; inner `data-reference-stage`; hub `data-reference-center`; cards `data-reference-card="left-top"`, `"left-bottom"`, `"right-top"`, `"right-bottom"`. Keep these cards on their named sides. Center the hub at 50% height and use matching top/bottom offsets for the outer rows (Webflow uses 11.5%) so idle branches are symmetrical.
- Access: outer `data-anim="access"`; inner `data-access-stage`; rows `data-access-row="view"`, `"publish"`, `"delete"`. Each row contains `data-access-label`, a circular `data-access-logo`, and three `data-access-option="view|publish|delete"` wrappers containing `data-access-status` circles and their text labels. Put `data-access-reveal` on the avatar group, label, logo, and each option. Put `data-access-avatars` on the group of individual avatar elements; no demo classes are required by JavaScript. Give the logo an opaque background and a 2px border.

The local index contains complete examples. Access status circles get their X/check from CSS; no icon children are required.

## Shared implementation

- `src/lib/effects/connector.js`: SVG creation, gradient stops, rounded routes, cached path lengths, traveling pulse bands, directional dot fills.
- `src/lib/effects/connector.css`: SVG positioning and stroke structure.
- `src/lib/effects/card-lift.css`: shared direct hover lift and soft shadow for Webhook boxes and Reference product cards and central logo box. No pointer tracking or movement of neighboring cards.
- `src/lib/effects/animation-stage.js`: mounting, disposal, visibility clock, resize invalidation, reduced motion, hidden-tab pausing.

Animation modules retain only their layout-specific routing, colors and timing. Static Access geometry is measured during entrance and after resize; pulse frames reuse it. Path lengths are recomputed only when path geometry changes. The multi-entry build shares helpers through common chunks; standalone builds include the helpers they need.

For a future animation, define its stage selector with `stageInitializer`, build SVG geometry using connector helpers, and call `animateStage` with an update callback. Return a disposer for the clock and generated SVG. The shared card-lift stylesheet supplies direct hover feedback without pointer listeners. `paintPulse` takes positions in path units; branch offsets keep split pulses synchronized. `fillDot` consumes the same head/tail positions.

Run `node --test tests/connector.test.js` and `npm run build`. Single-feature scripts use `npm run build:<name>:single`; build to a separate output directory when preserving a multi-entry export.
