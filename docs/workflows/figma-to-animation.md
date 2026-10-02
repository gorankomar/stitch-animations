# Figma to illustration or animation

Start with [illustration creation](illustration-creation.md). A Figma illustration request defaults to a static, fluid, aspect-ratio-preserving Webflow draft. Animation is opt-in. Native Webflow styling plus scoped in-component CSS must render the supplied Figma appearance even if motion code fails.

1. Inspect the supplied selection using the Figma design-to-code skill and existing component notes.
2. Follow [SVG handling](svg-handling.md) for vectors and delivery choice.
3. Create and verify the static Webflow composition using the illustration procedure.
4. Only if animation is requested, consult the [effect catalog](../effects/index.md) and [animation changes](animation-changes.md); preserve the static fallback and style ownership.
5. Complete the requested [saving/publishing stage](publishing.md), with Webflow draft as the default for illustration creation. Record durable facts in component notes.
