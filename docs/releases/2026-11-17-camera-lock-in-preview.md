# Lock-in anchored pullback — 2026-11-17

User requested removing the topward recentering while retaining 20% outer reduction and closer final magnification. The renderer keeps the animated lock-in field as its focal point throughout the pullback, including its final pose. Reduced motion retains the static full-form view.

- PR: https://github.com/gorankomar/stitch-animations/pull/104
- Merged staging SHA: `54af97a352987a20576bf2fb0d4578e077b49523`.
- Workflow: https://github.com/gorankomar/stitch-animations/actions/runs/44037629039
- Validation: complete build, 253 passing tests, shared dependencies and Product Variety/wallet swap plus Country Flags verified.
- Served staging channel imports the new SHA. Production remains `5dc028c7d31b886c0a5d8fbe7f7391e3ef3f772f`.
- No native markup/style changes, Webflow publication, or production promotion.

PR #104 merged as `54af97a352987a20576bf2fb0d4578e077b49523`. Served staging channel verified at this SHA; production remains `5dc028c7d31b886c0a5d8fbe7f7391e3ef3f772f`. Full release validation passed (253 tests and shared bundle closure). Desktop Webflow Preview verified: final plane retains lock-in focus `translate(-1636.8px, -1366.4px)` instead of the prior top-centered focus, final camera scale .390625 × native zoom 3.2 = 1.25, outer layer remains .8. Preview left open. No page/site publication or production promotion.
