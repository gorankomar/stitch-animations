# CloudFront channel cutover verification — 2026-10-06

Timezone: Europe/Zagreb. User configured AWS/GitHub protections, manually promoted production, installed the supplied router in Webflow site settings and Playground page settings, then published. Agent performed read-only serving/configuration checks and simplified the publishing documentation; no new Webflow publication or production promotion was performed by the agent in this verification task.

## Release and deployment evidence

- Released SHA: `418f5b3456270c678384990e6db49ffb70c8e175`, merged by [PR #32](https://github.com/gorankomar/stitch-animations/pull/32). The private-origin missing-channel bootstrap fix confirms exact object absence through authenticated S3 listing before initialization; existing but inaccessible objects fail closed.
- [Staging workflow 37481419727](https://github.com/gorankomar/stitch-animations/actions/runs/37481419727) succeeded: 80 tests/full build/shared dependency checks, upload of 191 checksummed files, staging activation, invalidation completion and served-loader verification.
- [Production promotion 37482981051](https://github.com/gorankomar/stitch-animations/actions/runs/37482981051) succeeded after user action/review. Production endpoint imports the same exact staging release.
- Independent agent verification checked all 191 release file checksums and CORS for staging plus all four configured production origins. Both channel pointers were subsequently read back and still selected that SHA.
- GitHub environment read: `staging` exists without required reviewer; `Production` requires gorankomar approval, permits self-review, and its sole branch rule is `main`.
- Channel responses and workflow verification confirmed JavaScript MIME, no-cache/max-age=0/must-revalidate and working delivery. S3 versioning/lifecycle/private-origin policies are admin-reported; the agent did not audit the full AWS configuration directly.

## Webflow cutover

Site `6823036cd77b3093eaf9154d`; Playground `6ab4079ac7ca32e3a6c168c8`.

Read-back site footer contains the prepared environment router and preserves unrelated auth, navigation, FAQ, footer and analytics code. Playground page footer contains the same router. Both use `stitch-code-page-loader`, selecting staging for Preview/staging and production for stitch.co/www.stitch.co/stitch.sa/www.stitch.sa. Old direct root loader and jsDelivr shared-loader tags have been replaced in the active saved code.

Actual published home HTML fetched from `stitch-website.webflow.io`, `www.stitch.co`, and `www.stitch.sa`: each includes exactly one environment router and no active legacy direct page-all loader. Apex production origins were checked for release CORS; their home HTML was not independently fetched in this pass.

Browser on www.stitch.co confirmed one production channel module and seven stylesheet links resolving under the immutable released SHA. Browser on staging confirmed the staging channel selection. User reports the Playground and published interactions working after cutover. This check establishes loader delivery/routing; it is not a full visual regression test of every illustration, breakpoint or reduced-motion state. Product Variety/wallet swap and Country Flags bundle inclusion was validated by the full release checks; their visual behavior was not individually retested here.

Existing unrelated missing `login-button` addEventListener error remains on the home page. No CloudFront/CORS error was reported in the production browser check.

## Guide change

Normal release commands are now publish to staging and publish to production. Local files/localhost and Webflow drafts/Playground remain preparation, with explicit no-publication constraints honored. Middle is retired as a normal stage and retained only as a legacy preparation alias. Animation-only channel activation and markup/style Webflow publication remain separate operations coordinated under the requested destination. No routine Webflow SHA editing is required. Documentation changes are saved locally; they do not activate another release.
