# Onboarding customer

- Source: Figma `PCbd0DyXWAD2cDANtl7bpH`, screen [533:37414](https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=533-37414), 1440 × 817; full workflow [553:6352](https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=553-6352), 716.2 × 1534.
- Destination: Platform Screens (`6ad6808c9ce17b3ab0a69ea8`) on Stitch Website (`6823036cd77b3093eaf9154d`). Gallery card `ebcaa652-83d8-97a5-6882-facffc4c3291`; Platform Screen instance `43c34891-0006-00df-f924-afbf5f3d6812`, named **Onboarding Customer Screen**. Reuses the existing Cards height variant without modifying the shared shell or earlier screens.
- Static native Webflow draft. No animation, staging/production activation, publication, Git push or merge was requested. Webflow remains canonical; construction payloads are historical evidence, not a source to replay over later edits.

## Reusable components

| Component | Identity | Contract |
| --- | --- | --- |
| Platform Controls Sidebar | `fbc8003d-6354-66f0-c6ce-1601a9ba9efb` | Editable Title (Controls); one Groups slot. Back arrow and title/chevron retain Figma placement. |
| Platform Sidebar Group | `49e8bcce-2a17-0c07-6ce3-ba55cd2a8b67` | Title and Items slots. Three independent instances: Workspace, Library, My account. Title slots reuse Platform Navigation Item and existing/new Icons. |
| Platform Sidebar Subitem | `6ce4eb71-53e8-6216-e823-61bef0662bd7` | Label prop; Base and Active variants. Nine items, with Services active. |
| Platform Onboarding Content | `207571f4-609d-305d-679a-2dbdd5edca4a` | Breadcrumb, heading/actions, clipped dotted canvas and full-flow position. |
| Platform Onboarding Flow | `f49277c4-c1ef-cc7e-ec07-ceffd47b7c97` | Complete 716.2 × 1534 workflow. Ten cards, ten arrows, Start and two End endpoints, branch and four circular markers. |
| Platform Flow Card | `088979fd-9937-4d9d-3e6e-ecbd72c63ae4` | Editable Title and Phase; Incoming Events and Outgoing Events slots. Base 280 × 84; Tall 280 × 120; Two Events uses the source's upper port placement. |
| Platform Flow Arrow | `bbd5b2d0-b562-e950-5599-72092cb5c794` | Original vector, 12 × 51 placement with 8 × 51 artwork. |
| Platform Flow Event | `aae6b25e-d459-2f76-e2bf-c5596ebd48c1` | Repeated event port; Base outgoing and Incoming variants. The incoming slot also supplies the supported `--platform-flow-event-fill` value to its core. |
| Platform Flow Endpoint | `c59e7336-9093-b302-6536-178c4e84c439` | Editable Label; Base Start and dark End variants. |
| Platform Flow Branch | `0cb256f5-18df-a1b3-1386-cae439585be8` | Original stem, diamond, mirrored connector vectors and reused Dataflow icon. |
| Platform Flow Marker | `b6625bf1-b844-f4a7-f735-60a21f0220d9` | Original 1.8953px circular marker. |
| Platform Solid Button | `1fd774a5-e963-9514-09cb-78af768404ec` | Editable Label; Edit instance. |
| Platform Icon Button | `59dd7fb0-4646-e40a-d8f8-0aefefc884c6` | Icon slot; Base and Canvas variants for More and Maximize. |

The whole workflow remains in the DOM below the canvas crop, including Tahaquq, Yakeen, Mozn AML, Raya User Creation, Customer creation, Customer onboarded and both End states. Never truncate the component to the visible screen height. Each positioned flow object has one necessary positioning boundary that can support a future independent transform.

## Styling and sizing

- Uses Platform Screen's existing 1440px query-container contract. Screen aspect ratio is 1440:817; the flow is 716.2:1534. All geometry, typography, borders, radii, icons and strokes scale proportionally with the screen's parent width. The content explicitly has the 817px proportional height because the shared Content slot itself has intrinsic height.
- Live text inherits the site's body font, not Figma Inter. Text nodes are separate from structural divs and nested component instances, retaining localization boundaries.
- Native Webflow owns layout, colors, typography, borders, positioning, static filled-dot background and fallback visibility. Filled dots use proportional radial-gradient paint (9px gap / 0.6px radius at design width), without pointer interaction or a JavaScript runtime.
- Historical construction state: this draft put shared radius classes first (platform-radius-4/6/8/12), with object-specific classes afterward. **This is superseded guidance, not a pattern to reuse.** The user subsequently required the object's specific class to be the main/base class, followed by shared utilities—for example, `platform-sidebar-subitem` then `platform-radius-6`—so component variant appearance belongs to the main class. Follow [the current class-order rule](../../../docs/workflows/webflow-structure-and-styles.md). The documentation correction does not change the saved Webflow draft; reordering existing elements was not requested. Shared corner values remain defined once.
- Empty event slots use native `:empty { display:none }`, avoiding Designer's 75px empty-slot placeholders without hiding populated ports.
- One style-only embed in Platform Flow Card declares `.platform-flow-card-incoming{--platform-flow-event-fill:#fff}`. Native controls reject custom-property declarations, so this is the sole unsupported-style exception. The event core's native background uses that optional variable with #888 fallback. No scripts or external CSS are required.

## Icons and original vectors

Reuses File, Book Open, Chevron Down, Slash, Dots and Dataflow; existing component internals are unchanged. New Icons components: Arrow Left (`32410ba7-a8fb-9d3c-8548-b474944eb9dc`), Layout Sidebar (`84adc55f-ee12-5fc6-d194-0ffa9d131ccf`), User Square (`4d62c4ae-cfc1-8c6e-c55a-a516f755375a`), Dots Vertical (`b9ad546a-d054-51e5-9d0e-e259aa956b1d`), Maximize (`8adeb365-328d-9c3f-7a54-7bd752326dc9`). They expose bound Width, Height, Color and Stroke Width. Root SVG stroke is inherited by paths. Dots Vertical retains the source's actual 16px path coordinates in a normalized 16px viewBox with 1.6-unit stroke and bound fill. The source export's hidden-instance opacity is applied at the card's menu integration boundary instead of making the reusable icon permanently invisible.

Untouched source exports are `assets/originals/onboarding-*.svg` and `onboarding-flow-*.svg`. Native adaptations retain original path geometry and precision; no raster assets or temporary Figma URLs are deployed. No additional SVGO rounding was applied to these small vectors. WHTML drops SVG `<use>` elements; the diamond's source references were expanded using the original path coordinates and inside-stroke mask before insertion. Inline delivery was explicitly chosen by the user for future path animation.

Code Connect discovery was requested and inspected. These primitives are native Webflow components rather than local framework exports; no speculative repository-code mappings were saved.

## Verification

- Native Designer: nine sidebar subitems with Services active, all ten flow cards, three endpoints and full 1534px proportional workflow remain present.
- Simultaneous 480px and 800px parent fixtures: screen sizes 480 × 272.328125 and 800 × 453.8828125; normalized card widths 279.984375 / 279.9984375 and heights 84 / 83.9953125; normalized flow heights 1533.984375 / 1533.99375. Title type scales to 6.66667 / 11.1111px. No content horizontal overflow. Temporary fixtures removed.
- Designer mobile at a 393px viewport: screen 297 × 168.5; normalized card width 280 and full-flow height 1533.97727; all ten cards retained; no content horizontal overflow.
- Draft metadata readback: `draft:true`; sitemap `includeInSitemap:false`. No publication.

- Native desktop Preview with scripts disabled: screen 1232 × 698.984375; normalized canvas y 111.988636 and height 681.994724; card 279.998985 × 83.991477; full flow 1533.999594 high. Incoming port remains white without scripts. All ten cards are present, and content has no horizontal overflow.
- Native mobile Preview: screen 297 × 168.5; normalized canvas height 681.969697; all ten cards retained, no content horizontal overflow. Desktop Designer restored.
- Webflow's custom-code-enabled Preview remained on “Compiling custom code…” with an empty compiled frame and no reported console errors. It was not treated as a successful compiled Preview. The native script-free Preview and Designer both render the full static design; no animation runtime was added.
- Evidence: `verification-onboarding-preview.jpg`. The full workflow remains uncropped in its own component; only the screen canvas clips the source view.
- `git diff --check` passed. No npm runtime tests/build were needed for native static draft edits.
