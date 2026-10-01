# Effect catalog

Prompt names select these canonical implementations. Paths are repository-relative. Read only the selected helper and its current consumer before composing it. Follow [motion defaults](../workflows/motion-defaults.md) for new/revisited behavior; existing hardcoded easings are not the project default.

| Prompt name | Source under src/lib/effects/ | Contract and example |
| --- | --- | --- |
| Reveal | reveal-groups.js | createRevealController({root}); ensure() starts; cancel()/reset() clear work. data-reveal children, optional nested data-reveal-group. Requires entrance styles in global.css. |
| Card Hover | card-lift.css | Import CSS; add data-card-lift. Tune --card-lift-distance / --card-lift-shadow. Fine-pointer hover and reduced-motion support; no JS cleanup. |
| Pointer Follow | follow-group.js | createFollowGroup({root}) returns disposer. data-follow-mouse children; data-follow-depth layers, data-strength responsiveness, data-max-offset travel in px, data-axis x/y/both. Caller gates visibility/reduced motion. |
| Visibility Trigger | threshold.js | whenVisible(target, setup, options); setup returns cleanup. data-visibility-threshold defaults to 0.25. |
| Animation Stage | animation-stage.js | stageInitializer / animateStage provide per-instance lifecycle and visibility clocks. Country Flags and connectors are examples. |
| Code Scroll | code-scroll.js | createCodeScrollEffect(track, options): render/showAll/dispose; caller owns clock. Consumer supplies CSS, including code-scroll.css where required. [API](../code-scroll.md). |
| Connectors / Pulses | connector.js and connector.css | Measured paths, pulse bands, dot fill; stage owns clock/cleanup. [Guide](../connector-animations.md). |
| Wallet Swap | wallet-swap.js | createWalletSwap(root): setEnabled/dispose; Product Variety blue/gray children and its CSS geometry. |
| Stacked Windows | stacked-windows.js | createStackedWindowsController(wrap) returns disposer; stacked-windows_position / stacked-windows_img-wrap. Options in recipes. |
| Zoom Lens | zoom-lens.js | initZoomLenses(root) returns disposer; data-zoom-lens=true with size/scale/border/target options. |
| Press Ripple | press-ripple.js | Shared press class behavior; reuse API consumer markup and ripple CSS. |
| Glow Sweep | glow-sweep.js | Template-driven sweeps; API/orbit consumers supply markup and cleanup examples. |
| Value Counter | value-counter.js | Shared timing/formatting; chart/window-graphic consumers supply examples. |
| Dots / Bulge Dots | dots-field.js / dots-field-bulge.js | Distinct subtle and displacement effects; use corresponding animation markup/CSS. |
| Repel Float | repel-float.js | Shared repulsion/idle movement; inspect consumer and cleanup API. |

## Minimal composition

```html
<section data-anim="hero">
  <div data-reveal-group>
    <div data-reveal><div data-card-lift>Card</div></div>
  </div>
</section>
```

The shared loader mounts Reveal on data-anim sections. Import card-lift.css through the owning entry. Separate wrappers prevent transform conflicts. Custom embeds may mount Reveal explicitly; do not mount both systems on the same targets.

Pointer Follow's data-follow-root is a consumer convention, not automatic mounting by the helper. Attribute presence enables followers: data-follow-mouse=false still matches. Call the returned disposer at teardown.

See [animation recipes](../animation-recipes.md) for detailed markup and tuning. Add new reusable effects here with their contract, CSS, options, example consumer, and cleanup.
