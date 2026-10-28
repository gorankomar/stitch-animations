# Loan account details and shared buttons

Completed draft verification record, 2026-10-21. Webflow is canonical; construction payloads are historical evidence.

- Figma: file PCbd0DyXWAD2cDANtl7bpH, node 533:37065, 1440 × 817.
- Platform Screens page: 6ad6808c9ce17b3ab0a69ea8. New screen instance: 1c994386-710b-affb-6468-91d8eebf0cbb; gallery card: b2c5f724-8b5e-583b-d06d-d5bcafec352b.
- Platform Loan Account Content: 8c860930-e6de-8d4a-5391-a0e34da11a99. Includes visible summary, detailed balances, Transactions heading, Blocks and Customers. Wholly clipped content is omitted. Static artwork; buttons do not execute transactions.
- Uses Platform Screen / Cards height variant, the latest shared Sidebar including Stitch AI, Loans Active, Sandbox / SDB, Platform Label, Saudi Arabia Flag, Slash, Plus, Dots and Chevron Down. Existing component artwork is preserved.
- Platform Button: 19280183-d16b-a215-89e4-97edcc3d0d7a. Shared platform-cards-button class, editable Label and Icon slot. Six variants combine Compact / Default sizes with Icon Left / Icon Right / No Icon. Compact is 32 source pixels high; Default is 40. Default icon slot is 20 pixels, compact right icon is 16. All dimensions scale with the screen query container.
- Shared button used for loan Actions, View schedule and New transaction; Cards Request card / View all; Cases Update case; Dashboard Select dates / Filters; Loans Edit columns. The old Platform Table Action definition remains available for compatibility.
- Cards section headings use native DivBlock layout containers with independent text and button children. Arabic, Vietnamese and Indonesian button overrides and section-title translations are preserved on the replacement nodes.
- New Icon - Calendar Outline and Icon - Filter Lines reuse the exact Dashboard vectors. The existing Icon - Calendar includes a date numeral and is a different shape. New icons expose Width, Height, Color and Stroke Width. No raster assets or motion code changed.
- Root content has three direct children: breadcrumb, heading and body grid. Inline label/button pass-through wrappers are removed during verification. Currency and icon wrappers retain required independent geometry.
- Saved as a Webflow draft; no publication or animation release.

## Verification

- Desktop Designer: screen 1105.8125 × 627.390625px, preserving 1440:817. Normalized title y=63.99 and body y=141.99 match source 64/142. Detailed balances y=457.96 after summary spacing correction; source 458.
- Native compiled Preview with custom code enabled: desktop screen 1232 × 698.984375px; mobile screen 297 × 168.5px. Mobile normalized body y=141.93, balances y=457.77 and Customers y=525.91, matching source 142/458/526. No horizontal screen overflow; 28 visible SVGs, with only the two deliberately hidden sidebar heading chevrons having zero geometry.
- All nine shared button uses render: Select dates, Filters, Edit columns, Request card, View all, Update case, Actions, View schedule and New transaction. Right-icon variants render row-reverse; no-icon variants hide the slot. Dashboard uses Default / Icon Left; remaining uses are Compact.
- Final native hierarchy: three direct content children, eleven shared labels, three shared buttons, zero label/button pass-through wrappers. Cards section headings each have exactly two direct children: independent text and shared button. Removed all temporary construction placeholders.
- Localized Cards heading/button translations were read back from the Vietnamese component content; Arabic and Indonesian updates returned no errors. New loan details remain in the primary language until explicitly translated.
- Evidence: verification-loan-account-preview.png and verification-loan-account-mobile.png. Desktop Designer restored. Page metadata readback confirms draft:true. No JavaScript or motion changed, so npm runtime tests/builds are not applicable.
