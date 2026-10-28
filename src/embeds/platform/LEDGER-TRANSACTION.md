# Ledger transaction detail

Saved Webflow draft, 2026-10-21. Webflow is canonical.

- Figma: `PCbd0DyXWAD2cDANtl7bpH`, node `533:45416`, 1440 × 817.
- Platform Screens page: `6ad6808c9ce17b3ab0a69ea8`; eighth gallery card `6e1a6eb7-a3ad-d334-c902-5fc7cbd37f59`; Screen instance `e0de03cd-bb53-3604-07ab-8914f04d3202`; Platform Ledger Transaction Content `6ac48d9c-eb70-6833-74ce-f2d71957bde5`.
- Reuses Platform Screen / Cards, the shared Sidebar with 17 navigation items (Ledgers Active, Sandbox / SDB), Platform Label (Blue Standard Posted, Red Compact Closed), Platform Button (Compact / No Icon), Slash and Plus. Existing component definitions and appearances are preserved. New content includes the breadcrumb, USD 8,500.00 transaction heading, timestamps, all four entry rows, both versions, and Metadata.
- Seven new native styles: `platform-ledger-dates`, `platform-ledger-date`, `platform-ledger-entries`, `platform-ledger-entry-heading` (shared header-cell combo), `platform-ledger-entry-cell` (shared table-cell combo), `platform-ledger-amount`, and `platform-ledger-info`. Other layout, typography, radii, table borders and controls reuse existing Platform classes. No style embeds, scripts, animation source, or raster assets.
- Content has three direct children: breadcrumb, header and two-column body. Each table row has its own semantic row boundary and three direct cells. Date fields own their column spacing; icon wrappers own independent dimensions. Label instances are direct children of layout groups. Construction placeholders and temporary standalone instances were removed.
- New Icons component **Icon - Info Circle**, `20856cfb-fc31-c151-a58d-a4619af42569`, uses the exact source path/viewBox and bound Width, Height, Color and Stroke Width at the SVG root. Untouched original: `assets/originals/ledger-info-circle.svg` (645 bytes). Retained source precision for this tiny vector; no SVGO derivative or geometry rounding. Export-only clipping rectangle/group removed in native adaptation; both rendered instances verified. No temporary Figma URL is used at runtime.
- Static visual artwork, consistent with the other gallery screens; Update category and metadata controls have no application backend behavior.

## Verification

- Desktop Designer visually checked against Figma. Native compiled Preview with custom code enabled: frame **1232 × 698.984375px**, preserving 1440:817. Normalized title y **63.9935**, body y **141.9856**, Entries table y **253.9742**, table width **792.0018**; source values 64/142/254/792. Header height **35.9963**, all four body row heights **39.9959**, matching source 36/40.
- Mobile Preview at 393px canvas: frame **297 × 168.5px**, table normalized y **253.9015**, width **792.0455**. Five table rows / twelve body cells, all 17 sidebar navigation items, all three shared labels and five content SVGs present; no horizontal descendant overflow.
- Evidence: `verification-ledger-transaction-preview.png` and `verification-ledger-transaction-mobile.png`. Desktop Designer restored; existing custom-code toggle preserved.
- Page metadata readback: `draft:true`. No publication, GitHub merge, staging activation or production release. No runtime source changed, so npm tests/builds do not apply.
