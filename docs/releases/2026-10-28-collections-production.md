# Collections — production release verified

User explicitly requested “push to production” and then “continue” on 2026-10-28.

## Production workflow

Dispatched [workflow run 40737788660](https://github.com/gorankomar/stitch-animations/actions/runs/40737788660) from `main`, with operation `promote`, channel `production`, exact staging-verified release `a2bb18cfa2215922e1c35091a59f2ab201a89fd9`. Workflow revision is documentation-only successor `75e25b7a3579a62b3fe03571d6a6961a386f7763`; no rebuild/upload was requested.

The user completed the protected Production environment review. Activate job `122990917663` completed successfully. The agent did not approve its own deployment or alter protections.

Both staging and production now serve `a2bb18cfa2215922e1c35091a59f2ab201a89fd9`. Previous production release `85540b314d5e83b9c19f8499601a706c1a48f009` remains retained. The workflow verified 225 files for all four production origins, then activated production and completed CloudFront invalidation. Activation completed at 20:40:35 UTC (21:40:35 Europe/Zagreb), 2026-10-28. The production pointer was independently fetched: HTTP 200, JavaScript MIME, CORS `*` for the production Origin and `cache-control: no-cache,max-age=0,must-revalidate`. Served Collections module bytes match the validated local distribution.

## Completed Webflow publication

Published the staging-tested Webflow site changes to the four configured production domain IDs, with `publishToWebflowSubdomain:false`:

- `www.stitch.co` — `69720b15a4f4a7da0ebe1e02`
- `stitch.co` — `69720b14a4f4a7da0ebe1dfc`
- `www.stitch.sa` — `6836fa3ba3cf07fdda576a7e`
- `stitch.sa` — `6836fa3ba3cf07fdda576a6d`

Publish task `97bf99bf-0863-4f79-8305-0a7c9938b472`, scope `site`. The same staging-tested native markup is now served on the production Loans pages. Fetched `https://www.stitch.co/loan-management-software` and `https://www.stitch.sa/loan-management-software`: each has two native Collections windows, one permanent router and no inline Collections runtime.

Browser inspected `.co` Loans: no raster images, both native windows visible at opacity 1, no inline transforms, correct production channel URL. This is the complete static fallback while the older production animation channel remains active. No router URLs were changed.

Animations Playground and Platform Screens were confirmed `draft:true` before and after the production site publication and remain excluded.

## Live interaction verification after approval

Fresh production Loans page runs Collections through one permanent production loader. It contains zero raster images and zero inline scripts. Window transforms advance through reveal, hold and swap, with both Attach and Reassign taking the front slot. Mobile viewport 390px renders a 292 × 262.5703125 graphic, preserving 258:232. No Collections console errors were observed; the temporary viewport override was reset.

`https://www.stitch.sa/loan-management-software` redirects to canonical `https://www.stitch.co/loan-management-software`; the canonical production rendering and runtime were verified. The complete shared bundle, including Product Variety/wallet swap and Country Flags, is the exact staging-verified release, with dependency/file checks repeated for all four production origins by the promotion job.

Playground and Platform Screens remain `draft:true` after deployment. No loader URLs, protection rules, or retained releases were changed or removed.

State: **production release verified**, including Webflow publication and protected animation promotion.

Evidence: [desktop](2026-10-28-collections-production/desktop.png), [mobile](2026-10-28-collections-production/mobile.png). Do not label the combined production release complete until the workflow succeeds, production serves the promoted SHA, and live motion is verified.
