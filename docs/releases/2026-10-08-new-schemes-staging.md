# New schemes support staging — 2026-10-08

User authorized publishing to staging. PR #45 merged all source, optimized assets and masters, component notes, tests, local previews and fresh distribution files: https://github.com/gorankomar/stitch-animations/pull/45

Verified animation release `0f2b9a2fb2135a979f8d557e93df5d99ad288bcc`; previous staging `75f52005581cc020ec64216dfc2eb83a541fdfaa`. Production unchanged at `418f5b3456270c678384990e6db49ffb70c8e175`.

Workflow https://github.com/gorankomar/stitch-animations/actions/runs/37806905379 completed successfully, including full shared validation (115 tests), complete CDN byte/MIME/CORS verification and staging activation with completed cache invalidation. Served staging channel independently verified.

Saved site and Playground footer routers re-read: permanent environment router unchanged; Preview has exactly one staging loader. Playground draft flag verified true. No Webflow publication or production activation.

Actual Webflow Preview verified at desktop 630×324.328 and mobile 345×177.609. Cursor and checks changed through select/clear states, cursor hidden during holds, artwork intact. Country Flags retains three transformed tracks; Product Variety remains motion-ready. Shared release checker verifies both features and local dependencies. Reduced-motion behavior covered by tests and local verification. Screenshot: `/private/tmp/new-schemes-staging.jpg`.

This evidence-only follow-up has identical animation bytes; its main workflow may assign a subsequent staging SHA.
