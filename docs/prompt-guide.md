# Short prompts and handoffs

Use a component name or Figma link, desired result, effect names, and one of the two normal release commands. Project instructions supply the process.

- “Create this illustration in Webflow: [Figma link].” (Static, fluid, saved draft; no publication implied.)
- “Create this illustration: [Figma link]. Animate with Reveal and Card Hover.” (Static fallback, requested motion, saved Webflow draft.)
- “Implement this Figma selection: [link]. Use Reveal and Card Hover. Local preview.”
- “Test this in the Animations Playground.” (Preparation; establish staging scope if new JavaScript must be released.)
- “Publish these changes to staging.”
- “Publish these changes to production.”

Normal workflow: Figma → saved Webflow draft/Playground → staging → production. Local experiments remain available. Explicit “save locally”, “save a Webflow draft”, “do not publish” and “I'll publish” constraints are still honored. “Middle” is retired as a normal stage; old middle requests mean staging animation preparation and saved drafts, stopping before Webflow publication or production promotion.

Follow [publishing](workflows/publishing.md). The agent handles necessary release preparation, merge/upload, destination activation, required Webflow publication and verification. Permanent channel routers eliminate routine Webflow SHA edits. Production promotes the exact verified staging animation release and needs the protected GitHub review; it does not rebuild a different release. Animation-only changes need no Webflow publish; page-only changes can reuse an existing verified release.

“Push and merge everything we changed in this chat” includes all approved source, assets, effects, documentation, instructions, tests and fresh outputs. Main activates staging automatically; production and Webflow publication need their own authorization. Preserve unrelated work.

Keep one chat per coherent feature/release. For unfinished work, create a short note under docs/tasks/<task>.md with goal, links/component, accepted decisions, actual branch/commit/working state, verification, remaining work and requested destination. Never include credentials. Read live repository state again when resuming. Completed decisions move to component notes; publication evidence moves to release records.
