# Short prompts and handoffs

Use a component name or Figma link, desired result, effect names, and completion stage. Project instructions provide the process.

- “Create this illustration in Webflow: [Figma link].” (Static, fluid, saved draft.)
- “Create this illustration: [Figma link]. Animate with Reveal and Card Hover.” (Same static fallback, requested motion, saved Webflow draft.)
- “Implement this Figma selection: [link]. Use Reveal and Card Hover. Local preview.”
- “Update Country Flags with this behavior: [description]. Save a Webflow draft.”
- “Save these changes locally.”
- “Save these changes to Webflow.”
- “Publish these changes to staging.”
- “Publish these changes to production.”

Stages and loader updates follow [saving and publishing](workflows/publishing.md). When domains are known and unambiguous, these short prompts are sufficient; otherwise the agent asks for the missing target. Publishing automatically includes the site-wide footer SHA update and synchronization of preview/component loaders. jsDelivr is the active source while S3/CloudFront CORS awaits the admin fix.

Keep one chat per coherent feature or release. Continue small refinements in that chat. For unfinished work, create a short task note under docs/tasks/<task>.md with: goal, links/component, accepted decisions, branch/commit and actual working state, verification performed, remaining work, and requested completion stage. Never include credentials. Read live repository state again when resuming.

Completed decisions move to component notes; publication evidence moves to release records. Keep ordinary workflows as documents; add custom skills only when repeated use justifies them.
