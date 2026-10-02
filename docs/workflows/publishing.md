# Saving and publishing

## Five completion stages

Use the stage explicitly requested by the user. Without one, default to **save locally**, except a request to create a Figma illustration in Webflow defaults to **save to Webflow (draft)** per [illustration creation](illustration-creation.md). If the user only says “publish” and the destination cannot be established from the current task, ask staging or production before publishing.

| Request | Agent action | Completion evidence |
| --- | --- | --- |
| Save locally | Save source/assets/docs and verify local preview. No Webflow writes, GitHub push/merge, or publication implied. | Saved files and local verification result. |
| Save to Webflow | Save the requested component/page/custom code as a Webflow draft. Verify Designer/Preview. If the shared loader must change for this draft, prepare a verified immutable release and align draft loader URLs; never use an older playground override. Do not publish either destination. | Saved draft and preview results; report any draft site-wide loader change. |
| Middle | Prepare/verify and merge the shared release, update the existing jsDelivr script in Site Settings → Custom Code → Footer code to its full SHA, synchronize the Playground shared preview loader and remove redundant component animation scripts, and save. Leave publication to the user. | Saved footer and matching loader URLs verified; full release SHA and ready-to-publish handoff. No domains published by the agent. |
| Publish to staging | Prepare/verify the release, update the Webflow site-wide footer loader and the shared Playground preview loader and remove redundant component animation scripts, save, then publish only the Webflow staging domain. | Staging HTML references the chosen release and changed interaction works there. Production is not selected for publication. |
| Publish to production | Prepare/verify the release, update site-wide footer and the shared Playground preview loader and remove redundant component animation scripts, save, then publish only the user-authorized production domains. | Every selected production domain serves the chosen release and changed interaction works. Staging is included only if requested. |

A **middle** request authorizes the necessary release preparation, GitHub push/merge, and saved loader updates, but no Webflow publication. “Push to middle”, “save to middle”, and “update the SHA; I’ll publish” mean this stage. The agent finds and replaces the SHA; the user only chooses domains and clicks Publish. The existing **save to Webflow** stage covers the Animations Playground draft and requested component/page work; middle prepares the shared site settings for manual publication.

If the requested change already has a verified merged release with fresh dist assets, reuse that SHA after checking CDN availability and current saved loaders; do not rebuild or create another release solely to update the settings.

Publishing authorization includes the necessary release preparation, GitHub push/merge, loader updates, and verification for that requested change. Do not ask the user to edit the loader or SHA manually. Missing access or an unknown target domain is a concrete blocker: finish preparation, identify exactly what is missing, and ask only for that information/access.

Known site: Stitch Website, site ID 6823036cd77b3093eaf9154d. Playground page ID: 6ab4079ac7ca32e3a6c168c8. Exact staging/production domains are not documented here: inspect the site's configured domains and current task authorization. Never guess or select every domain by default. If multiple production domains exist and authorized scope is unclear, ask which ones.

## GitHub scope

“Push and merge” means complete all approved changes made in the chat, including source, assets, shared effects, documentation, instructions, tests, and regenerated dist files. Fetch current main, preserve newer merged work, resolve conflicts, validate the combined release, push, and merge into main. Do not restrict the commit to the named animation while leaving its documentation behind. Preserve unrelated unapproved work from other chats separately.

“Middle” includes this full chat scope and the saved Webflow loader synchronization described above. A GitHub-only push-and-merge request does not request Webflow loader changes or publication.

## Active shared loader and hosting policy

The “light script” is **dist/page-all-lite.js**. It scans matching markup and imports only needed feature modules. Those modules reuse shared effects and may reference further chunks, CSS, and assets; the entry file alone is not the full release. Build/publish the complete dependency set.

**Active delivery: GitHub through jsDelivr, pinned to the full merged commit SHA.**

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/gorankomar/stitch-animations@FULL_MERGED_SHA/dist/page-all-lite.js"></script>
```

User-reported status on 2026-10-01: S3 upload works, but cross-origin module loading from site domains is blocked by an unresolved S3/CloudFront CORS/domain issue. The admin is working on it. Continue using jsDelivr until the fix is confirmed and delivery is verified in a browser on the intended origins. Do not switch providers because an S3 deployment succeeded. This is reported operational status, not a diagnosis independently verified here.

S3 remains an upload destination through the existing CI workflow. CDN upload, GitHub merge, Webflow draft save, staging publication, and production publication are distinct states. Changing to S3/CloudFront is a separate hosting decision requiring verification of immutable assets, edge freshness, module/CSS dependencies, and actual cross-origin browser requests. Do not expand CORS or change infrastructure as part of ordinary publication.

## Agent-owned loader synchronization

For middle, staging, and production:

1. Inspect the actual current Webflow site-settings footer code, Playground page code/embeds, and affected component loaders. Read their SHAs live; do not infer them from Preview success or old notes. Capture previous URLs and preserve all unrelated custom code.
2. Follow [shared release](shared-release.md): combine approved changes with current origin/main, validate all entries, and merge. Ensure the merged SHA actually contains fresh committed dist outputs for the desired feature; CI's S3 build alone does not put those outputs into GitHub for jsDelivr.
3. Choose one full merged SHA. Verify its jsDelivr entry and all needed modules/CSS/assets are available before changing Webflow. Never use @main or a feature-branch URL as the active loader.
4. Update the existing site-wide **Site Settings → Custom Code → Footer code** script URL to that SHA. Do not append another page-all-lite loader. Save the settings and verify the saved URL.
5. Align the Playground page-settings shared preview loader with the site-wide loader's base/SHA. At middle, remove component-level feature-module script tags and inline animation runtimes for features resolved by page-all-lite; do not merely update their SHAs. The page-settings loader is sufficient for Webflow Preview when custom code is enabled, and the site-wide footer owns initialization on published pages. Preserve native markup, data attributes, style-only embeds, and unrelated custom code. If an embed mixes styles and scripts, remove only the redundant animation script. A standalone portable loader is retained only when the user explicitly requests independent use outside shared-loader pages; generated portable artifacts do not justify keeping redundant scripts inside site components. Local development references remain local.
6. Verify the Webflow draft/Preview with redundant component scripts removed: page-all-lite must detect and animate the affected components through the page-settings shared loader. Read component code back to confirm no redundant feature script or inline runtime remains. **For middle, stop here:** confirm the saved settings by reading them back, record previous/new URLs and the full release SHA, and hand off to the user for publication. Do not select domains, publish, or claim live-site verification; domain selection is not needed to finish middle. For staging/production, inspect the publish target selection. Publish only the requested staging or production domains. Account for other pending site drafts: inspect publication scope and do not knowingly publish unrelated changes; surface unavoidable unrelated publication before proceeding.
7. For staging/production, inspect actual published HTML on each selected domain, including the footer and page-specific overrides. Confirm the exact expected SHA, no stale override or duplicate shared loader, successful module/CSS loads without CORS errors, changed interaction, Product Variety wallet swap, and Country Flags wherever present. Check desktop/mobile and reduced motion where relevant. Preview-only success is insufficient.
8. Record domain-by-domain results and previous/new URLs in [release records](../releases/README.md). If verification fails, report failure rather than success; restore matching loaders together using the previous verified immutable release when authorized for that destination.

Webflow draft settings are shared configuration. A staging publish does not create an independent production draft configuration: record known currently served releases separately from the saved middle/draft SHA, and re-read settings before every later publish. Never describe saved draft settings as already served on production.

Completion reports must use one of: **saved locally**, **saved to Webflow (draft)**, **middle saved — ready for user publication**, **published to staging and verified**, or **published to production and verified**. Include the full release SHA and saved loader verification for middle; explicitly state that the user publishes next and live-site verification is pending. Include the release SHA and selected domains for publication. If verification/access fails, state what completed and what remains blocked.
