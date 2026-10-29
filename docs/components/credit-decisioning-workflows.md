# Credit Decisioning Workflows

Saved Webflow draft, 2026-10-29. Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=560-6701 (540 × 278).

- Site `6823036cd77b3093eaf9154d`; Playground page `6ab4079ac7ca32e3a6c168c8`.
- Animations / Credit Decisioning Workflows component `30a9c130-36a3-c28c-ab96-978bc6be2166`; Playground instance `544b4573-6379-70a2-91ea-227952e5c640`.
- Reuses the current Bilateral and syndicated lending stack, Cards Screen `a9f54133-f8f5-3cdd-d349-121dc39f1327`, reveal wrappers, perspective, native window surfaces and fade. Existing lending classes remain shared; the new frame owns its 540:278 ratio.
- Foreground: Platform Screens / Credit Customer Details `eb5f440e-54c5-4097-d228-4d26926e7e8b`, extracted from the user's populated Playground tmp block. Preserves Window Graphic props, variant, ten customer rows and seven loan-detail blocks exactly. The temporary standalone sample was consumed; the populated reusable screen remains available.
- The outer `credit-customer-details` host has width 100%, min-width 0 and aspect ratio 1.2 to size the existing absolutely positioned Window Graphic. No descendant styling or component-definition appearance overrides were added.
- Background block `782513c1-a77f-0c92-d8c5-2c449b3def8c` uses only `features-graphic_grid-bg`, filling the complete stage. No extra grid class or copied grid CSS.
- Style embed `30a9c130-36a3-c28c-ab96-978bc6be216f` supplies inline-size containment, existing parent-relative perspective and hover/reduced-motion rules. Hover reuses the current lending transform (34deg X, 0deg Y, -7deg Z, skew 14deg/-7deg), with 3% lift. Credit workflow transitions resolve Global Styles `--motion-duration-default` (770ms) and `--motion-ease-primary` (cubic-bezier(.11,.61,.27,.99)). Shared lending styles and established screen internals remain unchanged.

Designer checks: desktop frame 551.6 × 284px; 393px mobile viewport frame 345 × 178px. Grid has only the shared class and spans the frame. All native content remains visible without a compiled motion runtime. Reduced-motion CSS disables transition; OS preference switching was not exercised. No build, CDN activation or publication was needed or authorized. Playground remains a draft.

Custom-code-enabled Preview: frame 630 × 324px. Foreground hover translated Y by -19.6973px and returned to zero when the pointer left; transition resolved to 0.77s and the live primary curve. The original Window Graphic zoom lens remains enabled through its supplied prop. Resting Preview evidence: `/private/tmp/credit-decisioning-workflows-preview.png`.
