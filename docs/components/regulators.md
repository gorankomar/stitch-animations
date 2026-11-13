# Regulators

Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=575-6467

540 × 278 composition. Reusable Webflow component **Regulators**, ID `56d87bae-3b31-4869-c632-d7771d2efad3`, saved in Animations Playground's Features Wrapper. Playground remains draft; no publication, GitHub merge or channel activation was performed.

## Structure and appearance

Native shell establishes inline-size containment through the component's style-only embed. Native frame preserves the aspect ratio, gradient, clipping and border. One full-frame background uses `regulators-grid` as its main class and the existing `features-graphic_grid-bg` utility afterward. Its shared grid appearance is unchanged; there is no copied grid CSS in the deployed component.

Three positioned reveal elements each contain one native circle and one directly styled inline SVG HtmlEmbed. Reveal and hover own separate transforms. There is no intermediary row or icon sizing wrapper. Circle styling and radius are defined once on `regulators-circle`; supported sizing, layout, gradient, border and shadows live in native Webflow styles. The style-only embed supplies containment, custom properties, pseudo-element tint, token-based hover transitions, SVG fitting, and reduced-motion overrides.

`src/embeds/regulators-native.css` records native styles. `regulators-webflow-markup.html` records rendered structure and inline artwork; `regulators-scoped-style.html` is the separate style-only embed. `regulators-preview.html` is local review only and contains two parent widths plus source/optimized comparisons; its grid CSS must not be deployed.

## Motion

The existing shared loader finds `data-anim="regulators"` and initializes canonical Soft Reveal: bottom-to-top, 24 design-pixel offset, DOM order PCI → ISO → Saudi, existing 200ms stagger. Preview resolved movement to 770ms with `cubic-bezier(.11,.61,.27,.99)` from Global Styles; independent opacity uses 262ms linear. Content remains visible until existing Reveal initialization adds `is-reveal-ready`.

Circles reuse Card Hover's `data-card-lift`, independent `translate` property and blue shadow. Scoped overrides use the live `--motion-duration-default` and `--motion-ease-primary` in both directions. Hover adds a 4px design-space lift and #3342ff overlay at .045 opacity; opacity transitions linearly. Fine-pointer hover only. Reduced-motion CSS removes movement/transitions and preserves visible reveal content. No new JS module, loader change, external CSS dependency or staging release is necessary.

## SVG optimization

Untouched Figma exports are retained in `src/embeds/assets/regulators/originals`. Delivery assets are inline SVGs, without IDs or external references. Filled artwork retains its geometry and does not gain strokes. Native circles replace Figma's circle/shadow SVG; the original background grid is intentionally replaced by the existing CSS grid as requested.

SVGO 4.1.0, multipass, numeric precision 2, transform precision 8 for convertPathData and convertTransform. Explicit reviewed SVGOMG-style plugin list is recorded in `svgo.config.json`; XMLNS and viewBox are retained. Root dimensions remain on SVGs; proportional component sizing fits their rendered geometry. Reproduce with `optimize.mjs` from the repository root using SVGO 4.1.0.

| Artwork | Original bytes | Optimized bytes |
| --- | ---: | ---: |
| PCI | 2,425 | 1,229 |
| ISO 27001 | 25,435 | 8,811 |
| Saudi | 8,488 | 3,544 |

Precision 2 passed side-by-side visual review at native icon sizes and half-size component rendering. All three SVGs are nonempty and retain their aspect ratios. No gradients, masks or IDs remain in the delivered icon SVGs, so repeated inline instances cannot collide.

## Verification — 2026-10-30

- Webflow Designer: styled native fallback with three visible inline icons.
- Webflow Preview with custom code enabled: existing permanent staging `page-all-lite.js` loader, three completed Reveal targets, exact movement/opacity token values, blue hover endpoint .045 and translate -4.66667px at a 630px parent, and hover return.
- Desktop Preview 630 × 324.33px; mobile viewport 393px gave a 345 × 177.61px frame, three circular 77.08px holders and proportional icons without clipping. Local 540px and 270px simultaneous parents also preserved aspect ratio.
- Custom code disabled in Webflow Preview: three SVGs, opacity 1, transform none and inline-size containment retained at mobile size.
- Reduced-motion CSS inspected; OS reduced-motion emulation, explicit blocked-network requests and lifecycle fault injection were not run. No JS was added or changed, so existing loader lifecycle behavior is reused.
- Preview screenshot: `/private/tmp/regulators-webflow-preview.png`.
