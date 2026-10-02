# Buy Now Pay Later — five-line correction

Prepared from current origin/main 7b7cde3d6d87ccfe7bceefa0e88d3998104fe61e in an isolated release checkout.

Corrected the SVG gradient tag case in the existing Webflow component definition; original path geometry and five routes retained. Extracted Create New Card's soft gradient pulse into shared Soft Path Pulse and applied it to the five BNPL routes. Removed descendant illustration overrides of reused components; complete Label scales through its outer wrapper. Native Phone Shell retains its own status bar appearance.

Live Global Styles verified: movement curve cubic-bezier(.11,.61,.27,.99), default duration 770ms, stagger 200ms, opacity ratio .34. Pulse travel is a continuous linear loop.

Validation: 47 tests pass, all shared entries and embeds built, Product Variety/wallet swap and Country Flags dependency closure passes. Designer shows three left routes and two right routes, including static gradients before animation initialization. Webflow component IDs and durable details are in BUY-NOW-PAY-LATER.md.

Middle loader synchronization and Preview verification recorded after merge. No publication is authorized at this stage.
