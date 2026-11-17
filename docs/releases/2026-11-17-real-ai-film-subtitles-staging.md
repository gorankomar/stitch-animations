# Real AI film multilingual subtitles — staging preparation

Authorization: user requested “push this to staging with all the changes.” This authorizes GitHub push/merge, staging channel activation, saved Webflow drafts and Preview verification. No Webflow page/site publication or production promotion.

Based on current origin/main `3b633220389d5cff7871bfcb09563897fb156779` in managed branch `codex/real-ai-film-subtitles-20261117`. Original checkout's unrelated changes are preserved. Scope: all subtitle source/translations/provenance, CC assets, canonical player/builders, generated landing/CMS previews and embeds, behavior tests, component documentation, and client review deliverables. Full shared build generates no changed dist files relative to current main.

Full validation: `npm run validate:release` passes, 264 tests and Product Variety/wallet swap + Country Flags dependency closure. Source/build assets are unchanged by the shared compile. Saved both affected Webflow embeds; new landing nodes and managed icon asset IDs are in the component notes. Permanent site-wide and Playground loaders are untouched. Playground is not published; this task invokes no publication action.

The merge's enabled `publish-s3.yml` workflow is responsible for activating staging only. Completion requires the workflow to finish and the served staging pointer to match the merged SHA; verify Preview captions/menu, body + Arabic-body fonts and desktop/mobile layout. Production is deliberately unchanged. Exact workflow/served-pointer evidence is added after deployment verification.

## First staging activation and Preview evidence

PR https://github.com/gorankomar/stitch-animations/pull/109 merged as `e859de8097abc64bcc404f975d45358fa248e385`. Workflow https://github.com/gorankomar/stitch-animations/actions/runs/44126945356 completed successfully, including immutable upload/CDN/CORS verification and staging-only activation. The served staging pointer imported that exact SHA. Production remained `3b633220389d5cff7871bfcb09563897fb156779`.

Actual saved Webflow Preview verified Arabic `font-family: "IBM Plex Sans Arabic", Arial, sans-serif`, RTL and the site's Arabic body variable; English resolves `ABCDiatype, Arial, sans-serif`. Both CC image states load from managed assets. At a 393px Preview viewport the player is 345×194.0625 and its entire 210×159 subtitle menu fits inside without scrolling.

Preview exposed two native-import differences, corrected in the follow-up source/build and both saved embeds: WHTML merged inline sprite properties into the shared base, so the builder now derives country-scoped sprite rules from the same manifest; a caption node appended after controls could paint above the menu, so explicit caption/control stacking preserves menu readability. Correct country positions were re-read from actual Preview: US -416/-336, Saudi Arabia -128/-288, Vietnam -160/-360, Indonesia -256/-144. These are integration corrections, not changes to flag geometry or the approved design.

No publication action or production promotion was invoked. The final follow-up merge also triggers the normal staging-only workflow; its completion and served pointer are checked before reporting completion.
