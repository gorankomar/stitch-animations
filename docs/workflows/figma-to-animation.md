# Figma to animation

Inputs: Figma selection URL, desired motion, named effects, and requested completion stage.

1. Read the Figma design-to-code skill before requesting design context. Inspect the supplied node, dimensions, layers, assets, and screenshot; inspect an existing component when changing one.
2. Read [SVG handling](svg-handling.md) for vector assets and the [effect catalog](../effects/index.md) for named effects. Preserve visual structure unless the request changes it.
3. Follow [animation changes](animation-changes.md). Keep layout/native Webflow styling separate from structural motion styles. Store original assets beside the existing component assets.
4. Add the Figma URL/node, preview route, source paths, selectors, effects, and tunable options to component notes. Unknown references stay explicitly unknown.
5. Compare the local result with Figma at desktop and 393px mobile. Check asset loading, overflow, multiple instances, reduced motion, and offscreen/hidden-tab behavior.

Completion: local implementation and verified preview by default. Report visual differences or unavailable reference access. Use [Webflow integration](webflow-integration.md) only when requested.
