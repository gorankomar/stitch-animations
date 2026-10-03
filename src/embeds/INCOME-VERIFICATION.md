# Income Verification

- Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=379-1776; node `379:1776`, 540 × 278.
- Stitch Website `6823036cd77b3093eaf9154d`, Animations Playground `6ab4079ac7ca32e3a6c168c8`.
- Animations / Income Verification component `893f2648-2166-0964-bc2c-e130bb04f25d`; Playground instance `93a9c786-ca42-1151-dbf7-b45f6357ad18`.
- Illustrations / Verification Document Item `f8ac54c8-68aa-e980-2e6b-39548cc33ed9`. Label text prop `b1bd5458-c923-251b-8d8c-057fd806610a`; Count text prop `fdbf2b67-8fbd-3fab-68e9-6659dae018d1`; replaceable Icon slot element `e67fdb97-f169-6403-8efe-97043ff9cb0a` (slot prop `53d86208-453f-b817-a2a4-89f367fee390`).
- The illustration's Documents slot `f3884d46-95c5-0c42-ff22-2895f0854a3f` contains seven editable item instances in the Playground. Add/remove/reorder item components in this slot; the box height follows the list. Very long lists require a deliberately chosen frame size or scrolling strategy. The reusable illustration definition has an empty Documents slot; the supplied seven-item content is instance-owned. Duplicate the populated Playground instance to retain the sample content.
- Icon slots reuse existing Fingerprint, Bar Chart, File, Safe, Clock, Luggage and Star components; their internal appearance and supported properties remain unchanged. Illustration CSS does not override their descendants.
- Original text and seven counts are preserved, including “Pay roll documents” and “Hed of marketing”. Added row two fields: Pay frequency / Monthly, Employment / Full-time. Added row three fields: Bonus / $2,400, Tenure / 4 years, Net pay / $18,250. These are illustrative sample values.

## Static appearance and sizing

Native Webflow markup/styles own supported layout, typography, colors, gradients, borders and shadow. Text inherits the site's Body font. `income-verification-native.css` is a local preview mirror only; the deployed motion never imports it. Width is 100% of its parent; the inner frame retains 540/278. Geometry and text scale together in cqi. Layout, Pointer Follow and reveal have separate wrappers.

The separate style-only HtmlEmbed `893f2648-2166-0964-bc2c-e130bb04f318` carries container-type/writing-mode and sizing of direct original SVG artwork. The script-only HtmlEmbed `dd528580-5ebc-a73c-942d-41dcc3d14d37` sits in native display:none wrapper `7e2aeead-df83-9669-b14e-8c7de5f9c46b`, avoiding a Designer placeholder while preserving execution. No permanent entrance hiding or transforms are saved. Static artwork remains visible if motion fails or JS is disabled.

Original Figma SVG exports are preserved in `assets/income-verification/originals`. Optimized local derivatives use SVGO 4.1.0, multipass, precision 2 and transform precision 8 with the explicit configuration in optimization.json. Root export dimensions are restored during integration; artwork scales through proportional wrappers. Original/optimized vectors were compared side by side at design size with no visible loss. Existing canonical Webflow icons and original native SVG geometry remain the deployed sources; no temporary asset URLs are referenced. No raster artwork is present.

## Motion and shared effects

- Root `[data-income-verification]`, tracks `[data-iv-track]`, sequences `[data-iv-sequence]`, rings `[data-iv-ring]`, foreground entrance `[data-iv-reveal]`.
- Seamless Marquee is extracted from Omnichannel Origination and now used by both. Directions left/right/left (each successive row reverses direction); lap duration is Global Styles default ×36/44/40. A lap includes the native inter-sequence gap. Enough hidden duplicate sequences cover both frame edges throughout the lap. Linear movement preserves the requested Omnichannel loop behavior.
- Expanding Rings is extracted from Omnichannel Origination and now used by both. Original fallback diameters 632/486/346; animated birth diameter 346 and expansion range 440 maintain the equivalent design scale. Period default ×24, phase starts .6967/.3633/.03, monotonic radial mapping and linear fading. At least two rings remain visible; rings never overtake each other. Linear cyclic interpolation follows the requested existing behavior.
- Whole foreground box reveals from below the frame to its centered native position at full opacity using the inherited `--motion-ease-primary` and `--motion-duration-default`. No replay after completion.
- Pointer Follow uses the cataloged follow-group helper at strength .05, with the entire illustration as its pointer area and only the foreground box as follower.
- Missing/invalid tokens leave the composition static. Per-instance duplicate guard and `Symbol.for('stitch.income-verification.init')` handle repeated portable/shared loads. Visibility, hidden-tab pause, parent resize, reduced-motion restoration, failure rollback, generated-copy removal and follow cleanup are owned by the module.
- Both shared entries register the module; Vite includes feature-income-verification. The shared page loader owns initialization at middle; the redundant in-component runtime is removed after the merged release is verified.

## Build and verification

- Build: `node scripts/build-income-verification.mjs`; optimizer: `SVGO_MODULE=<svgo module> node scripts/optimize-income-verification-assets.mjs`.
- Local preview: `/income-verification.html` through `npm run dev`.
- Browser suite: `PLAYWRIGHT_MODULE=<module> BROWSER_EXECUTABLE=<optional browser> INCOME_PREVIEW_URL=<optional URL> node scripts/verify-income-verification-browser.mjs`.
- Passed: row directions and both-edge coverage at sampled lap boundaries; ring separation over a full cycle and minimum two visible rings; Pointer Follow; duplicate mounting, disposal and remount; reduced motion; proportional mobile size 313 × 161.125 and text 6.95555px; JS-disabled fallback with seven items and eleven SVGs; forced setup-failure rollback; no browser errors.
- Original Omnichannel browser suite also passed after shared-effect extraction. Repository tests: 47 passed. Shared Vite build compiled to a temporary output directory to preserve other chats' distribution work; shared-release check retained Product Variety/wallet swap and Country Flags and verified local module/CSS dependencies.
- Webflow Designer static and enabled-code Preview visually checked at desktop and 393px mobile. Native component identities, Label/Count values, Documents/Icon slots and saved script/styles were read back.

Completion: **saved to Webflow (draft)** on 2026-10-03. No site-wide/page-settings loader changes, GitHub push/merge, or publication occurred.
