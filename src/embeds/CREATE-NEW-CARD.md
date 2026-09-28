# Create New Card

Native Webflow component **Animations → Create New Card**
(`96fa29c3-d0f6-8e78-efbe-0467a1661836`) is at the bottom of the draft
Animations Playground (`6ab4079ac7ca32e3a6c168c8`).

Figma source: PCbd0DyXWAD2cDANtl7bpH, node 291:1366 (258 × 232).
Card, title, syntax spans and all 33 rows are native editable elements. Eleven
original SVG layers are stored in the Webflow asset library. The animation
traces the five original line paths, with soft tails and independent timings.
Credential-like Figma sample values were replaced with DEMO_LOGIN and
DEMO_KEY_NOT_VALID; all added response code is illustrative.

The component loader, Financial Architecture loader, Change Due Date loader,
and playground page-all-lite resolver use release
`e5530661d10576dd939f9953b70c4544a6f68204`. All three code graphics import
the same effect-code-scroll module; matching URLs prevent duplicate loading.
The later source-only commit replaces sample credential values in local markup.

Build: `npm run build:all`. Local preview: `/create-card.html`.
Portable CSS: `dist/embeds/create-card-styles.html`; add the commit-pinned
feature-create-card.js module loader when installing the native component.

Verified: Webflow Preview at desktop and 393px mobile, code progression and
looping, five staggered pulses, original asset positions; local asset loading and
66 rows including loop copies. Existing 10 tests and the complete build pass.
Webflow remains a draft; no site publication was performed.
