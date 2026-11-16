# Product camera dropdown production release

User authorized production of approved layout-lab version 05, native dropdowns in Real AI Product Camera, required staging validation and merge of approved work. Protected production review remains required.

Webflow site 6823036cd77b3093eaf9154d; /ai page 6af2c4b2616c8b948cbb3006; component ab08d931-9bbf-9677-8c22-3d9bdf181830 (one instance, not a library component). Added four native menus directly inside selector fields. Selected values: USD, Individual, Unsecured, Keep accruing interest. Currency order SAR/USD/EUR/INR/CAD/AED/GBP. Native menu layout has no font-family declaration and inherits body ABC Diatype, weight 500. Scoped embed preserves existing code and adds selected-row state background only. Original product-screen components remain untouched.

Shared product-dropdowns effect reuses the approved lab timing; production binds authored/localizable native text without creating markup. Old pages without all four menus retain their prior clock. Optional camera framing and sparkle state use the existing product-camera renderer. Lab adapter continues to use the same effect.

Preflight: fresh origin/main 61200f6; all 55 pages inspected, Animations Playground remains draft. Only Real AI has a page update newer than the last full-site publication (2026-11-16 14:17 UTC). Configured production domains: www.stitch.co, stitch.co, www.stitch.sa, stitch.sa. Production channel affects all four; no router changes. Staging and production publication must preserve Playground draft status.

Validation: npm run validate:release passed with 249 tests, complete generated distribution, dependency closure and Product Variety/wallet swap/Country Flags checks. Native menu localization and incomplete/duplicate menu fallback tested. Deployment and serving evidence follows.

## Staging and production approval

Merged release `b37114c82dac7db89a2d3204aea7cbcf6de4cf6e`. [Staging workflow 43923849489](https://github.com/gorankomar/stitch-animations/actions/runs/43923849489) succeeded, including checksum/MIME/CORS validation and CloudFront invalidation; actual staging pointer serves this SHA. Native Webflow menus published to staging under task aa3e652e-9803-474c-8d4a-d2a099eca555.

Single-page publication failed with Webflow 400 Invalid parameter: pageId. Automatic review initially rejected full-site publication and cancellation of an older production run. User then explicitly authorized cancelling waiting run 43878868438 and full-site publication to staging and the four production domains after checks/approval. Older request cancelled; production protections preserved.

Browser verification: Designer Preview with custom code enabled uses native menu state and inherits ABCDiatype at weight 500. Live staging animates all menus with flat transforms and highlighted USD row; desktop and 393px mobile checked, no page overflow, 345px square mobile stage and 303.6px prompt. Live motion tokens: cubic-bezier(.11, .61, .27, .99), 770ms. Browser reports an existing unrelated inline null addEventListener error in page custom code; camera runs successfully. Native menu width matches its field and relative anchor. Reduced-motion completion and independent sparkle entrance covered by tests.

[Protected production workflow 43924843318](https://github.com/gorankomar/stitch-animations/actions/runs/43924843318) dispatched: promote, production, exact staging SHA b37114c82dac7db89a2d3204aea7cbcf6de4cf6e. Waiting for the user's production environment review. No production activation/publication claimed yet.
