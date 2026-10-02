# Country Flags shared release and Webflow publication

Published 2026-10-02, Europe/Zagreb (2026-10-01 22:01–22:05 UTC).

User authorized pushing/merging all pending local work and publishing staging
plus the Stitch.co production group. The release combines that work with
current origin/main, preserving the original working tree. PR #8 merged:
https://github.com/gorankomar/stitch-animations/pull/8

Immutable release: `43af496c8ba8fadfa12bfcd90eaa54d410ccb0d7`.
CDN base: https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@43af496c8ba8fadfa12bfcd90eaa54d410ccb0d7/dist/

Country Flags uses native proportional sizing and a 0.387597cqi right-edge
clip to eliminate fourth-flag slivers in its static fallback. Animation
geometry remains unchanged. Fresh generated artifacts are committed.

## Loader synchronization

- Site footer page-all-lite.js moved from `2a464fdf55bc8f7ed875b0a3175d13dd67c44071`
  to the immutable release above. All unrelated head/footer code preserved.
- Playground shared preview moved from `99ec254bba02e526342f708d21d1b8cb364d886a`
  to that release. Obsolete individual preview module/CSS overrides on
  `cdf171fd5ff4738f68e5820ca42bb3e539793107` were replaced by the shared resolver
  with a duplicate-script guard. Playground remains a draft.
- Financial Architecture, Change Due Date and Create New Card portable module
  URLs moved from `cdf171fd5ff4738f68e5820ca42bb3e539793107` to that release.
  Their surrounding component code was preserved. Country Flags and Product
  Variety use the shared loader without component overrides.
- Saved footer, Playground footer, and all three component module URLs were
  read back and verified.

## Publication and verification

Staging was published first, then production after staging interaction checks.
Full-site publication also included pending Applications, Transactions and
Deposits changes, surfaced before publication under the user's all-work scope.

| Domain | Result | Served SHA |
| --- | --- | --- |
| stitch-website.webflow.io | Published and verified | 43af496c8ba8fadfa12bfcd90eaa54d410ccb0d7 |
| www.stitch.co | Published and verified | 43af496c8ba8fadfa12bfcd90eaa54d410ccb0d7 |
| stitch.co | Published; redirects to www.stitch.co, verified | 43af496c8ba8fadfa12bfcd90eaa54d410ccb0d7 |

Stitch.sa domains were excluded. Actual HTML was checked on Home, Deposits,
Applications and Transactions for each selected domain (12 requests). Each
serves one shared loader on the expected SHA without stale repository overrides.

`npm run validate:release` passed: 26 tests, all shared entries built, required
Country Flags and Product Variety/wallet-swap inclusion and local dependency
closure verified. All 51 shared CDN modules/styles/assets matched local bytes.

Browser checks on staging and production Deposits confirmed three animated
flag tracks, nine runtime sequences, changing transforms, and the Product
Variety wallet swap. At desktop the flag frame is 275 × 247.28px, and at a
390px mobile viewport it is 292 × 262.57px, with no horizontal page overflow.
The published rows use the proportional edge clip (1.06589px desktop,
1.13178px mobile). Prior Designer/Preview fallback checks verified 27 original
flags and no fourth-flag sliver with custom code disabled. Loop tests verify
both directions and seamless wrapping; no live browser reduced-motion
preference override was performed in this publication run.

No animation module/CSS/CORS errors were observed. Existing unrelated site
authentication code logs a null login-button addEventListener error; that code
was preserved and does not stop the module animations.

Outcome: published to staging and production and verified. Active delivery
remains commit-pinned jsDelivr; CloudFront was not selected.
