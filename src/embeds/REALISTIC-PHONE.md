# Phone Shell — Realistic Experiment

- Figma: https://www.figma.com/design/PCbd0DyXWAD2cDANtl7bpH/Stitch-Animation-Elements?node-id=377-1718 ; node 377:1718, bitmap 244.836 × 484. User explicitly requested a simplified flat HTML recreation rather than delivery of the bitmap.
- Source: realistic-phone-markup.html, realistic-phone-native.css (native Webflow style specification and local preview), realistic-phone.css (selector exceptions), realistic-phone-clock.js. The shell uses HTML elements; status icons reuse the exact inline SVGs from homepage deposits_status-icons.
- Webflow: Stitch Website 6823036cd77b3093eaf9154d; Animations Playground 6ab4079ac7ca32e3a6c168c8; component 6c352bf3-0556-7de1-3ddb-f888cea67bdc, Phone Elements group. Playground instance 0ad8227e-50d8-d924-08f3-b31038e326ae, section e96db1f2-cf2e-140d-dfff-198320033293.
- Independent experiment: existing Phone Shell and Deposits components must remain unchanged.
- Static shell: width 100%, frame aspect ratio 245 / 484. Measuring ancestor .rp-phone has native container-type:inline-size. Geometry, typography, border thickness, corner radii and icons scale in cqi/percentages. Native Webflow stores all visual geometry; no deployed external stylesheet or shared-loader change.
- Corners: body 15cqi, screen 11.5cqi; inset 3cqi. All derive from the same outer phone width. Outer Playground wrapper sets the demo maximum width to 320px; this limit is not part of the reusable component.
- Content: replaceable native Slot inside .rp-content, below the hardware/status safe area. Nested content retains its own appearance. Screen clips content to the proportional screen radius.
- Controls: Show status bar (boolean, default true). Bound attribute data-rp-show-status on .rp-phone; style-only embed handles hiding. Webflow serializes these as True/False; CSS uses case-insensitive attribute comparisons. Hardware island remains visible when the status bar is disabled.
- Webflow native visibility binding rejected updates with a component-map conflict. Attribute bindings were used instead; the status prop remains editable on instances.
- Clock: scoped data-rp-time selector, visitor local time via Intl.DateTimeFormat with h23; immediate update, one shared interval for repeated instances, refresh on visibility change. No external requests; 09:41 static fallback when scripts are unavailable. Separate script and style-only support embeds, positioned at zero size so Designer placeholders do not alter layout.
- Effects: no animation/reveal registration. Only the requested live clock runs.
- Local preview: /realistic-phone.html with npm run dev; 160px, 245px and 400px parent examples and the status visibility control.
- Refinement: original homepage SVG geometry retained; icons inset 8.5%, clock 4cqi, island top 2.7cqi. Time always reflects visitor local time; no separate time control.
- Verification: refined draft checked in Webflow Preview at desktop and 393px mobile widths; icons align with the live local clock and island. Designer exposes only Show status bar plus the content Slot.
- Completion is a Webflow draft. No publication, GitHub merge, or site/page loader changes authorized or performed.
