# Harness localization and RTL tabs — staging

- User authorized push to staging, Webflow draft edits, user-owned translation, and explicitly omitted further tests/browser Preview.
- PR: https://github.com/gorankomar/stitch-animations/pull/106
- Merged release: `fe2e681a22556b6b4c38cd0ffa59ea49e8b12381` (base current main `97b491b074b0c5a08d9674a14b6d212bb669e5a7`).
- Workflow: https://github.com/gorankomar/stitch-animations/actions/runs/44082460455 — upload, CDN checksum/CORS verification and staging activation succeeded. Workflow's existing automated validation passed; no additional local tests or browser Preview performed.
- Served staging channel directly confirmed importing the exact merged release.
- Saved native hidden pending text spans inside Real AI Harness (`8d35cc44-b66a-563b-336d-8b924758028c`): Build `7b0aa537-9d89-f88f-75a4-a77859583dc8`, Test `cc8da189-83cf-3167-1931-7c31c450ae5b`, Publish `f854dc6d-9553-134c-181d-b488ebb6a923`. Each carries HTML `hidden` and `data-harness-copy="pending"`; existing completed text retained. User translates native component text.
- Saved RTL gradient/progress geometry in Real AI page Solution embed `cd6b6191-da89-c974-b551-721212fe89b1`. Preserved live saved settings (600 selected weight, 0.18 threshold, 700 brake time and duration multiplier, Copilot clipping rule).
- No Webflow page/site publication; no production activation; no permanent loader changes. Playground remains draft.
