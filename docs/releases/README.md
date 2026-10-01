# Release records

Create YYYY-MM-DD-<release>.md only for actual release work. Record:

- Timestamp/timezone, approved change, full merged commit SHA.
- CDN provider and immutable base; previous/new site-wide footer, playground, and component loader URLs; saved settings verification. Active provider is jsDelivr pending verified CORS resolution. Record staging and production served SHAs separately.
- Requested stage (local/Webflow draft/staging/production), user-authorized domains, actual selected/published domains, and any other pending draft scope.
- Test/build/shared-check results; served content comparisons; published HTML loader checks and interaction checks, including desktop/mobile.
- Outcome: prepared, saved draft, published/verified, failed, or rolled back; remaining action and previous verified URLs.

Never infer publication from deployment success. No release is performed by this documentation change. Historical notes without original dates/commits are kept in historical-verification.md and are not verified current state.
