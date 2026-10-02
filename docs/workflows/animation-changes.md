# Animation changes

Inputs: component name or Figma selection, desired behavior, effect names, completion stage.

1. Find the component in [component index](../components/index.md) and reusable behavior in [effect catalog](../effects/index.md). Read only matching notes and source.
2. Follow [motion defaults](motion-defaults.md): Global Styles primary easing for movement/non-opacity properties, linear for opacity, and global duration tokens unless explicitly overridden. Reuse existing behavior before adding a helper. Preserve existing folders: src/animations, src/embeds, and src/lib/effects. Legacy files remain read-only references.
3. For illustration motion, first follow [illustration creation](illustration-creation.md): static Figma fallback, parent-relative sizing, native Webflow styles and scoped component CSS. Animate only when requested. Animation modules expose init(root = document) and return cleanup. Follow the surrounding embed's mounting convention; support repeated instances and guard repeated initialization. Use the stage controller for visibility clocks/reduced motion where appropriate.
4. Keep local preview CSS local. For new/revisited Webflow illustrations, apply styles natively or in a scoped in-component style embed; do not deploy preview CSS or rely on external motion CSS for the static design. For other runtime modules, import required structural CSS explicitly. Register new shared features in both page entries and the multi-entry build; add an embed builder only if that delivery needs it.
5. Document selectors, CSS dependencies, options, transform ownership, preview, and cleanup in component notes. Durable decisions belong there, not only in chat.

Verification: run relevant behavior tests; check desktop/mobile, two instances, repeated initialization/cleanup, reduced motion, resize, offscreen and hidden-tab behavior. Full release validation is separate.

Completion: local preview by default. Report changed behavior and verification; use [handoff notes](../prompt-guide.md) for unfinished work.
