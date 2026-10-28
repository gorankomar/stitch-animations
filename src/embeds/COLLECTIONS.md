# Collections — Window Stack

Webflow component: **Animations → Collections — Window Stack**, ID
`88e6f662-b5ee-3682-da72-a4d510d4cfc9`. Two existing instances share this
updated definition. The Playground instance remains a draft beside Financial
Architecture. The staging animation channel was activated on 2026-10-28; see the release
record below. Webflow staging publication was completed after the user
approved publishing all pending non-draft changes. Production is unchanged.

Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=256-12908
Reference card `256:12907`; graphic `256:12908`, **258 × 232**.

## Native illustration (2026-10-28)

Both raster windows were replaced inside the existing component definition.
Titles, labels, select display, comments display, upload copy, PDF hint and
Cancel/Confirm labels are native editable Webflow text. These are illustrative
UI displays, not an operational upload or collection form. No images remain
inside the graphic. Original PNGs in `assets/collections/` remain reference only.

- Attach document: 288 × approximately 201, at (73, 71).
- Reassign collection record: 289 × approximately 244, at (24, 23).
- Windows use intrinsic height with proportional minimum heights so longer copy
  can wrap and grow; the original illustration intentionally clips the windows
  at the frame edges and applies right/bottom white fades.
- Body font is inherited from Webflow (`Abcdiatype, Arial, sans-serif` for EN).
- Layout, typography, colors, shadows, query containment, aspect ratio and
  static transforms are native Webflow styles. `collections-graphic_window`
  remains the main window class. Object classes precede the shared
  `collections-radius-6` utility; its proportional radius is defined once.
- Existing **Icon - Chevron Down** is reused without internal overrides.
  **Icons → Upload Cloud** (`d851a97b-672b-2073-661d-16b3045d78e9`) contains
  the cloud vector recreated from the bitmap. Its viewport scales the glyph
  within the native upload icon holder; currentColor supplies its stroke.
- Structure: frame/query container; two window surfaces, each with title,
  content and action row; two fade blocks; separate motion and style embeds.
  Content groups own field/upload layout; icon holders own icon alignment.
- `collections-scoped-style.html` is the only style exception: direction-aware
  selectors mirror window placement and the side fade for RTL. It lives in a
  separate style-only HtmlEmbed (`7b0089a5-e80b-f063-0cd1-9f7bddc0c601`).
  Static appearance never depends on JavaScript or downloaded CSS.

Local reference markup: `collections-windows-markup.html`; local styles:
`collections-graphic.css` and `collections-windows-native.css`. These CSS files
are preview references only, not deployed CSS dependencies. Webflow's native
styles are authoritative. Local preview: `/collections-native-preview.html`
with 180, 258 and 540px parents, static/replay and long-copy/RTL controls.
The older `/collections.html` three-card demo is separate and unchanged.

## Motion and shared delivery

Source: `collections-graphic.js`; selectors `[data-collections-graphic]` and
`[data-collections-window]`. The two windows remain in Attach/Reassign DOM
order. `[data-collections-kind]` identifies their content. Motion owns only
transient transform, opacity, z-index and `data-collections-state`.

Original choreography/timings are explicitly retained per user request:
900ms upward reveals, 100ms stagger, 1600ms initial hold, 850ms bottom-right
exit/front advance, 550ms rear return, then 3500ms holds. Non-opacity movement
reads the exact Global Styles `--motion-ease-primary` at setup; opacity uses
linear progress. Live token inspected: `cubic-bezier(.11, .61, .27, .99)`.
Live default/fast duration tokens are 770ms and calc(default × .6); this
component's preserved choreography is an explicit timing exception. RTL exits
bottom-left and mirrors stack offsets while leaving text unmirrored.

Animation Stage supplies the 25% visibility clock, offscreen/hidden-tab pause,
resize and reduced-motion handling. Static Figma layout stays visible until
setup succeeds and the stage becomes visible. Reduced motion, setup/render
failure and disposal restore original inline styles. Returning from reduced
motion restarts the entrance. A Symbol-based shared mount registry prevents
both temporary and shared bundles starting duplicate clocks.

Both `page-all.js` and `page-all-lite.js` now mount this graphic, independently
of the old `[data-anim="collections"]` demo. The shared build also emits
`feature-collections-graphic.js`. No runtime CSS import is required.

**Former temporary Playground test runtime:** HtmlEmbed
`88e6f662-b5ee-3682-da72-a4d510d4cfce` previously contained standalone motion
built by `node scripts/build-collections-embed.mjs` into
`dist/embeds/collections-graphic.html`. It was removed after staging release
`a2bb18cfa2215922e1c35091a59f2ab201a89fd9` was served and verified. The
style-only RTL embed, native markup and permanent router remain. No loader
URLs were changed. Both Playground Preview and published pages now use the
shared loader for this graphic after Webflow publication.

## Verification

- Webflow Designer static rendering visually compared to the Figma target;
  Preview ran entrance and both front-window states with zero raster images.
- Webflow desktop (630px graphic) and mobile (345px graphic) preserve 258:232
  aspect ratio and proportional text. Native shared radius verified on all
  fields, upload panel/icon and action displays; Base is the only variant.
- Custom code disabled in Webflow Preview: both windows remain fully styled
  and visible, with no inline motion transforms or opacity hiding.
- Local simultaneous 180/258/540px parents checked; design-size title is 13.3px.
  Longer copy grows intrinsically without internal horizontal overflow; RTL
  placement/fade is mirrored. Actual secondary-locale copy was not changed.
- Six focused sampling/lifecycle tests cover choreography, linear opacity,
  invisible recycling, alternating order, duplicate mount, offscreen/hidden
  pause, reduced motion, cleanup/remount and render-failure restoration.
- Full build and all 209 tests pass. Shared release checker passes, including
  Product Variety/wallet swap, Country Flags and local module/CSS dependencies.

State: **merged and staging animation release verified**; native Webflow
component saved and published to staging on Loans
(`/loan-management-software`). Webflow rejected single-page publishing; the
user explicitly approved all pending non-draft changes being published to
staging. Site publish task `ba080c9a-11ad-4f3a-80cf-d8fd1432d140` completed
and live native markup/shared motion were verified. Production is unchanged.
Animations Playground must never be published.

Release evidence: [2026-10-28 Collections staging](../../docs/releases/2026-10-28-collections-staging.md).

## Production follow-up

Native markup was published to the configured production domains on 2026-10-28.
The exact staging release promotion is queued behind the required GitHub human
review. The complete native static fallback is live meanwhile. See
[production status](../../docs/releases/2026-10-28-collections-production.md);
production animation completion must be verified after approval.
