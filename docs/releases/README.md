# Release records

Create YYYY-MM-DD-<release>.md only for actual release work. Record:

- Timestamp/timezone, approved change, full merged commit SHA.
- CDN provider and immutable base; previous/new site-wide footer, playground, and component loader URLs; saved settings verification. CloudFront staging root delivery was verified on 2026-10-05; channel migration and production verification remain pending. After cutover, record permanent channel URLs plus their imported release SHAs and invalidation/served-file evidence. Record staging and production served SHAs separately.
- Requested stage (local/Webflow draft/middle/staging/production), user-authorized domains, actual selected/published domains (none for middle; user publication and live verification pending), and any other pending draft scope.
- Test/build/shared-check results; served content comparisons; published HTML loader checks and interaction checks, including desktop/mobile.
- Outcome: prepared, saved draft, published/verified, failed, or rolled back; remaining action and previous verified URLs.

Never infer publication from deployment success. No release is performed by this documentation change. Historical notes without original dates/commits are kept in historical-verification.md and are not verified current state.
