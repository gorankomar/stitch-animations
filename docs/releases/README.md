# Release records

Create YYYY-MM-DD-<release>.md only for actual release work. Record:

- Timestamp/timezone, approved change, full merged commit SHA.
- CDN provider and immutable base; site-wide, playground, and component loader URLs.
- User-authorized domains and actual published domains.
- Test/build/shared-check results; served content comparisons; published HTML loader checks and interaction checks, including desktop/mobile.
- Outcome: prepared, saved draft, published/verified, failed, or rolled back; remaining action and previous verified URLs.

Never infer publication from deployment success. No release is performed by this documentation change. Historical notes without original dates/commits are kept in historical-verification.md and are not verified current state.
