# Future Builds

This file tracks documentation and productization work that should happen later, without forcing runtime or API changes right now.

## Webflow Option Docs

Document the shared data attributes in a Webflow-friendly way, with short tooltip copy and practical examples.

Scope:
- `data-follow-mouse`
- `data-follow-depth`
- `data-strength`
- `data-max-offset`
- `data-axis`
- `data-visibility-threshold`
- any animation-specific tuning attributes that become user-facing

Planned output:
- concise tooltip copy for each attribute
- plain-language "what this does" descriptions
- recommended value ranges where appropriate
- example combinations such as subtle / medium / strong

## Follow Toggle Behavior

Evaluate whether `data-follow-mouse` should remain presence-only or support explicit string values in Webflow.

Current behavior:
- the effect is enabled whenever `[data-follow-mouse]` exists
- `data-follow-mouse="false"` still counts as enabled because the selector only checks for attribute presence

Potential future change:
- support `data-follow-mouse="false"` as disabled
- keep empty / `true` as enabled
- document the exact rule in README and Webflow tooltips

## README Improvements

Expand the shared effect docs so the authoring contract is clearer for client handoff.

Candidates:
- clarify that `data-follow-depth` is relative layering, not absolute raw z-index strength
- clarify that `data-strength` controls responsiveness, not travel distance
- clarify that `data-max-offset` controls travel distance in pixels
- add a note that follower behavior can be tuned per element with explicit overrides
- add a Webflow section covering presence-only attributes vs value-based attributes

## Small Cards Follow-up

When revisiting the small-cards component:
- verify the animation remains variant-agnostic when Webflow swaps final transforms/arrow rotation
- consider deriving arc direction from measured target position instead of DOM index
- document the minimal markup contract for standalone Webflow embeds
- document which visual styles are expected to come from Webflow rather than exported CSS
