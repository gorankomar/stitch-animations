# Income Verification — alternating rows release

2026-10-03, Europe/Zagreb. User requested alternating background rows, push/merge, and medium (middle stage). Third row now moves right to left, matching row one; row two moves left to right.

Release prepared from current origin/main `18bcc83`, preserving unrelated working-tree changes. Includes the existing unmerged Income Verification source, vector assets, portable build/preview, shared effects required by this feature, shared entry registrations, component notes, browser verifier and fresh distribution outputs. Omnichannel implementation remains unchanged in this release; no other chat source is included.

Validation: npm run validate:release passed all 62 tests, all shared builds and Product Variety/wallet swap + Country Flags dependency closure. Income Verification browser suite passed actual left/right/left movement, seamless coverage, rings, Pointer Follow, repeat mounting/cleanup, reduced motion, mobile proportional sizing, JS-disabled fallback and forced setup failure; no page errors.

Middle loader save and Preview verification evidence will be recorded after merge. Publication remains with the user.
