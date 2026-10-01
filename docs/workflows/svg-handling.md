# SVG handling

Inputs: original Figma vector export and the parts that need motion.

1. Keep original geometry, viewBox, masks, clip paths, gradients, and aspect ratio. Do not rasterize or redraw vectors to approximate supplied geometry.
2. Keep moving pieces separately addressable with semantic data attributes. Preserve a static fallback.
3. Retain original exports; optimize a derived asset only when rendering stays equivalent. Remove wrappers only after checking transforms and clipping.
4. Namespace IDs per instance and update all references (href, url(), masks, clips, gradients, filters, and accessibility references). An external image cannot expose its internal paths to page JavaScript; inline only the geometry that requires internal animation.
5. Avoid transform ownership conflicts: use separate wrappers for layout, reveal, pointer follow, and path motion.

Verification: compare original and rendered output at desktop/mobile; render two instances to catch ID collisions, clipping, and scaling defects. Check reduced-motion/static fallback and missing-asset behavior.

Completion: reusable vector assets and documented animation targets; no upload or publication is implied.
