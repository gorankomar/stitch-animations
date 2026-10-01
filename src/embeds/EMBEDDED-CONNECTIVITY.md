# Embedded Connectivity

Webflow: **Animations → Embedded Connectivity**, last row of the draft
**Animations Playground**. Reference: Figma `PCbd0DyXWAD2cDANtl7bpH`, `277:3333`.

The central company mark, concentric circles and connector artwork come from the
reference. SVG assets in `assets/connectivity/` are optimized with SVGO multipass.
Native cards contain instances of **Credit Card → Provider**: Visa (top), Amex
(right), MasterCard (bottom), Mada (left), all in original colors. Provider now
includes Amex and Mada variants, backed by reusable **Logos → Amex / Mada**
components with Original Color and Inherit Color variants. The existing Visa and
MasterCard color properties and defaults remain intact.

The loop lasts 4.8 seconds. Four blue pulses travel outward together; after arrival,
providers translate outward by up to 1.2 reference pixels and scale by 1.2%.
The three background circles respond in sequence: inner 1.4%, middle 0.6%, outer
0.2%. Dimensions use container units to preserve the 258×232 reference proportions.
The loop pauses outside the viewport and in hidden tabs, and reduced motion uses
the static composition. A shared mount registry prevents duplicate animation
controllers when the component is used more than once.

Build with `node scripts/build-connectivity-embed.mjs` or `npm run build:all`.
The portable behavior/style embed is `dist/embeds/embedded-connectivity.html`.
The local preview is `/embedded-connectivity.html`. Native Webflow layout source
is `embedded-connectivity-webflow.html`; the standalone version uses local artwork
in `embedded-connectivity-markup.html`.

Webflow's WHTML importer lowercases SVG element tags. Restore `linearGradient`,
`clipPath`, and `fe*` filter primitive tag casing after import, otherwise the gray
connectors and circle shadows do not render.

### Designer/static correction (September 28)
Install `dist/embeds/embedded-connectivity-styles.html` as a script-free HTML embed inside `.ec-canvas`. This contains the CSS and replacement connector SVG. Install `embedded-connectivity-motion.html` separately in the hidden motion embed. Webflow Designer suppresses script-containing embeds, including their adjacent styles; separating them keeps rings and nested Provider logos correctly positioned before JavaScript runs.

Connector endpoints use each facing box border's centerline, including the box's outward translation and scale. Gray and blue paths share a 0.5-unit width and transparent-to-solid gradients. Decorative ripple overlays expand only outward, then disappear before resetting; the original concentric rings remain intact as the static illustration. Inner, middle and outer waves start at 1.35, 1.75 and 2.15 seconds, with progressively smaller expansion.

Pulse visibility follow-up: outward travel now lasts 1.1 seconds with a 55%-length trail. Both connector gradients reach full opacity at 55% of the path, retaining the transparent hub end and identical 0.5-unit strokes. Arrival remains at 1.35 seconds to preserve the card/ripple synchronization.
