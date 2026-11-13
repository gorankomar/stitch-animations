# Product prompt staging release — 2026-11-13

Authorized staging animation delivery only; no Webflow publication or production activation. Fix targets native localized `lp-product-prompt` div with legacy span fallback. Webflow component motion-style embed saved with compatible class-based caret selectors. Full `npm run validate:release` passed. 

- PR [#86](https://github.com/gorankomar/stitch-animations/pull/86) merged as `e1e43954ca32aaeefddf2d5bcb153a109143fefa`.
- [Workflow 43519571492](https://github.com/gorankomar/stitch-animations/actions/runs/43519571492) succeeded, including CDN checksums/CORS, staging activation and completed invalidation. Independently fetched staging channel imports this exact SHA.
- Webflow Preview `/ai` verified against the native div: observed successive prompt strings from empty through `Cr`, `Create a personal loan`, and `Create a personal loan for salaried customers with dir`. Working/completion states also observed.
- Compatible Webflow motion-style embed saved and read back. No Webflow page/site publication and no production promotion. Mobile/reduced-motion visual checks were not performed; full automated release checks passed.
- Post-deployment evidence appended locally after the release merge.
