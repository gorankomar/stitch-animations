# Release records

Create YYYY-MM-DD-<release>.md for actual release or cutover verification. Record:

- Timestamp/timezone, approved scope, full merged/released SHA and workflow URL/outcome.
- Permanent channel URLs and previous/new imported SHAs; CDN file/CORS/cache/invalidation evidence. Record staging and production separately; intentional differences are normal.
- Preparation or requested release destination (staging/production), user-authorized scope and actual domains published. Distinguish animation promotion, Webflow draft save and Webflow publication; user publication can be verified by the agent without claiming the agent published.
- Tests/build/shared dependency checks and browser verification, including relevant desktop/mobile/reduced-motion behavior. State limits; do not claim every component was tested when only loader delivery was checked.
- Outcome, pending approval/publication/access, and prior verified release for rollback. Rollback of animation code and Webflow markup are separate when both changed.

Never infer page publication from upload or channel activation. Historical records retain their original delivery state; current workflows live under docs/workflows. No release is performed merely by changing documentation.
