# Production release verified

User authorized production on 2026-10-13 (Europe/Zagreb). Fetched origin; working tree was clean. Current main `3f9ee0ba85392a382dfb9035ba437d5289fdfea0` adds staging evidence only.

Live staging pointer verified as `e07e43bec7691727813d76d6140a3a1a5724f8a0`, matching the October 12 staging verification record. Live production pointer before dispatch: `418f5b3456270c678384990e6db49ffb70c8e175`.

Dispatched `publish-s3.yml` on main, operation `promote`, channel `production`, release `e07e43bec7691727813d76d6140a3a1a5724f8a0`. User completed the protected review. [Run 38365757941](https://github.com/gorankomar/stitch-animations/actions/runs/38365757941), activation job `115190375707`, succeeded. Logs verify 215 release files for all four production origins; production activation, invalidation completion and served-loader verification completed at 09:57:21 Europe/Zagreb. No rebuild was performed.

Scope: shared animations on stitch.co, www.stitch.co, stitch.sa and www.stitch.sa. No Webflow page changes requested or publication performed. Playground metadata re-read: `draft: true`.

Independent CDN read confirms HTTP 200, JavaScript MIME, no-cache/max-age=0/must-revalidate, and the exact new production SHA. Browser checks on the homepage, card-issuing-platform and deposits show one production shared loader. On deposits, Country Flags track transforms changed between samples; Product Variety hover moved blue/gray cards and placed blue at z-index 2, with final translations ±17.448px. www.stitch.sa/deposits redirects to www.stitch.co/deposits. Mobile width 393px: both reusable components render at 295px, no horizontal page overflow, production loader retained. Desktop viewport restored.

No shared-animation loading/CORS errors observed. Existing page inline code reports a null addEventListener error on the three inspected pages; its source is page HTML rather than the release modules. Reduced-motion behavior relies on the unchanged staging-validated runtime and existing tests; no fresh OS preference test performed.

Evidence screenshot: `/private/tmp/stitch-production-live.jpg`. Outcome: production animation release verified; Webflow publication unnecessary and not performed; Playground remains unpublished. Previous immutable production release is retained for authorized rollback.
