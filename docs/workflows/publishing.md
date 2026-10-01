# Saving and publishing

## Four completion stages

Use the stage explicitly requested by the user. Without one, default to **save locally**, except a request to create a Figma illustration in Webflow defaults to **save to Webflow (draft)** per [illustration creation](illustration-creation.md). If the user only says “publish” and the destination cannot be established from the current task, ask staging or production before publishing.

| Request | Agent action | Completion evidence |
| --- | --- | --- |
| Save locally | Save source/assets/docs and verify local preview. No Webflow writes, GitHub push/merge, or publication implied. | Saved files and local verification result. |
| Save to Webflow | Save the requested component/page/custom code as a Webflow draft. Verify Designer/Preview. If the shared loader must change for this draft, prepare a verified immutable release and align draft loader URLs; never use an older playground override. Do not publish either destination. | Saved draft and preview results; report any draft site-wide loader change. |
| Publish to staging | Prepare/verify the release, update the Webflow site-wide footer loader and matching draft preview/component loaders, save, then publish only the Webflow staging domain. | Staging HTML references the chosen release and changed interaction works there. Production is not selected for publication. |
| Publish to production | Prepare/verify the release, update site-wide footer and matching draft preview/component loaders, save, then publish only the user-authorized production domains. | Every selected production domain serves the chosen release and changed interaction works. Staging is included only if requested. |

Publishing authorization includes the necessary release preparation, GitHub push/merge, loader updates, and verification for that requested change. Do not ask the user to edit the loader or SHA manually. Missing access or an unknown target domain is a concrete blocker: finish preparation, identify exactly what is missing, and ask only for that information/access.

Known site: Stitch Website, site ID 6823036cd77b3093eaf9154d. Playground page ID: 6ab4079ac7ca32e3a6c168c8. Exact staging/production domains are not documented here: inspect the site's configured domains and current task authorization. Never guess or select every domain by default. If multiple production domains exist and authorized scope is unclear, ask which ones.

## Active shared loader and hosting policy

The “light script” is **dist/page-all-lite.js**. It scans matching markup and imports only needed feature modules. Those modules reuse shared effects and may reference further chunks, CSS, and assets; the entry file alone is not the full release. Build/publish the complete dependency set.

**Active delivery: GitHub through jsDelivr, pinned to the full merged commit SHA.**

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@FULL_MERGED_SHA/dist/page-all-lite.js"></script>
```

User-reported status on 2026-10-01: S3 upload works, but cross-origin module loading from site domains is blocked by an unresolved S3/CloudFront CORS/domain issue. The admin is working on it. Continue using jsDelivr until the fix is confirmed and delivery is verified in a browser on the intended origins. Do not switch providers because an S3 deployment succeeded. This is reported operational status, not a diagnosis independently verified here.

S3 remains an upload destination through the existing CI workflow. CDN upload, GitHub merge, Webflow draft save, staging publication, and production publication are distinct states. Changing to S3/CloudFront is a separate hosting decision requiring verification of immutable assets, edge freshness, module/CSS dependencies, and actual cross-origin browser requests. Do not expand CORS or change infrastructure as part of ordinary publication.

## Agent-owned loader synchronization

For both staging and production publication:

1. Inspect the actual current Webflow site-settings footer code, Playground page code/embeds, and affected component loaders. Read their SHAs live; do not infer them from Preview success or old notes. Capture previous URLs and preserve all unrelated custom code.
2. Follow [shared release](shared-release.md): combine approved changes with current origin/main, validate all entries, and merge. Ensure the merged SHA actually contains fresh committed dist outputs for the desired feature; CI's S3 build alone does not put those outputs into GitHub for jsDelivr.
3. Choose one full merged SHA. Verify its jsDelivr entry and all needed modules/CSS/assets are available before changing Webflow. Never use @main or a feature-branch URL as the active loader.
4. Update the existing site-wide **Site Settings → Custom Code → Footer code** script URL to that SHA. Do not append another page-all-lite loader. Save the settings and verify the saved URL.
5. Align the Playground shared preview loader and any component/portable module loaders with the same base/SHA. Regenerate portable embeds using STITCH_ASSET_BASE as described in the release guide. Remove obsolete overrides/duplicate implementations only after verifying their replacement and preserving unrelated code. Local development references remain local.
6. Verify the Webflow draft/Preview, then inspect the publish target selection. Publish only the requested staging or production domains. Account for other pending site drafts: inspect publication scope and do not knowingly publish unrelated changes; surface unavoidable unrelated publication before proceeding.
7. Inspect actual published HTML on each selected domain, including the footer and page-specific overrides. Confirm the exact expected SHA, no stale override or duplicate shared loader, successful module/CSS loads without CORS errors, changed interaction, Product Variety wallet swap, and Country Flags wherever present. Check desktop/mobile and reduced motion where relevant. Preview-only success is insufficient.
8. Record domain-by-domain results and previous/new URLs in [release records](../releases/README.md). If verification fails, report failure rather than success; restore matching loaders together using the previous verified immutable release when authorized for that destination.

Webflow draft settings are shared configuration. A staging publish does not create an independent production draft configuration: record the production site's currently served release separately, and re-read settings before every later publish. Never describe saved draft settings as already served on production.

Completion reports must use one of: **saved locally**, **saved to Webflow (draft)**, **published to staging and verified**, or **published to production and verified**. Include the release SHA and selected domains for publication. If verification/access fails, state what completed and what remains blocked.
