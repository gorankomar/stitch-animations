# Wallet
- Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=435-1611 (540 × 278).
- Webflow: site `6823036cd77b3093eaf9154d`; Playground `6ab4079ac7ca32e3a6c168c8`; **Animations → Wallet Graphic**, component `cb52e093-568c-ef31-d761-0b0eeb05407c`. “Wallet” is the animation name (`data-anim="wallet"`); Webflow already has a Phone Elements component named Wallet, so the new reusable component is named Wallet Graphic.
- Source: wallet-markup.html (native composition and component insertion placeholders), wallet-native.css (native Webflow styles reference), wallet-fallback.html (in-component style-only embed).
- The supplied artwork is a flattened PNG; the user explicitly requested native reconstruction with existing components. No raster is deployed. Native text, billing block, search symbol and expense rows replace the flattened UI.
- Reuse: unchanged `features-graphic_grid-bg`, `window-graphic_outer` and `window-graphic_inner` classes; native Credit Card Gray variant with Rotate 4-digits=false and Reveal=false; native Icon - Bank. Card descendants have no illustration overrides. Shared frame values remain in their existing Webflow classes.
- Sizing: root is the inline-size measuring container. Frame keeps 540:278 ratio; all new geometry is proportional. Overflow clip prevents focus/click scrolling of the deliberately oversized window.
- Motion: canonical Reveal — Soft, bottom-to-top, using the shared automatic data-anim loader. Grid, frame wrapper, title, card wrapper, billing unit, expense panel, heading, search and each complete row are targets. No new JavaScript, loader edits or release required. Native card’s disabled data-reveal=false is excluded by shared reveal behavior.
- Live tokens inspected: --motion-ease-primary=cubic-bezier(.11,.61,.27,.99), --motion-duration-default=770ms, --reveal-stagger-default=200ms, --reveal-opacity-ratio=.34. Opacity is linear.
- Fallback embed keeps artwork visible until the controller sets its inline reveal transform. It retains grid opacity .43 and makes reduced-motion targets static. The scoped grid opacity rule changes transient reveal state only; the shared grid class is unchanged.
- Verification: Designer and custom-code Preview inspected; complete sequence and computed 770ms movement / 262ms linear opacity confirmed. Existing reveal regression tests: 3 passed.


## Staging release — 2026-10-07

User authorized publishing all four illustrations and their related source, assets, documentation, tests and generated distribution files to GitHub and staging. Full release validation passes 97/97 tests and shared dependency verification. The shared carousel retains the established 6×duration hold / 4×duration move, preserving Revolving Credit behavior. See docs/releases/2026-10-07-digital-wallets-staging.md for final delivery evidence; earlier draft-only delivery statements above describe preparation history.
