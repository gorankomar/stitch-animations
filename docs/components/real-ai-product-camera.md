# Real AI product camera

Webflow component **Real AI product camera** (`ab08d931-9bbf-9677-8c22-3d9bdf181830`), in Landing Page Components. Real AI `/ai` instance `ffeb4c11-a71a-8359-a3c3-e1292cc12061` replaces only that page's LP Solution Product Screen instance. Original definition `14330c1a-def2-67af-e82b-6344c702cd6f`, its other instances, sidebar and motion are preserved.

Approved version 05 of the product layout lab: a flat product-content plane with translated/zoomed camera framing, field fills and AI markers; native prompt collapses and rests above the bottom fade; canonical Product Working shadow/outline plus clockwise paused quarter-turn sparkle; completion copy, expanded prompt return and seamless loop. No background tilt.

Native structure: stage → fields visibility layer → camera transform plane → existing native product content; stage → prompt position wrapper → effect shell → native product bar; stage → bottom atmosphere; scoped style embed. Each wrapper owns a separate motion/effect responsibility. Sidebar and tilt light are absent only in this new definition. Static form remains visible when JS is unavailable; reduced motion shows the completed form without the prompt.

Native classes own frame sizing, clipping, cqi container, backgrounds, absolute layout and bottom gradient. Existing form classes retain their native appearance; camera-content / camera-description / camera-description-area are native combo classes after the existing object class. Authorized compact description is 32cqi × 8.5cqi. Scoped style source is `src/embeds/real-ai-product-camera-style.html` (unsupported caret, state selectors, shadow/outline pseudo-elements and responsive prompt typography). Do not ship the lab stylesheet to Webflow.

`src/lib/effects/product-camera.js` is the shared renderer for lab studies 04/05 and production. `src/embeds/real-ai-product-camera.js` binds native content to it, resolves live motion tokens, caches unzoomed geometry, and uses Animation Stage for visibility, resize, hidden-tab and reduced-motion clocks. Fixed 3.2× native layout is scaled down by the outer camera for crisp rendering. Owns plane transform, field values/borders/markers, bar state/text/height, sparkle transform, working CSS variables and prompt travel. Cleanup restores native styles, values and state. Repeated initialization is guarded and multiple instances are independent.

Both page-all and page-all-lite register the feature, with a standalone feature entry in Vite. New markup requires the matching shared release on staging/production; permanent loader routers stay unchanged. Release evidence belongs in docs/releases.

Native field placeholders and prompt/status copy are read from the duplicated component’s localized copy source; they do not depend on lab-only data attributes. Preview testing caught and corrected this binding difference before production.

RTL first-shot framing: stage computed direction is read during measurement. The product-name shot mirrors its protected 9% leading-edge margin to the right in RTL, then blends back to the approved path before the selector shots. Description and all later shots are unchanged. This is JavaScript framing, not a Webflow CSS change. Staging deployment is needed for Preview; production promotion is separate.
