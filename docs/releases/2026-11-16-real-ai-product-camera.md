# Real AI product camera — 2026-11-16

User authorized: new Real AI product camera component using layout-lab version 05, replace only the Real AI page instance, merge all pending repository changes including other chats, and publish to both staging and production.

Webflow component `ab08d931-9bbf-9677-8c22-3d9bdf181830`; page `6af2c4b2616c8b948cbb3006` (`/ai`); new instance `ffeb4c11-a71a-8359-a3c3-e1292cc12061`. Original product screen definition remains intact with its other instances. Playground `6ab4079ac7ca32e3a6c168c8` verified draft before integration; never publish it.

Production domains inspected: www.stitch.co, stitch.co, www.stitch.sa, stitch.sa. Promotion affects animations on all four production hosts; page publication is scoped to Real AI where supported. Permanent router URLs remain unchanged. Staging verification must precede promotion of the exact same SHA through the protected production environment.

Validation / deployment evidence will be appended after the build and deployment complete.

Full release validation passed: 243 tests, all shared entries/embeds, dependency closure, Product Variety/wallet swap and Country Flags. Pending RTL dropdown flag spacing source and notes were retained and merged with current main, together with layout-lab workflow/config/source/tests and native camera integration. Fresh full-build distribution files are included.

Pre-release production pointer: `3cc5d85752380f2988181b7a8e6f04c8e914cfb4`. Pre-release staging pointer: `e198d428fb171a10a438c1ab6649c3106aa14370`. Published `/ai` router selects staging/production by hostname and is unchanged.

## Staging verified; Webflow drafts retained

Final animation release: `d49fe61d0ed330382cbbc1e3a919b43ba055865b` (PR #96, after combined PR #95). Full validation passed again: **244 tests**, complete build and shared dependency checks. Staging workflow [43875305816](https://github.com/gorankomar/stitch-animations/actions/runs/43875305816) succeeded; the served staging pointer imports that exact SHA. Initial combined release `1b3a483aa866c71ed7f0199e62d89a322a39d511` also deployed successfully; Preview caught the native localized-placeholder binding difference and the final release fixes it.

Webflow Preview verified the native camera with custom code enabled and the permanent staging router. Confirmed correct individual field placeholders, flat plane transform, active orange single-trail outline, working shadow and sparkle. All component images loaded. Phone Preview at 393px: 345×345 frame, prompt within ~20.7px side insets and ~10.35px bottom inset; desktop restored after checking. Live Global Styles resolved primary `cubic-bezier(.11, .61, .27, .99)` and default `770ms`.

Original LP Solution Product Screen definition remains with **2 instances**; the new camera definition has **1 Real AI instance**. No loader URLs changed.

Single-page publication returned Webflow 400 “Invalid parameter: pageId.” Audit of all 55 pages found only Real AI updated since the last full-site publication. Full-site publication was blocked by automatic approval review. User then explicitly selected **Keep Webflow changes as draft**. No staging or production Webflow publication occurred. Animations Playground remains draft; never publish it.

## Protected production promotion

Requested exact staging-verified SHA `d49fe61d0ed330382cbbc1e3a919b43ba055865b` through workflow_dispatch: operation `promote`, channel `production`, ref `main`. [Workflow 43875711480](https://github.com/gorankomar/stitch-animations/actions/runs/43875711480) is waiting for required Production environment review by gorankomar at recording time. Do not approve on the user's behalf or weaken environment protection. Production remains at its prior verified SHA until that workflow completes. This promotion does not publish Webflow drafts.

This evidence-only commit changes no animation bundle. Main's all-push staging workflow may subsequently advance staging to a documentation-only SHA with identical runtime code; the explicit production target remains the exact visually verified animation release above. This deliberate metadata-only difference does not authorize a different production animation build.
