# Solution tab reveal staging — 2026-11-12

- Change: Prebuilt agents and Agent harness reveal targets start together, with no stagger and `travelFraction: 0.5`, matching Copilot. Existing internal animation schedules are preserved.
- Merged PR: https://github.com/gorankomar/stitch-animations/pull/80
- Active staging release: `f98d205c1dd661b448ea4fed24a54261760aca81`.
- Previous staging release: `913d869ac1cbe8e421cd1e83dadeac41e373753f`.
- Full `npm run validate:release` passed: 228 tests, complete shared build, dependency closure, Product Variety/wallet swap and Country Flags checks.
- Deployment workflow completed successfully: https://github.com/gorankomar/stitch-animations/actions/runs/43188074706 (includes release byte/CORS verification and staging activation/invalidation).
- Actual CloudFront staging channel body imports the expected release. HTTP 200, JavaScript MIME, wildcard CORS, and `no-cache,max-age=0,must-revalidate` verified. Both changed animation chunks match the locally validated files by SHA-256.
- Preview and browser interaction testing explicitly skipped at the user's request. No claim of visual verification.
- Animation-only release: no Webflow draft edits or publication required/performed. Playground remains untouched. Production was not promoted.
