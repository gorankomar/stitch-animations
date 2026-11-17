# Complete release — production approval pending

- All pending checkout source, assets, tests, documentation and instructions combined with current origin/main in an isolated temporary checkout; original working edits preserved. Existing merged camera framing and translation-safe Harness revisions retained during conflict resolution.
- PR #108: https://github.com/gorankomar/stitch-animations/pull/108
- Merged release: `3b633220389d5cff7871bfcb09563897fb156779`.
- Full local validation: 262 tests passed, complete shared build and dependency closure passed, including Product Variety/wallet swap and Country Flags. Film snippet regeneration produced no differences; fresh shared dist matched main.
- Staging workflow https://github.com/gorankomar/stitch-animations/actions/runs/44091982116 succeeded, including complete CDN bytes/MIME/CORS verification and staging activation/invalidation. Served channel independently confirmed importing the exact merged SHA with no-cache headers.
- Staging `/ai` browser check: one shared staging loader, camera rendering changes, localized Harness tab content, native film start and pause controls. Full film reached readyState 4. Automated tests cover reduced-motion camera ending and film/CMS lifecycle. Browser viewport was mobile-sized; a new desktop visual review was not performed in this release chat.
- Production pointer before approval remains `97b491b074b0c5a08d9674a14b6d212bb669e5a7`.
- Exact staged SHA dispatched via protected production promotion: https://github.com/gorankomar/stitch-animations/actions/runs/44092302432 . Approval belongs to the user; no protection bypass.
- Webflow configured production hosts re-read: www.stitch.co, stitch.co, www.stitch.sa, stitch.sa. Promotion affects all four hosts. Saved film player/Press template and camera/Harness page changes still require production Webflow publication after approval; public `/ai` on both www hosts does not yet contain the film player.
- No Webflow page/site published by this chat. Animations Playground confirmed draft=true. Preserve this draft status and exclude it from any future publication.
