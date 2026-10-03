# Income Verification — alternating rows release

2026-10-03, Europe/Zagreb. User requested alternating background rows, push/merge, and medium (middle stage). Third row now moves right to left, matching row one; row two moves left to right.

Release prepared from current origin/main `18bcc83`, preserving unrelated working-tree changes. Includes the existing unmerged Income Verification source, vector assets, portable build/preview, shared effects required by this feature, shared entry registrations, component notes, browser verifier and fresh distribution outputs. Omnichannel implementation remains unchanged in this release; no other chat source is included.

Validation: npm run validate:release passed all 62 tests, all shared builds and Product Variety/wallet swap + Country Flags dependency closure. Income Verification browser suite passed actual left/right/left movement, seamless coverage, rings, Pointer Follow, repeat mounting/cleanup, reduced motion, mobile proportional sizing, JS-disabled fallback and forced setup failure; no page errors.

Merged release SHA: `780ec77eb6406cf9acf8f7de1be0efb3cd0a2109`.

Saved site footer and Playground page footer both changed from `412ad273d4e025e8852636a7ab126945d5564487` to the merged release. Site settings reload confirmed saved footer; Playground saved draft and enabled-code Preview confirmed exactly one page-all-lite loader at the new SHA. Only the existing SHA was replaced; unrelated code retained. All 77 runtime JS/CSS files served by jsDelivr matched local committed bytes.

Income Verification script-only embed `dd528580-5ebc-a73c-942d-41dcc3d14d37` was cleared and read back empty. Native artwork, editable slots and style-only embed preserved. Preview contains no inline Income Verification runtime.

Desktop Preview: ready=true; sampled track x translations [-1044.74,-1375.78,-1111.02] → [-1048.18,-1372.09,-1114.68], confirming left/right/left through the shared loader. Mobile 393px viewport: proportional frame 345 × 177.609375, motion initialized. Desktop breakpoint restored.

Proof: [Webflow Preview](assets/2026-10-03-income-verification-middle.jpg).

Outcome: **middle saved — ready for user publication**. No domains selected or published. User publishes next; live-site verification is pending.
