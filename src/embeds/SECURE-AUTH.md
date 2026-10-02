# 3D Secure Authentication

The native three-dot header is now the shared Window Header component, also used by User Onboarding. Its existing `secure_header`, `secure_dots`, and `secure_dot` CSS is retained with parameterized sizing/background and original Secure defaults. See [User Onboarding notes](USER-ONBOARDING.md#shared-window-header).

Figma: file PCbd0DyXWAD2cDANtl7bpH, graphic 294:1507, toggle reference 294:1555.

Native Webflow layout in Animations Playground. Uses the existing Icons / Icon - Bank component and Controls / Toggle (Inactive and Active variants). The toggle is a visual component, not a functional form input. The graphic is exposed as one accessible illustration.

Load dist/page-all-lite.js once on the page. It discovers data-secure-auth and imports feature-secure-auth.js. The module reuses animation-stage.js for visibility and reduced-motion handling and follow-group.js for the notification bubble. No animation dependency is added. The window stays fixed at its top-left anchor and only changes its height.

14.6-second loop: cursor emerges at right, enables the switch, waits for panel expansion, chooses Advanced, holds, disables the switch, and disappears behind the window. The cursor is an authored rounded, white-outlined black pointer in the Figma style; the source frame has no cursor asset. Reduced motion displays the expanded selected state without a cursor or mouse-follow motion.

Source markup and CSS use a 258 × 232 proportional stage. `secure-auth.html` is the local visual preview; rebuild with `node scripts/build-secure-auth-embed.mjs`. Use Webflow's Bank component instead of the preview-only SVG image. Dynamic styles are in `dist/embeds/secure-auth-styles.html`.

The toggle's `data-stitch-toggle` hook and `data-state="active"` / `inactive` values drive the animation independently of Webflow's generated class suffixes. Outside the animation, choose its native Active or Inactive variant. Native defaults are 19 × 10 px; the illustration scales its instance to 15 × 8 design pixels.
