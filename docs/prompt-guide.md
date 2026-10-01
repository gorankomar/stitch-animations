# Short prompts and handoffs

Use a component name or Figma link, desired result, effect names, and completion stage. Project instructions provide the process.

- “Implement this Figma selection: [link]. Use Reveal and Card Hover. Local preview.”
- “Update Country Flags with this behavior: [description]. Save a Webflow draft.”
- “Release the approved changes to [domain]. Follow the shared-release workflow.”

Keep one chat per coherent feature or release. Continue small refinements in that chat. For unfinished work, create a short task note under docs/tasks/<task>.md with: goal, links/component, accepted decisions, branch/commit and actual working state, verification performed, remaining work, and requested completion stage. Never include credentials. Read live repository state again when resuming.

Completed decisions move to component notes; publication evidence moves to release records. Keep ordinary workflows as documents; add custom skills only when repeated use justifies them.
