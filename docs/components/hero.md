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


### Responsive Content Hero component (2026-10-14)

User-created **Content Hero** definition `8c0f6e81-87c9-df86-0145-f6233e5277e4` contains the grid embed `8c0f6e81-87c9-df86-0145-f6233e5277f5`. Responsive updates were saved inside that definition, not on the old page-level embed. Preserve its text/link props and early Reveal attributes.

At <=991px the background fills the hero height rather than shrinking to the desktop aspect ratio. Rows occupy 64px at rest and 48px at exit, fitting within native hero padding and keeping wrapping text clear. Rails move to the outer edges. Tablet/landscape cells tighten from 16.6667% to 14.2857% (six to seven); <=479px uses 25% to 20% (four to five). Desktop retains the user's 14% resting spacing and 10% exit spacing. Opacity remains .18. The user changed row easing to linear; rail easing now matches that preference so borders stay joined. Static and reduced-motion layouts share the same responsive rest values.

Designer verified 320px (272px hero width, 541.78px artwork height, 381.78px content), 393px (343px artwork width, 474.59px height, 314.59px content), and 820px (738px hero width, 639px artwork height). Mobile text has 80px top/bottom clearance versus 64px grid rows. Tablet exit sample had matched row/rail sizes approximately 62.45px and tightening cell width 16.4362%. Desktop breakpoint restored afterward. Component draft and local source saved; no publication or release for this responsive change.


Responsive band refinement: clear center holds only title + paragraph; eyebrow and CTA sit in grid rows, matching desktop composition. At <=767px the top/bottom rest rows are 116px/134px, shrinking to 100px/118px on exit. At tablet widths they use 32.5%/35%, shrinking to 29.5%/32%. Separate top/bottom animation tracks keep their matching rail boundaries joined. At 393px verified title starts at 121px versus 116px upper boundary; paragraph ends at 334.59px versus 340.59px lower boundary. At 820px verified title starts at 213.60px versus 207.67px upper boundary; paragraph ends at 408.40px versus 415.35px lower boundary. These replace the prior 64px/48px row settings. Component draft and source saved; opacity .18 retained; no publication.


### Native grid structure (2026-10-14)

Converted the grid markup to native Webflow Blocks inside Content Hero. Wrapper `986edb31-51c3-c60f-7bb8-fa2b3e223c1d` is named **Content Hero Grid — Native** and carries `aria-hidden=true`. Classes own absolute geometry, max width/aspect ratio, centering, border color/stroke, line gradient and background sizing. Medium breakpoint height 100% / aspect-ratio auto is saved natively through the Style API. Existing embed `8c0f6e81-87c9-df86-0145-f6233e5277f5` is now **Content Hero Grid — Mask & Scroll CSS**: only style content, no artwork HTML. Custom properties, mask, responsive tuning and scroll keyframes remain there. Component text/link props and Reveal attributes are preserved.

Local source is split into `src/embeds/content-hero/grid-markup.html` (native hierarchy reference), `grid-native.css` (native class/breakpoint properties), and `grid-background.html` (special style-only embed). Do not paste the markup reference alongside the existing native artwork or it will duplicate the grid. Native borders retain .18 opacity. If changing line color later, update both native border colors and the embed's gradient color variable.

Verified one artwork hierarchy, unchanged desktop 1120 × 468 geometry, tablet 639px height with 207.67px/223.65px rows, and mobile 474.59px height with 116px/134px rows. Mobile exit sample showed matching top row/rail ~112px, bottom row/rail ~130px, and cell width tightening to 23.75%. The rail keyframe now starts from the separate responsive top/bottom values, preventing a breakpoint-specific seam. Saved component draft and local references only; no publication.
