# Reveal stagger middle delivery — 2026-10-03

- Requested stage: GitHub push/merge and Webflow middle. No domains published; user publication and live-site verification remain pending.
- Release: `3b41c7e38ac2913a2f13c5ea9fb4e3a4ef662965`, merged through PR #27. Built from current origin/main `a2631faf616d86add1fcf053a9406f99a7200d10`.
- Fix: numeric Reveal controller stagger values remain milliseconds. User Onboarding and Credit Check previously interpreted their numeric 200ms stagger as 200 seconds.
- Validation: full `npm run validate:release`, 76 passing tests, shared dependency closure plus Product Variety/wallet swap and Country Flags preserved. Local complete entrances verified, including two Credit Check instances at 540px and 270px.
- Previous footer and Playground loader: `https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@f7294418cbd133dc74614d43bdd0e920ab1a2349/dist/page-all-lite.js`.
- New footer and Playground loader: `https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@3b41c7e38ac2913a2f13c5ea9fb4e3a4ef662965/dist/page-all-lite.js`.
- Saved Site Settings footer through the UI; reloaded and copied the complete saved editor back to confirm exact equality with the original code except the release SHA. All unrelated footer code preserved.
- Saved Playground page-settings body loader through Save draft; reopened settings and read the new SHA back. Preserved the duplicate-loader guard and other page code.
- CDN entry, both affected feature entries and shared Reveal chunk matched the built bytes before saving the loaders.
- Webflow Preview with custom code enabled loads the new page-all-lite URL. Both component roots contain zero inline scripts; shared loader owns their initialization.
- Desktop fresh Preview entry: all nine onboarding rows and all three Credit Check layers received is-reveal and reached opacity 1, with readiness active. No scroll-out fallback workaround required.
- Mobile fresh Preview entry at 393px viewport / 345px component width: every reveal target in both components received is-reveal and reached opacity 1. Visual proof captured for desktop Credit Check and both mobile components.
- Product Variety and Country Flags visible and running in desktop Preview.
- Outcome: middle saved — ready for user publication. Existing staging/production served releases were not changed or verified in this task.
