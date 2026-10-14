# Homepage Hero — stacked windows

## Content hero CSS background (2026-10-14)

Playground's `data-anim="content-hero"` now has a style-only **Content Hero — CSS Grid Background** embed (`7bcc6ce2-3999-b455-b62b-fe4beb21bac8`). Source: `src/embeds/content-hero/grid-background.html`. The embed wrapper carries `content-hero-grid-embed`; its absolute positioning avoids changing hero layout. The Figma reference `490:1668` defines eight columns with approximately 140px square rows above/below a 190px clear center. Horizontal borders remain at the center boundaries; only the two outer-column rails continue through the middle. A transparent radial mask matches the 560 × 412.5 ellipse radii of the 1120 × 468 artwork. All geometry scales proportionally with width. No background fills are added. User-approved line opacity is .18 and remains fixed during motion. The separate `content-hero-grid__plane` can receive future motion without moving the mask.

The original `header_inner-bg-image` (`71e47053-f692-e1c9-9f34-0ca8511bd4f5`, Grid (2).png) is hidden on this Playground instance and retained for reference. No shared class, component definition, reveal settings or loader was changed. Saved as a Playground draft only; no publication or animation release.

`data-anim="hero"` selects the homepage hero with left-hand Reveal targets and three overlapping screenshots. `data-anim="content-hero"` is the separate text/content header: it uses automatic Reveal groups without loading the homepage stack module. The user moved the homepage hero to the top of Playground and moved `data-reveal-start="early"` to that hero on 2026-10-14. Preserve these choices.

## Static content first

The final composition is CSS-owned. `src/animations/hero/styles.css` is the canonical stylesheet; the full build generates `dist/embeds/hero-stack-styles.html` through `scripts/build-hero-styles.mjs`. Save it in the existing CSS embed inside `.stacked-windows_wrap`. Its static geometry and image visibility must be present in Webflow markup independently of the downloaded animation module. Do not move this into Global Styles or rely only on an external feature stylesheet.

- `.stacked-windows_skew` retains the existing 8deg skew.
- First `.stacked-windows_position` is relative and supplies the deck's height; subsequent siblings are absolute at bottom 0. They do not accumulate vertical document flow.
- Desktop: front offset 0/0, subsequent positions +5% X / −19% Y per index; depths 0, −2px, −3px. Mobile <=991px: anchor Y 38%, subsequent +10% X / −19% Y. Existing width, min-width, border, blur, corner radius and shadow are preserved.
- Static CSS indexes the first eight positions. The existing layout helper still supports arbitrary counts and custom layouts through inline variables when present; the shipped hero has three screenshots.
- Image pixels have opacity 1 by default. The child images never wait for `is-inview` to become visible. Only the canonical Reveal wrappers are hidden/moved after successful setup. Unready wrappers show their final static transform and opacity.
- Default background, border and shadow are the final visual state. No JavaScript is needed to make them appear.

The previous code had unconditional `img {opacity:0}` and applied the static overlap selectors only in `html.wf-design-mode`. Preview without scripts consequently showed hidden images occupying multiple in-flow rows. Both dependencies are removed.

## Motion and lifecycle

`src/animations/hero/index.js` initializes each hero independently, guards repeated mounts and returns cleanup. `src/lib/effects/hero-stack.js` reuses the grouped Reveal controller and stacked-windows layout helper. No separate image entrance clock or double image stagger is added. Hover enhancement becomes ready 50ms after the remaining canonical Reveal schedule finishes. It cannot change the parent's overlap geometry.

Early sections initialize immediately, sharing the existing page-head bootstrap and cached Reveal controller; normal sections initialize through the visibility helper. Missing/expired early setup leaves the hero static and does not activate hover readiness. Do not replay an entrance when reduced motion is subsequently turned off: content is already visible.

Reduced motion bypasses grouped entrance setup; the hero's CSS keeps every Reveal target visible at rest and disables target transitions. An OS preference change to reduce cancels pending readiness and Reveal work. Screenshot position transforms remain: they express the static arrangement, not animation. Cleanup removes runtime classes, timers, media listeners and inline layout overrides, leaving the same CSS-only static composition. Partial setup failures perform the same cleanup.

Movement/fades retain live `--motion-ease-primary`, `--reveal-duration-default`, `--reveal-stagger-default`, and `--reveal-opacity-ratio`. The screenshot wrapper's existing `data-reveal-offset="120%"`, `data-reveal-duration="1400ms"`, `data-reveal-stagger="100ms"` remain unchanged. Opacity is linear.

## Playground draft

### Reusable hero component (2026-10-14)

The first Playground `header84_component.homepage` is now **Header 84 — Homepage Hero** (`5e6457b6-28df-80d3-bdb8-d0a8ba8dc789`). Its instance exposes Title, Paragraph, Button text, and the existing button Link. The `Slot` inside `stacked-windows_skew` is the stacked windows queue; the Playground instance contains three **Stacked Window** instances (`c09bceb0-226a-c6de-24f5-11a0fc6b9a28`). Each window retains `stacked-windows_position`, its Reveal wrapper and image styling, and exposes an Image property. The three images remain Dashboard, Ledgers and Loans, in that order. Populate this slot when inserting a new hero instance; its definition has no default slot content. Old hero-level image properties were removed in favor of each window's Image property.

Saved as a Webflow draft only. Desktop appearance and instance properties/slot contents were verified after reloading Designer. Existing static CSS, motion attributes and loaders were retained. No animation release or Webflow publication was performed.

Site `6823036cd77b3093eaf9154d`, Playground `6ab4079ac7ca32e3a6c168c8`. Homepage hero element `a2918514-06c5-67bc-5c99-7cbddfb14a0c`; CSS embed `a2918514-06c5-67bc-5c99-7cbddfb14a27`. Only that visible style embed is updated; hidden legacy reference embeds, Global Styles, native artwork, head bootstrap and permanent footer routers stay untouched. Playground remains a draft; production publication is deferred by the user.

Verify Preview with custom code enabled and disabled, desktop/mobile static positions and equal total height between those states, the early timeout fallback, reduced motion and two instances. `tests/hero-stack.test.js` covers independent instance state, readiness timing, reduced motion and cleanup. Browser static-layout checks must complement lifecycle tests.


### Content grid exit scroll motion

The same style embed uses native CSS view timelines, scoped to the content hero. `exit 0%` begins when the hero top leaves the viewport; no entry motion is applied. Both row heights shrink from 29.8077% to 23.8077% while the center rails expand by matching top/bottom insets. This increases the clear center by 56.16px at full artwork size, tightening horizontal cells from eight to ten columns while preserving stroke color, outer size and fade mask. Reverse scroll restores the original geometry. Movement uses the live `--motion-ease-primary` (verified cubic-bezier(.11, .61, .27, .99)); duration is scroll-owned, so the CSS 1s is a nominal animation duration rather than a wall-clock transition. Reduced motion and browsers without view-timeline support retain the static grid. No JavaScript, compiled module or channel release is needed.

Designer verification: fully visible hero retained 139.5px rows; at hero top −126px rows compressed to 121.922px; at −427px rows were 112.484px with matching rail insets. Reverse scroll restored the intermediate geometry. Saved Playground draft only.

Horizontal density animates background-size from 12.5% to `--content-grid-exit-cell` (10% by default). Lower percentages increase density; 12.5% disables horizontal tightening. The center side rails retain their original horizontal positions.
