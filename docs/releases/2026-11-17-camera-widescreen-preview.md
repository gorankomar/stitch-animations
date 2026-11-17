# Product camera widescreen Preview — 2026-11-17

Scope: saved Webflow draft and staging animation activation only. No Webflow page/site publication or production promotion.

- PR: https://github.com/gorankomar/stitch-animations/pull/103
- Staging release: `da6d37e30fd0df125886f5a9cf302ac8e6e92424`.
- Workflow https://github.com/gorankomar/stitch-animations/actions/runs/44035847711 completed successfully, including CDN byte/CORS verification and staging activation/invalidation.
- Served staging channel imports that exact release; production remains `5dc028c7d31b886c0a5d8fbe7f7391e3ef3f772f`.
- Full validation passed: 253 tests, complete build, shared dependency closure including Product Variety/wallet swap and Country Flags.
- Native draft camera: 16:9 base/small, max-width 64rem, centered; fields scale revised from .75 to .8.
- Draft component opts into `data-camera-end-frame="fill-top"`. Shared renderer compensates the outer scale and recenters the final view to fill the frame from the form's top. Unmarked published instances retain the original ending.
- Staging code prepared from current origin/main in the managed camera-preview-framing worktree; unrelated original-checkout edits preserved.
- Webflow Preview verified after reload: desktop form width 1023.999px in a 1024px frame, left/top offsets 0px at the final pose; mobile form width 345px in a 345px frame, left offset 0px and top offset ~0.006px. Outer scale .8 and mobile frame 345×194 confirmed. Existing typing/dropdown cycle plays. Desktop Preview left open. Reduced-motion final geometry covered by regression test.
