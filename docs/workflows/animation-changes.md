# Animation changes

Inputs: component name or Figma selection, desired behavior, effect names, completion stage.

1. Find the component in [component index](../components/index.md) and reusable behavior in [effect catalog](../effects/index.md). Read only matching notes and source.
2. Reuse existing behavior before adding a helper. Preserve existing folders: src/animations, src/embeds, and src/lib/effects. Legacy files remain read-only references.
3. Animation modules expose init(root = document) and return cleanup. Follow the surrounding embed's mounting convention; support repeated instances and guard repeated initialization. Use the stage controller for visibility clocks/reduced motion where appropriate.
4. Import structural CSS explicitly. Register new shared features in both page entries and the multi-entry build; add an embed builder only if that delivery needs it.
5. Document selectors, CSS dependencies, options, transform ownership, preview, and cleanup in component notes. Durable decisions belong there, not only in chat.

Verification: run relevant behavior tests; check desktop/mobile, two instances, repeated initialization/cleanup, reduced motion, resize, offscreen and hidden-tab behavior. Full release validation is separate.

Completion: local preview by default. Report changed behavior and verification; use [handoff notes](../prompt-guide.md) for unfinished work.
