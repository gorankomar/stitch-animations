# Product animation localized copy — staging

User authorized Webflow draft edits, GitHub push/merge and staging activation only. No Webflow publication or production activation.

Based on origin/main f1b6808. The reusable LP Solution Product Screen has one hidden native text group directly inside Product Bar (a7ef86ee-c9fc-5aac-d0fb-89508fd52f95). Eleven text children supply the idle/working title, typed request, lock placeholder/working value and six generated-field placeholders. Completion and final values reuse existing localized native text. New strings need translation in the secondary locales; existing translations are preserved.

Validation: npm run validate:release passed 230 tests, full shared build and Product Variety/wallet swap + Country Flags dependency checks. Includes legacy markup fallback and localized Unicode playback/cleanup/reinitialization/reduced-motion fixtures. Staging activation and Webflow Preview verified below.

## Verified release

- PR #84 merged as `60d3324cf8ab1fafb6cf259075c6a7dcb9e4e499`. Workflow [43508920289](https://github.com/gorankomar/stitch-animations/actions/runs/43508920289) succeeded, including complete upload/CDN checksum/CORS verification and staging activation/invalidation.
- Staging served that SHA with HTTP 200, JavaScript MIME and `no-cache,max-age=0,must-revalidate`. Deployed `feature-real-ai-product.js` contains the native copy lookup. Previous staging and unchanged production: `f1b6808879850652077701bf1c14f7a884e97a94`.
- Real AI Designer custom-code Preview used the permanent staging loader. All eleven text entries were present in Preview HTML; the source computed to `display:none` and had no layout impact. Desktop playback reached completion with original title/prompt restored; 393px mobile preserved the scaled product/bar appearance. Desktop breakpoint restored afterward.
- Localization behavior is covered by Unicode test fixtures, not a claim that all new locale strings have been translated. Translate the newly added copy using Webflow in each secondary locale. Existing localized visible text remains its source.
- Webflow component changes saved as draft only. No page/site publication and no production promotion. Animations Playground remains a draft; no loader URLs changed.
- Follow-up documentation-only merge carries identical validated animation artifacts; its automatic staging deployment may advance the SHA without changing runtime bytes.
