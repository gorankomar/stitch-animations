# Real AI film multilingual subtitles — staging preparation

Authorization: user requested “push this to staging with all the changes.” This authorizes GitHub push/merge, staging channel activation, saved Webflow drafts and Preview verification. No Webflow page/site publication or production promotion.

Based on current origin/main `3b633220389d5cff7871bfcb09563897fb156779` in managed branch `codex/real-ai-film-subtitles-20261117`. Original checkout's unrelated changes are preserved. Scope: all subtitle source/translations/provenance, CC assets, canonical player/builders, generated landing/CMS previews and embeds, behavior tests, component documentation, and client review deliverables. Full shared build generates no changed dist files relative to current main.

Full validation: `npm run validate:release` passes, 264 tests and Product Variety/wallet swap + Country Flags dependency closure. Source/build assets are unchanged by the shared compile. Saved both affected Webflow embeds; new landing nodes and managed icon asset IDs are in the component notes. Permanent site-wide and Playground loaders are untouched. Playground is not published; this task invokes no publication action.

The merge's enabled `publish-s3.yml` workflow is responsible for activating staging only. Completion requires the workflow to finish and the served staging pointer to match the merged SHA; verify Preview captions/menu, body + Arabic-body fonts and desktop/mobile layout. Production is deliberately unchanged. Exact workflow/served-pointer evidence is added after deployment verification.
