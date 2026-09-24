# Real-Time Balance Management

Webflow component: **Animations → Balance — Real-Time Management**.
Draft playground placement: beside Access, above the report graphics.

## Reuse

Two instances of **Cards → Balance Account** share the same native structure.
Each exposes Account Name, Balance, Credit and Debit (numeric strings with two
decimal places), an Icon slot, and Outgoing / Incoming ledger variants.
The amounts are illustrative values copied from Figma, not a computed balance sheet.
The new **Icon - User Filled** is the exact filled silhouette from Figma, optimized
with SVGO v4, multipass, precision 3 and transform precision 8. It uses currentColor.
Filled silhouettes have no outline stroke. **Balance Connector** exposes the pulse
Stroke Width property, default 1.6, and reuses the optimized Figma arrow geometry.

The stage scales from its container with cqi, percentages and a 258:232 aspect ratio.
The currency, grid lines, motion and hover effects are scoped to this component.
The static arrows and all card content are native editable Webflow elements.

## Motion

- On first entry (25% visible), cards reveal with a short stagger.
- The project's existing value-counter helper animates all six nonzero amounts
  from zero to their editable target values, with two decimal places.
- Soft blue pulses alternate along the two SVG connectors.
- Cards drift subtly and lift on pointer hover.
- Idle animations pause offscreen; reduced motion shows final values immediately.
- The bundled embed travels with the component and initializes once per instance,
  whether executed before or after DOMContentLoaded.

Build the portable HTML Embed with:

```sh
node scripts/build-balance-embed.mjs
```

Copy `dist/embeds/balance-graphic.html` into the component's hidden HTML Embed.
Layout and typography remain native Webflow styles. Original reference: Figma
Stitch Website Live, illustration 20001783:47131, full card 20001767:50495.

Verified in Webflow Preview at desktop and 393px mobile: exact final amounts,
correct ledger variant rows, no page or ledger overflow, hover lift, running pulse
animations, and a fresh entrance showing zero, intermediate, then final amounts.
Saved as draft; no site publish was performed.
