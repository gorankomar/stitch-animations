# Card Controls

Figma: PCbd0DyXWAD2cDANtl7bpH / 297:1558 (540 × 403).
Webflow: Animations Playground, site 6823036cd77b3093eaf9154d, page 6ab4079ac7ca32e3a6c168c8.

The graphic is native Webflow content. Phone Shell contains Card Controls Activity in its Slot; that component contains Credit Card with its Dark Blue variant and four activity rows. The settings card uses three Controls / Toggle instances and Icons / Icon - User Filled. Native Webflow styles own sizing, typography, gradients, cursor artwork, and resting shadows.

The shared page-all-lite loader detects `data-card-controls` (the root also has `data-anim="card-controls"`) and loads the animation module and its motion-only CSS. Do not add a separate feature script to the graphic. The code-scroll, reveal-groups, follow-group, card-lift and connector effects are shared with the existing library.

Rows reveal once. After the reveal, the cursor activates Travel and then Food, exits, and the switches reset while the cursor is hidden. Cursor targets and connector endpoints are measured from live rectangles each frame, including card hover translation. Utilities stays inactive. The connector uses the same stroke width for its base and pulse. JSON scrolls continuously; the code window follows the pointer by at most 3px. Motion pauses offscreen and in hidden tabs. Reduced motion shows readable content, active Travel/Food, and a static connector without a cursor.

Build with `npx vite build --emptyOutDir false`, then run `npm test`. Ship generated entries, chunks and styles together; update only the shared page loader's pinned commit in Webflow.
