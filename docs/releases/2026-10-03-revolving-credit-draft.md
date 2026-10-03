# Revolving Credit — saved Webflow draft

Created Figma node 379:1884 as Animations / Revolving Credit in Animations Playground, site 6823036cd77b3093eaf9154d, page 6ab4079ac7ca32e3a6c168c8. Component: 530b8cfb-1b3a-2d6f-7320-cd53f4930874. Main page instance: 691d6397-b4b6-b6fa-5594-53e81bd3efbf.

Saved native static layout, approved Light Credit Card instance, existing Calendar and new reusable Coins Swap icon; saved separate scoped styles and portable inline motion in a native display:none wrapper. Preserved the card's internal appearance and supported props. Added shared-entry/build registration for a future release.

Designer and Preview verification: exact frame ratio at 270/345/410/540/630px; proportional labels/icons; live blue route pulses; primary movement easing and linear opacity. Three simultaneous animated instances had 56 samples each and unique route-gradient/coins-clip IDs. Custom code disabled: zero samples, all reveal wrappers opacity 1, two original gradient layers, full native appearance. Temporary test parent/copies removed after verification. Reduced motion, offscreen/hidden-tab clocks, duplicate mount/disposal, missing tokens and failed setup covered by six focused lifecycle tests. All 53 tests pass. Full shared build and dependency check pass in /tmp/stitch-revolving-credit-build.

Completion stage: **saved to Webflow (draft)**. No GitHub push/merge, site-wide loader update, Playground loader URL update or domain publication. Current published shared release is unchanged. A later middle/publication must merge a fresh shared release and remove this component's portable runtime when page-all-lite owns it. No production verification is claimed.

Native Designer snapshot-tool access was unavailable because the Designer MCP app was disconnected; visual verification used the existing connected browser's actual Designer and compiled Preview canvases. OS-level reduced-motion and separately network-blocked sessions were not run.

## Revised label carousel

Saved the user's requested revision to the same Playground component: removed card hover/follow, preserved blue pulses, centered active labels on route Y188.887, and replaced both separate label treatments with five native Credit Product Label instances. Slow upward cycle: Revolving credit → Installment loans → Personal loans → Auto loans → Home equity; 4.62s dwell and 3.08s eased movement. Outer wrappers own scale and linear opacity; card covers the upper exit.

Desktop 630px and mobile 345px Preview plus script-disabled native Designer fallback verified. Eight focused tests/full 55 tests and isolated shared build/dependency check pass. No loader change, publication, Git push or merge.

## Final visual refinement

Card moved down 8 design pixels (bottom133px). Label shells remain opaque throughout motion; only text/icons fade linearly, preventing the route from showing through. Hidden slots use visibility:hidden. Saved native position/secondary opacity and revised scoped style/runtime embeds. Eight focused tests pass.

## Shadow and exit refinement

Shadow alpha now follows label emphasis. Beyond the above/below adjacent slots, the whole shell fades gradually to zero rather than disappearing with a still-visible background/shadow. Active/adjacent backgrounds stay opaque over the route. Eight focused tests pass; runtime and scoped styles saved to the same draft.
