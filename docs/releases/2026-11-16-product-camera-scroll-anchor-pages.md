# Product layout lab scroll isolation — 2026-11-16

User applied `overflow-anchor: none` to the native Real AI product camera holder in Webflow and confirmed the page movement stopped. Requested matching local source, GitHub merge and publication of the GitHub Pages lab only. No Webflow changes were made by the agent.

PR #101 merged as `8dc0104ad43eadea8eaad1135d2a976b3c94a2a5`: `.study-stage` opts out of scroll anchoring, and local camera style source mirrors the user-applied native parent property. No camera JavaScript or shared generated artifacts changed. Pages build and 66 relevant camera/layout/icon tests passed.

[Pages workflow 43884759913](https://github.com/gorankomar/stitch-animations/actions/runs/43884759913) completed successfully. Public lab serves `productLab-BEmW_WGp.css` with the opt-out. Browser computed overflow-anchor is `none` on both camera stages. Verified with study 04 partly above the viewport (top -520.5px, height 650px) and study 05 visible below: 620 sampled observations over ~31.2 seconds recorded scrollTop fixed at 3239.5px and document height fixed at 4285px, including 278 distinct camera poses. No page movement occurred during the check.

Public URL: https://gorankomar.github.io/stitch-animations/relayer/product-layout-lab/

No production channel promotion or Webflow page/site publication was requested or performed. The normal main push may advance staging automatically; production is unchanged. This documentation-only evidence commit skips CI to avoid another metadata-only deployment.
