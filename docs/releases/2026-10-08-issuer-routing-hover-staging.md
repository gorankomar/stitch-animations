# Issuer routing hover staging — 2026-10-08

User authorized route-aware hover and staging publication. PR #43 merged the implementation: https://github.com/gorankomar/stitch-animations/pull/43

Verified release `62567443d5fad555801847d837b650566bdf6d2a`; previous staging `97b45af1272fa3700ded882902ecabad83bdd140`. Production unchanged at `418f5b3456270c678384990e6db49ffb70c8e175`.

Deployment https://github.com/gorankomar/stitch-animations/actions/runs/37796612991 succeeded, including full validation (109 tests), complete CDN release verification and staging activation/cache invalidation. Served staging pointer independently checked.

Webflow Preview checked EU hover: KSA/Visa/Mada dimmed. Mada hover: Visa/EU/Apple Pay/Stripe dimmed. Local checks also covered KSA and Cards hover and independent simultaneous instances. Outer wrappers and temporary SVG connector groups own opacity/grayscale, leaving internal logos and reveal/pulse opacity intact. One shared staging loader, 252 pulse paths, live fast duration `calc(770ms * 0.6)` and primary curve `cubic-bezier(.11, .61, .27, .99)` verified. Desktop and mobile geometry preserved (mobile345 ×177.609375). Tests cover touch exclusion, reduced motion, listener cleanup and SVG DOM-order restoration.

No Webflow publication needed: component is only on Animations Playground, whose draft flag remains true. No loader edits or production activation. Local screenshot evidence: `/tmp/issuer-routing-hover-staging.png` (EU focus).

The evidence-only follow-up contains identical animation bytes; its main workflow may assign a subsequent staging SHA.
