# Film RTL controls — staging

User authorized push to staging: GitHub push/merge, staging animation activation and Webflow Preview only; no Webflow publication or production promotion. Based on current origin/main `868f62d`. Unrelated original-checkout changes preserved.

Changes: direction-aware played/buffered/volume gradients and logical subtitle-menu placement beside CC in Arabic. Landing and CMS runtimes/local previews regenerated from canonical sources. Both existing Webflow embeds saved, preserving playback/subtitles and native markup. Full release validation passes, 264 tests and shared dependency closure. Shared dist output is unchanged. Merge/workflow/Preview evidence follows after verification.

PR https://github.com/gorankomar/stitch-animations/pull/111 merged as `f015bb2db0d65c6bdb5262cf7267b0bb58b54016`. Workflow https://github.com/gorankomar/stitch-animations/actions/runs/44134256940 completed successfully. Served staging channel imports that exact release; production remains `3b633220389d5cff7871bfcb09563897fb156779`.

Actual Arabic Webflow Preview verified both track directions resolve `to left`, native ArrowLeft increases seek from 0 to 0.1, and partial seek 20.1% / volume 10% fills originate at the right. Desktop menu x=548 matches CC x=548. At 393px Preview, the 345×194.0625 player contains the complete 210×159 menu beside CC; no scrolling or clipping. Saved screenshot `/private/tmp/stitch-film-rtl-preview.jpg`. Both saved embeds contain the regenerated fix. No Webflow publication or production activation occurred. Final documentation follow-up uses the same validated source and unchanged dist.
