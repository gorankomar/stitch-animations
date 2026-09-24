# Ledger Sheet

Figma: `PCbd0DyXWAD2cDANtl7bpH`, node `256:12638`.

Webflow draft: Animations Playground, site `6823036cd77b3093eaf9154d`, page `6ab4079ac7ca32e3a6c168c8`.

Use **Report Graphic**, variant **Audit sheet**, Title **General Ledger**. Leave Filters and Action slots empty. Put **Ledger Sheet** into Content. Turn off Action Visibility and Bottom Fade Visibility.

Ledger Sheet contains eight **Ledger Sheet Row** instances. Each exposes Ledger Account, Available Balance, and Normal Balance text properties. Each Status slot contains the existing **Label** component with editable text and Green/Orange variants. Six rows are visible in the 540 × 402 composition, with two additional rows below the clipped edge.

The existing Report Graphic reveal controller handles heading, header cells, and rows. Header cells stagger by 70ms; rows stagger by 180ms. Scoped CSS adds 50ms offsets between cells within a row. Motion runs once when the graphic enters view and respects reduced motion. There is no cycle or floating animation.

Native layout styles are backed up in `ledger-sheet-native.css`; scoped embed styles in `ledger-sheet.css`. The original Figma grid SVG is in `assets/ledger-sheet/grid.svg`.

Component IDs:
- Ledger Sheet: `ba6ebce5-d664-5c55-9fbd-c6a87e3b3e70`
- Ledger Sheet Row: `b77c465a-315d-ea3c-7172-92a6b2c21bc2`
- Report Graphic Audit sheet variant: `c7a67b19-06d0-a352-2082-680ec009c1ad`
- Playground Report Graphic instance: `32f164f2-2ead-05cb-c618-bb9be3839be5`

Changes are saved as a draft and are not published.
