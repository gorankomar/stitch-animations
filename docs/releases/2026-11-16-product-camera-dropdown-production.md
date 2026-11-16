# Product camera dropdown production release

User authorized production of approved layout-lab version 05, native dropdowns in Real AI Product Camera, required staging validation and merge of approved work. Protected production review remains required.

Webflow site 6823036cd77b3093eaf9154d; /ai page 6af2c4b2616c8b948cbb3006; component ab08d931-9bbf-9677-8c22-3d9bdf181830 (one instance, not a library component). Added four native menus directly inside selector fields. Selected values: USD, Individual, Unsecured, Keep accruing interest. Currency order SAR/USD/EUR/INR/CAD/AED/GBP. Native menu layout has no font-family declaration and inherits body ABC Diatype, weight 500. Scoped embed preserves existing code and adds selected-row state background only. Original product-screen components remain untouched.

Shared product-dropdowns effect reuses the approved lab timing; production binds authored/localizable native text without creating markup. Old pages without all four menus retain their prior clock. Optional camera framing and sparkle state use the existing product-camera renderer. Lab adapter continues to use the same effect.

Preflight: fresh origin/main 61200f6; all 55 pages inspected, Animations Playground remains draft. Only Real AI has a page update newer than the last full-site publication (2026-11-16 14:17 UTC). Configured production domains: www.stitch.co, stitch.co, www.stitch.sa, stitch.sa. Production channel affects all four; no router changes. Staging and production publication must preserve Playground draft status.

Validation: npm run validate:release passed with 249 tests, complete generated distribution, dependency closure and Product Variety/wallet swap/Country Flags checks. Native menu localization and incomplete/duplicate menu fallback tested. Deployment and serving evidence follows.
