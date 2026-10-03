# 3DS-enabled security — middle saved

- Date: 2026-10-03, Europe/Zagreb.
- User request: push and merge all approved chat work and complete Webflow middle delivery. No domains published; publication and live-site verification remain with the user.
- Release PR: https://github.com/gorankomar/stitch-animations/pull/29 (merged, both GitHub checks passed).
- Full merged release SHA: `8a6457b36b338d35f961877de66879c6c3edc795`.
- Changes: Figma-based 3DS-enabled security with body-font text and badge heartbeat; canonical Expanding Rings viewport-size mode applied to both 3DS and Omnichannel Origination, retaining constant 1 CSS px outlines. Includes assets, source, documentation, verification scripts and generated distribution.

## Saved loaders

Previous site-wide Footer code and Playground page-settings preview URL:
`https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@3b41c7e38ac2913a2f13c5ea9fb4e3a4ef662965/dist/page-all-lite.js`

New URL in both saved locations:
`https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@8a6457b36b338d35f961877de66879c6c3edc795/dist/page-all-lite.js`

Only the existing SHA was replaced. Complete saved Footer code was read back after reload and matched the intended replacement exactly; the saved Playground footer was reopened and read back with exact equality. Unrelated custom code and the page's duplicate-loader guard were preserved. jsDelivr remains active.

Cleared redundant portable script-only embeds in 3DS component a233a329-7131-566c-a11a-2481d8435a80 (95fa7ca9-2a5f-3a49-e207-33c3f2b1c5a9) and Omnichannel component fc1ac059-511b-233e-7141-92eee67bd409 (0a0d4d08-b0c3-eba5-dfb1-642a0cfc280f). Both code settings were read back as empty. Styles and native artwork were preserved.

## Verification

- Based on fetched current main 5bce839d890df14db7993d7a5418de61daa0e30b in an isolated checkout, preserving unrelated working-tree edits.
- npm run validate:release passed: 76 tests, builds, embeds and shared dependency checks; Product Variety/wallet swap and Country Flags retained. Existing Consumer Verification distribution embeds preserved.
- Both component browser suites passed: responsive sizing, lifecycle, reduced motion, static fallback and full cycle. External SVG stroke coverage remained 1px at 4× sizes.
- All 83 committed JS/CSS files under dist were fetched from the full merged SHA and matched local bytes, zero failures.
- Webflow custom-code Preview contained one external shared page-all-lite loader at the chosen SHA, with the preserved inline duplicate-loader guard. Both components' ring dimensions changed over time with their portable scripts empty. Badge heartbeat dimensions changed; text remained centered.
- Desktop Preview visually inspected; mobile 393px Preview rendered the new stage at 345 × 177.609375px and ring widths changed over time. Desktop restored afterward.
- Proof screenshots: /tmp/3ds-middle-webflow.jpg and /tmp/3ds-middle-mobile.jpg (session artifacts).

Outcome: **middle saved — ready for user publication**. No staging or production publication was performed; served-domain SHA and interaction verification are pending publication.
