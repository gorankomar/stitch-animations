# User Onboarding

- Figma: [Onboard users with ease](https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=362-1466), node 362:1466.
- Source: `user-onboarding.js`, `user-onboarding.css`, `user-onboarding-markup.html`, `user-onboarding-native.css`; original SVGs in `assets/user-onboarding`. Local preview: `/user-onboarding.html` with `npm run dev`.
- Webflow: site `6823036cd77b3093eaf9154d`, Animations Playground page `6ab4079ac7ca32e3a6c168c8`, User Onboarding component `28544a77-7edd-0acb-04af-ce98804b16a3`. Native editable layout and SVG nodes; separate scoped style and portable motion embeds. Rebuild portable embeds with `node scripts/build-user-onboarding-embed.mjs`.
- Illustration: explicit animation request; 540 × 278, proportional sizing through the root container. Native Webflow styles own appearance. Scoped CSS supplies container sizing, readiness-gated Reveal states, header parameters, and loading gradients. JavaScript-disabled or initialization-failure state remains visible.
- Contract: `[data-user-onboarding]` root, `[data-uo-box]` entrance wrappers, `[data-uo-row]` row reveals, nested `[data-follow-mouse]` follower, `.uo-line` skeletons. Shared entry and portable bundle use a stable initialization registry to prevent duplicate mounting.
- SVG delivery: original check-circle, clock, and divider sources are retained without optimization; inline native Webflow SVG preserves their paths and proportional rendering. Desktop/mobile visual comparison verified the illustration.
- Effects: canonical Reveal, Pointer Follow, and animation-stage lifecycle. Movement uses Global Styles `--motion-ease-primary` and default duration; opacity is linear with Reveal opacity ratio. Background enters upward and fades in. Foreground starts below the entire frame and enters upward with constant opacity. Nested follower owns pointer transforms, with a maximum four design pixels of movement.
- Loading: twelve skeleton lines sweep continuously at three times the default duration, linear, with delays derived from Reveal stagger. They never resolve into content.
- Lifecycle: visibility and document visibility pause loading and entrance tracks; fine-pointer gating controls Pointer Follow. Reduced motion restores the static illustration. Cleanup disconnects observers, cancels animations, and restores row styles.
- Verification: 28 repository tests passed; full shared build and shared-release inclusion check passed. Browser checks cover entrance properties/easing, pointer response, looping/loading pause, reduced motion, desktop/mobile scaling, repeated instances/cleanup, and JavaScript-disabled fallback. Saved Webflow preview was checked at desktop and mobile widths. Draft only; no publication or site-wide loader change.

## Shared Window Header

Webflow component `ddfe87bb-c2ac-4af5-3576-dab6fd3ab680` is extracted from the existing Secure header and is nested in both 3D Secure Authentication and User Onboarding. It retains `secure_header`, `secure_dots`, and `secure_dot` native styles. Preview equivalents live in `window-header-preview.css` and `window-header-markup.html`.

Sizing uses `--window-unit`, defaulting to the original Secure scale (100cqi / 258). Onboarding supplies 100cqi / 540 and `--window-header-background: #e7e7e7`; Secure keeps its original background and dimensions. Thus both illustrations share the same header CSS while scaling with their respective parents.
