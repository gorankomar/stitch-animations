# Real AI Copilot staging animation release

- Staging serves `63deae072535b844390b37bdc8178a4a9f6cf02c` via the permanent CloudFront channel. The served lightweight loader and Copilot module matched the validated build. [Feature PR](https://github.com/gorankomar/stitch-animations/pull/63) and [loader fix](https://github.com/gorankomar/stitch-animations/pull/64).
- Full release validation passed with 224 tests. The shared loaders retain Product Variety wallet swap and Country Flags.
- The Real AI Webflow draft saves the five-second tab dwell, computed progress insets, orange glow opacity and caret styles. Designer Preview with custom code enabled loaded the staging router. Both track edges matched the 40px computed menu padding at desktop and phone breakpoints. Verified typing, the full prompt, the animated caret and changing glow opacity.
- Webflow rejected the single-page staging publish request with HTTP 400 for `pageId`. Real AI changes are saved in Webflow and visible in Preview. Animations Playground was confirmed as a draft. Production promotion was outside this release.
