# Bilateral and syndicated lending

Saved Webflow draft, 2026-10-29. Figma reference: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=276-1279 (540 × 404). The reference contains an older raster mockup; the user's explicit replacement screens are the native Onboarding customer workflow above the Cards detail screen.

## Components and placement

- Site: `6823036cd77b3093eaf9154d`.
- Animations / Bilateral and syndicated lending: `baf36cfa-9feb-7193-d2c8-2c38245d31ec`.
- Platform Screens / Onboarding Customer Screen: `1f454722-b48e-24e6-33db-bacbfc4ed912`.
- Platform Screens / Cards Screen: `a9f54133-f8f5-3cdd-d349-121dc39f1327`.
- Playground instance: `7e9b1b1b-1faa-0ee0-3c9b-949b49d3ddc2`, at the end of `playground-features-grid`.
- Loans page `68397e62ee3f9429c194bbc7`: instance `a5483b6d-b8cc-35c6-e55e-464bca809fe8` inside the existing Bilateral and syndicated lending feature card. The actual grid is named `products-cards-wrapper`, not the request's historical `feature-grid-wrapper`. Its lending card is now the last child. The previous image is retained with native visibility disabled.

Screen extraction preserves all populated nested components, slots, variant overrides and text. The new screen host has width 100% / min-width 0; gallery-only 24px padding remains on page-level `platform-screen-card` wrappers. Existing Platform Screen, Onboarding Content, flow, sidebar and Cards Content definitions were not restyled.

## Styling and structure

Native Webflow classes own the 540:404 aspect ratio, clipping, white background, 8px outer radius, relative stage, absolute card positions, 3D transforms, fade and transitions. Root is width 100%, min-width 0. Stage fills the root. Bottom Cards frame: width 145%, left 5%, top 22%. Top Onboarding frame: width 125%, left 22%, top 34%. Both rotate X 8deg / Y 15deg / Z -8deg, origin top left. The top frame is narrower to keep the current vertical workflow visible; the older Figma raster uses a different horizontal workflow.

Both object-specific card classes are the main class; `lending-window-surface` follows as a combo class. The global utility owns the shared surface properties in one place; the two combo definitions have no duplicated property values. Verified computed values match Hero / Homepage Hero's style embed exactly:

```css
border-radius: 0.5rem;
border: 1px solid rgba(0, 0, 0, 0.1);
box-shadow: 7rem -1rem 2rem rgba(0, 0, 0, 0.07);
```

Keep these exact rem/px surface values as requested, even though the illustration's geometry otherwise scales with its parent. Native white fade runs from transparent at 19.231% to white at 96.755%. Its pointer events are disabled so it does not obstruct hover.

One style-only HtmlEmbed `1f05ac7b-c0e5-06f8-bef1-1c6733512e1b` carries the unsupported container-query declaration, parent-relative perspective and conditional hover/reduced-motion rules. Local source: `src/embeds/bilateral-lending/interaction-styles.html`. No script or runtime registration is required. The stage is necessary for percentage-height geometry and perspective; each card wrapper owns its independent hover transform and surface. Each isolated screen host preserves the populated Platform Screen instance.

## Motion and fallback

Hover lifts only the hovered outer card by 3% of its height. Movement transitions use the live Global Styles tokens `--motion-duration-default` and `--motion-ease-primary`, verified as 770ms and cubic-bezier(.11, .61, .27, .99). Hover is limited to hover-capable devices with no reduced-motion preference. Reduced motion retains the static perspective arrangement with no transition.

All content and base styles are native; the full stack is visible without JavaScript or external motion bundles. No CDN loader or channel was changed, and no staging/production release or Webflow publication was requested.

## Verification

- Designer: Playground and Loans page render the requested two screens with the foreground workflow visible; native surface class order and computed border/radius/shadow verified.
- Loans Preview with custom code enabled: desktop stack 582 × 435px; hover changes only its outer card transform. Live duration and easing resolve to the Global Styles values above.
- Mobile Preview at 393px viewport: stack 295 × 221px; tablet at 820px: 688 × 515px. Aspect ratio is retained subject to integer client-size rounding, and perspective follows each parent.
- Preview with custom scripts disabled retains the complete stack, container query sizing, perspective, white fade and text. No module request is needed for the CSS interaction.
- Simultaneous 35% / 65% parent fixtures at the same viewport: stack widths 241px / 447px, heights 180px / 335px, perspectives 535.104px / 993.749px. Foreground title type scales to 4.15256px / 7.73589px; each instance retains all ten workflow cards. Temporary fixture removed afterward.
- Reduced-motion behavior is expressed by conditional CSS: hover rules require `prefers-reduced-motion:no-preference`, and the reduce branch disables transition. OS preference switching was not exercised.
- No JavaScript module, build artifact, or runtime behavior test was needed for this native/CSS-only draft change. Browser-level JavaScript disabling and network failure simulation were not separately exercised; custom-code-disabled Preview verified the static rendering.
