# AWS admin handoff: permanent staging and production animation loaders

Prepared 2026-10-05; configuration/bootstrap and published router cutover completed and verified on 2026-10-06. This handoff is retained as infrastructure reference. Use docs/workflows/publishing.md for the current two-destination workflow and docs/releases/2026-10-06-cloudfront-cutover.md for verification evidence. The original setup checklist below is historical, not pending work.

## Existing infrastructure and proposed paths

- Bucket: `stitch-website-animations`.
- Existing S3 prefix: `Stitch Animations/` (a space, not a plus sign).
- Existing CloudFront hostname: `d280qq257tic0i.cloudfront.net`.
- Existing working public base: `https://d280qq257tic0i.cloudfront.net/Stitch+Animations/`.
- Preserve the existing origin/path mapping that makes that public base work. Verify the SAME mapping for the new nested paths; if a literal plus maps differently there, report it before enabling deployment.

New S3 objects:

```text
Stitch Animations/releases/<full Git SHA>/...complete dist contents...
Stitch Animations/releases/<full Git SHA>/release.json
Stitch Animations/channels/staging/page-all-lite.js
Stitch Animations/channels/production/page-all-lite.js
Stitch Animations/channel-history/<channel>/<timestamp>-<previous SHA>.js
```

The repository workflow no longer overwrites or deletes the existing root files. Those stay available throughout migration. A GitHub `main` push builds/tests and retains an artifact; AWS upload and automatic STAGING activation stay disabled until the repository variable `STITCH_CHANNELS_ENABLED` is exactly `true`. Production activation is a separate manual workflow operation.

## Required CloudFront configuration

1. Identify the distribution serving the hostname above and provide its distribution ID. Add it as the GitHub Actions repository variable `STITCH_CLOUDFRONT_DISTRIBUTION_ID`.
2. Create an ordered cache behavior matching the actual viewer path for the two `channels/*` loader objects. It must take precedence over the normal animation asset behavior. Use AWS managed **CachingDisabled**, or an equivalent policy with minimum/default/maximum TTL all zero. The workflow writes `Cache-Control: no-cache,max-age=0,must-revalidate`. Do not force a positive minimum TTL, override these headers, or add stale-serving directives to channel loaders.
3. For `releases/*` and `channel-history/*`, honor `Cache-Control: public,max-age=31536000,immutable`, with maximum TTL at least 31536000 seconds. These objects have unique paths and must not change after completion. No release-wide invalidation is needed on an ordinary promotion.
4. Apply the existing working CORS configuration to BOTH behaviors, including dependencies, CSS and manifest JSON. Verify module GET requests from `https://stitch-website.webflow.io`, `https://stitch.co`, `https://www.stitch.co`, `https://stitch.sa` and `https://www.stitch.sa`. A wildcard ACAO works for these public, credential-free assets; retain the existing approved CORS arrangement rather than making the bucket public. If returning origin-specific ACAO, ensure the cache/origin-request policy handles `Origin` consistently. Preserve Designer/Preview support.
5. Preserve correct JavaScript, CSS, JSON and image Content-Type headers. Missing objects must return their real failure status, not an HTML success fallback. Use a short error-cache TTL for new paths so a pre-upload 404 does not linger (S3 origins may enforce a minimum error-cache interval).
6. Confirm that these public loader paths resolve correctly and that invalidating the exact viewer path refreshes them:
   - `/Stitch+Animations/channels/staging/page-all-lite.js`
   - `/Stitch+Animations/channels/production/page-all-lite.js`
   If CloudFront also serves space-encoded aliases, account for them in your behavior rules; the supplied Webflow loader uses the plus-sign paths consistently.

## Required S3/IAM configuration

- Keep current private-bucket/origin access controls. No new public bucket access is requested.
- Enable S3 Versioning, if not already enabled, as additional protection for the small mutable channel objects. It is supplementary to the retained release folders, not a replacement for them.
- Do not expire or delete current or previous release folders automatically. For the initial migration, retain all releases and channel history. Design a separate reviewed cleanup policy later; long-lived browser tabs can still request older lazy-loaded modules.
- Give the EXISTING GitHub deployment identity `s3:ListBucket` scoped to the needed prefix and `s3:GetObject` / `s3:PutObject` for `Stitch Animations/releases/*`, `Stitch Animations/channels/*`, and `Stitch Animations/channel-history/*`. It does not need `s3:DeleteObject` for this workflow. If using KMS encryption, preserve the necessary key permissions for this identity.
- On the specific CloudFront distribution, give that identity `cloudfront:GetDistribution`, `cloudfront:CreateInvalidation` and `cloudfront:GetInvalidation`. The workflow waits for invalidation completion and compares the served loader afterwards. Do not send AWS keys through chat; keep the existing GitHub Actions secrets.
- Review any lifecycle or bucket policies that might block or expire these new prefixes.

## GitHub configuration and coordinated cutover

1. Set `STITCH_CLOUDFRONT_DISTRIBUTION_ID` after AWS policies are applied. Leave `STITCH_CHANNELS_ENABLED` unset until ready.
2. Create GitHub Actions environments named `staging` and `production`. Restrict production deployment to `main`; configure a required reviewer if the repository plan supports it. The manual production workflow remains an explicit authorization step even without reviewer support.
3. Set `STITCH_CHANNELS_ENABLED=true`, then run **Build and publish animations → upload**, on `main`. This validates the complete release, uploads to its SHA directory, verifies all file checksums and staging CORS, and activates staging. Production remains untouched.
4. Have the agent verify staging browser interactions against that release. Only after explicit production authorization, manually run **promote**, channel **production**, with the exact staged SHA. The script requires that SHA to be active on staging and verifies all four production origins before switching the pointer.
5. Once both endpoints are initialized and verified, the agent installs `webflow-channel-loader.html` in the existing site footer and Playground footer, preserving unrelated code and removing only replaced shared-loader code. Verify Preview; publish staging first. Production Webflow publication stays separately authorized.
6. Future `main` uploads automatically move staging. Production moves only through the manual production operation after visual verification and user authorization. The workflow's byte/CORS checks do not replace browser interaction checks.
7. Rollback: run **rollback**, select the affected channel and the previously verified SHA from its workflow output/history. The script verifies retained assets, saves the previous pointer, switches the selected channel, waits for invalidation, then checks served content. It deliberately permits production rollback even when staging has moved on. Record and verify the interaction after rollback.

Admin reply needed: distribution ID, confirmation of cache/CORS/IAM/versioning/retention settings, and confirmation that the new public plus-sign paths map to the space-containing S3 prefix. No Webflow edits or manual SHA replacement are needed from the admin.

References: [CloudFront cache expiration](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html), [CloudFront invalidation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html), [S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html).
