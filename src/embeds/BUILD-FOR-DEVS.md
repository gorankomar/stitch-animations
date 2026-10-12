# Build for Devs

Native Webflow component **Animations → Build for Devs** (`7da8746a-86b3-48fc-65ab-33e53c4b4a87`). Draft Playground instance: `91360e84-4ccb-92f2-c316-5e410cb912c5`, page `6ab4079ac7ca32e3a6c168c8`, site `6823036cd77b3093eaf9154d`.

Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=456-1652. Frame 258 × 232. Window at (18,42), 221 × 148. The entire illustration scales with its own parent width. Typography inherits the site's Body font (verified Abcdiatype, Arial, sans-serif), rather than the Figma mono font. Header CODE, three gray circles and chevron are native HTML/CSS; no header images.

Ten exact Figma SVG layers remain external images with original dimensions and local masters in `assets/build-for-devs/originals`. Originals retained without further lossy optimization: total approximately 6.5 KB. Webflow asset bindings and native image geometry were verified on the Designer canvas. The five motion paths are the corresponding original base-layer paths, with their frame-space origins. No new vector geometry is substituted.

Runtime is the existing `create-card.js`, detected by `data-create-card`; no new module, loader or channel activation is needed. Existing Soft Path Pulse and Code Scroll behavior is reused unchanged. `.create-card_lines` is a runtime hook only; the new illustration owns `bfd-*` native styles and does not alter Create New Card. Each track child groups two physical code lines into one fixed-height row, allowing the existing seven-row scroll window to cover fourteen physical lines and preserve the loop's typing continuity. 27 paired rows include the initial Figma Solidity declarations, constructor, transfer, approve, transferFrom and transfer helper. This is decorative sample code, not a deployed contract.

Base layout, gradients, typography, sizing, colors, syntax spans, header circles, borders and shadows are native Webflow styles. A separate style-only embed (`6eebe97d-4f66-2963-808a-718f557202f3`) carries box sizing, inline-size containment, horizontal writing mode, preformatted whitespace, generated pulse overlay geometry, and running-state static-pulse selectors. Local `build-for-devs.css` is preview-only and is not loaded by the deployed runtime. There is no script embed in this component.

Motion remains the cataloged continuous linear scroll/path travel; verified Global Styles primary ease `cubic-bezier(.11, .61, .27, .99)`, default duration 770ms. Visibility, hidden-tab clock suspension, reduced-motion restoration, duplicate mounting and disconnected-root cleanup are inherited from Create New Card. The code scroll effect's restore/disposal/loop tests pass. Existing `init` does not return a cleanup handle; disconnected roots dispose themselves.

Local preview: `/build-for-devs.html`, regenerate with `node scripts/build-build-for-devs-preview.mjs`.

Verification on 2026-10-09: native Designer static appearance and all ten image loads; desktop Preview running code scroll, 140 pulse paths, expected duplicated track; 393px mobile Preview with 345 × 310 illustration; custom code disabled preserved styled initial composition. Playground metadata remains draft:true. No Webflow publication or staging/production animation activation performed.
