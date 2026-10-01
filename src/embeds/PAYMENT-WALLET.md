# Payment — Stitch Wallet

Figma: PCbd0DyXWAD2cDANtl7bpH, node 338:1441.
Webflow component: Animations → Payment — Stitch Wallet
(479b0586-4a13-c490-cc53-a67ce7652a50).
Placed in the final row of the Animations Playground.

Native editable Webflow text, rows, image assets and the Logos → Stitch component
form the graphic. All typography inherits the body font; the logo wrapper's font
size determines the logo's height. The responsive stage uses a 540:402 ratio.

The rear card and wallet rise into view first. Content follows bottom to top:
payment amount, badge, six paired rows, then the complete gray details panel.
The wallet reveals its header, balance, transaction label and action row.
Both amounts use the existing value-counter helper and read targets from their
editable text at initialization. No separate hardcoded target needs updating.
Pointer movement anywhere in the graphic gently moves only the wallet, using
the existing follow-group helper. Reduced motion keeps the final static view.

Build the portable hidden runtime:

```sh
node scripts/build-payment-wallet-embed.mjs
```

The component carries dist/embeds/payment-wallet.html in its pw-runtime HtmlEmbed.
The module bundles reveal-groups, value-counter, follow-group and threshold.
data-reveal-delay attributes use explicit millisecond units.
Exact Figma assets are saved in assets/payment-wallet and uploaded as managed
Webflow SVG assets. The new Stitch logo replaces the reference's older logo.
No site publish was performed.
