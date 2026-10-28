# Collections — production publication; animation review pending

User explicitly requested “push to production” and then “continue” on 2026-10-28.

## Production workflow

Dispatched [workflow run 40737788660](https://github.com/gorankomar/stitch-animations/actions/runs/40737788660) from `main`, with operation `promote`, channel `production`, exact staging-verified release `a2bb18cfa2215922e1c35091a59f2ab201a89fd9`. Workflow revision is documentation-only successor `75e25b7a3579a62b3fe03571d6a6961a386f7763`; no rebuild/upload was requested.

Activate job `122990917663` is waiting for the protected Production environment review from `gorankomar`. The Review deployments dialog is open for the user. The agent did not approve its own deployment or alter protections.

Staging still serves `a2bb18cfa2215922e1c35091a59f2ab201a89fd9`. Production still serves prior release `85540b314d5e83b9c19f8499601a706c1a48f009`; independently fetched while review is pending. Production animation activation, CDN invalidation/verification and live interaction verification remain unfinished until human approval.

## Completed Webflow publication

Published the staging-tested Webflow site changes to the four configured production domain IDs, with `publishToWebflowSubdomain:false`:

- `www.stitch.co` — `69720b15a4f4a7da0ebe1e02`
- `stitch.co` — `69720b14a4f4a7da0ebe1dfc`
- `www.stitch.sa` — `6836fa3ba3cf07fdda576a7e`
- `stitch.sa` — `6836fa3ba3cf07fdda576a6d`

Publish task `97bf99bf-0863-4f79-8305-0a7c9938b472`, scope `site`. The same staging-tested native markup is now served on the production Loans pages. Fetched `https://www.stitch.co/loan-management-software` and `https://www.stitch.sa/loan-management-software`: each has two native Collections windows, one permanent router and no inline Collections runtime.

Browser inspected `.co` Loans: no raster images, both native windows visible at opacity 1, no inline transforms, correct production channel URL. This is the complete static fallback while the older production animation channel remains active. No router URLs were changed.

Animations Playground and Platform Screens were confirmed `draft:true` before and after the production site publication and remain excluded.

State: **Webflow production publication verified; animation deployment awaiting required human review.** Do not label the combined production release complete until the workflow succeeds, production serves the promoted SHA, and live motion is verified.
