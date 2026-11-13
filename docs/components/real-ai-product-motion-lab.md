# Product AI motion studies

Local-only comparison page: `/real-ai-product-motion-lab.html`. Requested 2026-11-13 to choose an active but restrained working treatment. No Webflow changes, shared-entry registration, compiled distribution, or release.

The page reuses the product bar markup, native stylesheet, local ABC Diatype fonts and existing sparkle/stop assets. Each bar preserves the 460 × 111 design proportions through a 1200-unit query container. All candidate effects belong to an outer `.lab-effect`; established bar internals and the canonical animation remain unchanged. The native bar's animated shadow stays disabled (its opacity property is absent).

- **S1 Copilot orbit:** shared `renderCopilotShadow`, 1.35× clock, 0.18× radius. Orange alpha .22 and gray .055. Original periodic full-turn icon rhythm.
- **S2 Twin glows:** compact opposing warm shadows, 2.8s orbit. Gray .04. A primary-eased icon turn per orbit.
- **S3 Quiet pulse:** linear triangular opacity pulse over 3.4s, small 5s positional drift, gray .05. Quarter-turn icon with a short resting beat.
- **O1 Single trail:** one masked 1.2-design-pixel conic highlight around the bar, 3.6s lap; periodic icon turn.
- **O2 Paired trails:** two opposite masked conic highlights, 4.4s lap; a primary-eased half-turn icon per half-lap.
- **O3 Trace and release:** 2.4s perimeter fill, .4s hold, 1s linear fade. One primary-eased icon turn during the trace.

Preview-specific CSS and JS live beside the embed as `real-ai-product-motion-lab.css` / `.js`. The page supplies local motion-token fallbacks; these are not a fresh verification of live Global Styles. Icon rotation uses the resolved global primary curve. Continuous shadow/outline travel is linear, and opacity is linear. Fixed study lap periods are comparison parameters, not new site tokens.

Each card uses `animateStage` for offscreen/hidden-tab pause, resize, and reduced motion. Pause freezes each card's elapsed time; Animate icons independently restores or enables icon tracks. Page teardown disposes stage observers and WAAPI tracks. Reduced motion keeps the bars and static effect samples visible.

Verified the original six desktop instances and local assets, shared aspect ratio, visible shadow/outline rendering, Pause/Resume and icon toggle, and 393px layout without horizontal overflow. JS syntax and repository whitespace checks pass. No production behavior changed.

## Combined treatments

Added a third row on request: **C1 = S2 + O1**, **C2 = S2 + O2**, **C3 = S2 + O3**. All three retain S2’s twin-glow strength, 2.8s orbit and icon rhythm; outline timing/strength matches the corresponding standalone study. Two effect layers keep the shadow outside the frame and the masked outline above it; O3’s fade affects only the outline. Shared local render functions keep standalone and combined treatments identical. The original six studies remain available.

C1 has been applied to the local Product Screen animation. Twin-glow and single-trail samplers are shared in `src/lib/effects/product-working.js`, so the standalone studies, combination, and product treatment retain the same appearance. The product additionally fades both layers in at work start and out after completion. No release or Webflow draft update is implied.
