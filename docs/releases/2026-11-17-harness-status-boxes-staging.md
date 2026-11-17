# Translation-safe Harness status boxes

Correction to the Harness localization release: native status containers are Block divs, with `harness-step` as their main class and `data-harness-step`. Existing managed images, completed label spans and hidden pending spans were moved into the divs as direct siblings. Existing label IDs are retained; completed spans contain text only. No elements were deleted. Component-local selectors were narrowed to direct pill containers so text spans do not receive pill styles.

Runtime supports the new boxes and older span-based markup. Full shared distribution rebuilt from main `fe2e681a22556b6b4c38cd0ffa59ea49e8b12381`. Staging activation follows merge via the existing main workflow. User requested no further local tests or browser Preview. Native reusable component draft saved; translations remain user-owned. No Webflow page/site publication, production promotion or permanent loader changes.

General container rule recorded in AGENTS.md and the Webflow structure workflow: plain divs contain mixed UI; translatable text elements contain text only.
