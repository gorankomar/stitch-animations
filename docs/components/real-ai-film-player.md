# Real AI LP Film player

Saved to Webflow draft on 2026-11-17. Applies only to the lower LP Film poster on Real AI page `6af2c4b2616c8b948cbb3006`; the hero remains unchanged. No page publication, main merge, shared loader or animation-channel activation.

## Behavior and design

Figma file `PCbd0DyXWAD2cDANtl7bpH`: normal controls `675:3742`, volume hover `680:3843`, alternate icons `679:10128`. Play/pause, sound/mute, seek, buffered progress, elapsed/total time, fullscreen/exit are the entire control inventory. Speed, stop, replay and captions are not extra toolbar buttons; replay uses the play control when the film ends.

The existing muted background loop and center play artwork remain visible initially. A transparent whole-poster play target starts the full film with audio after a user click, pauses/hides the background loop, and hides the shade and center artwork. Full film is not autoplayed on page load and does not loop. Its first frame is used as poster on both the full video and lower loop. Original hero poster/source are unchanged.

Controls appear on pointer hover, keyboard-visible focus, and while paused. Coarse-pointer/touch devices keep controls visible after starting. The volume slider expands on volume-group hover or keyboard-visible focus, preserving Figma's 120px slider and shifting seek start from 148px to 288px in the 1024px design. Desktop controls are 44px circles with 24px exact Figma SVG icons, 20px insets/gaps, 2px tracks, orange #ff3609 progress, and 8px thumbs (16px for seek hover/drag). Time inherits the Webflow body ABC Diatype font; no component font-family override. The mobile layout uses 36px controls, 12px insets/gaps, and a 10px time readout. Parent clipping/radius remain native.

Fullscreen is requested only through its explicit button. Native fullscreen is preferred, with native iOS video fullscreen where available. If a browser or embedded Preview denies the request, the player fills the available viewport with a scoped fixed-position fallback. Exit or Escape restores prior body overflow. No automatic fullscreen on mobile. Physical iOS hardware was not available for testing.

## Media and assets

Supplied source: `stitch-ai-full.mp4`, 1920 × 1080 H.264/AAC, 101.993 seconds. The delivery MP4 remuxes the original video/audio streams without quality loss and uses fast-start metadata. CDN base:

`https://d280qq257tic0i.cloudfront.net/Stitch+Animations/releases/97b491b074b0c5a08d9674a14b6d212bb669e5a7/assets/real-ai-film/`

Assets: `film.mp4`, `poster.webp`, `play.svg`, `pause.svg`, `sound.svg`, `mute.svg`, `fullscreen.svg`, `exitfullscreen.svg`. The first-frame PNG master is retained under `src/embeds/real-ai-film/assets/poster-master.png`; its 1920px-wide WebP derivative uses quality 88, visually checked against the master. This covers the normal 1024px design at approximately 2×. Exact Figma SVG exports are preserved unchanged; no redraw or unverified optimization. Their natural root geometry is 24 × 24 and rendered at that size.

S3-only upload used isolated branch `codex/real-ai-full-film-assets-20261117`, commit `1375867b56beceb1298492ccf2250b748436aa6a`, workflow https://github.com/gorankomar/stitch-animations/actions/runs/44065490013. Video transport used chunks solely to avoid GitHub API file limits; the workflow reassembled the full MP4 before upload and compared CDN bytes exactly. No chunks are served. Do not merge the transport-only branch into main or activate it as an animation release. Uploaded media adds assets under the existing allowed release prefix without modifying existing release files.

Control SVGs are also managed Webflow assets, so their image nodes remain native/editable:
- Play: `6afc2e066789714871870780`
- Pause: `6afc2e07f2d2eaae9c4fccae`
- Sound: `6afc2e06678971487187075f`
- Mute: `6afc2e078d1890fe0c67ffc3`
- Fullscreen: `6afc2e06e119fedd373a1aae`
- Exit fullscreen: `6afc2e064439e59879ca018d`

## Sources and Webflow nodes

`src/embeds/real-ai-film/player.js` owns initialization, playback state, seeking, volume, fullscreen and cleanup. `player.css` mirrors native Webflow structural styles. `states.css` contains unsupported state/pseudo-element/media-query rules, scoped to `[data-film-player]`. The generated `runtime.html` embeds those rules and the controller as a saved page draft; it is not a compiled shared feature. If later moved into shared delivery, register it through the normal shared-entry/release workflow and remove this one inline controller after staging verification.

Run `node scripts/build-real-ai-film.mjs` to regenerate `player.html`, `runtime.html` and local `/real-ai-film.html`. No build of shared distribution files is needed for this draft-only controller. Source folders are preserved; no dependency added.

- Poster root: `ee6b6bff-f60c-eab3-8f86-9a5626ff25f9`, `[data-film-player]`.
- Full video: `ea248057-16eb-c54b-6975-aea94d9d8b81`.
- Start target: `7fb6faa0-07f0-8d26-a34c-a9a14d7f887d`.
- Controls: `edcbf0a8-f078-135f-a4d0-f39145b61595`.
- Scoped runtime embed: `13f0d579-8a1b-f1b6-ebf1-21823c2f6929`.
- Native volume input: `0ac8bc9a-2827-6bb0-d618-a71e1d5185d5`.
- Native seek input: `e13925ad-0578-1e07-cee6-11b1df51ca39`.

The importer maps HTML buttons to native Webflow Links, so role=button, tabindex=0 and Enter/Space activation are explicitly supported; clicks prevent default anchor navigation. Range inputs are native DOM elements with tag input and type range, avoiding the importer's Form-only text-input conversion. Do not add redundant form wrappers. Icons are managed Image elements with data-film-icon hooks. The control runtime hides inactive icons using hidden, supported by scoped CSS. Duplicate initialization is guarded; cleanup removes listeners and restores the initial visual state and scroll lock.

## Verification

Actual Webflow Preview verified full-film start with sound, background/play-art hiding, 44 × 44 controls, 24 × 24 loaded icons, ABC Diatype time font, normal and 120px expanded-volume geometry, pause, mute/unmute, keyboard volume/seek, and mobile 345px player without control overflow. Fullscreen entry/exit and hover disappearance were checked in the standalone browser preview. Unit tests cover unloaded/negative time formatting, click-only start, background pause, independent seek/volume, duplicate initialization, fullscreen fallback/overflow restoration, and listener cleanup.

## Replacement full film — 2026-11-17

User supplied a replacement `stitch-ai-full.mp4` with the same name. Duration remains 101.993 seconds, 1920 × 1080 H.264/AAC. Delivery remux preserves video/audio quality and enables fast-start. Current media base: `https://d280qq257tic0i.cloudfront.net/Stitch+Animations/releases/97b491b074b0c5a08d9674a14b6d212bb669e5a7/assets/real-ai-film-v2-bff954c70e2b/` (`film.mp4` and `poster.webp`). Content SHA-256 prefix is `bff954c70e2b`. The first decoded frame was extracted as `assets/full-v2-poster-master.png` and delivered as quality-88 WebP `assets/full-v2-poster.webp`; visually verified. Its appearance is unchanged from the previous first frame.

Upload and exact CDN-byte comparison succeeded in https://github.com/gorankomar/stitch-animations/actions/runs/44073268566, isolated branch `codex/real-ai-full-v2-bff954c70e2b`, commit `be57f8f9d7e7c82a351288366f8e19522f0ce18b`. Updated only the full-video element source/poster and local preview media references. Current controls, both background loops and their posters remain unchanged. Saved to Webflow draft only, without publication or animation-channel activation. New control work is deferred to the next user request.

## Revised control style — 2026-11-17

Latest control appearance supersedes the original single-row 44px design above. Figma layout `681:3871`, user icon source `679:10129`. All six current icon exports were downloaded to `assets/control-reference-v2/` and byte-compared with the originals: identical. Reuse the managed Webflow assets, applying native `brightness(0) invert(1)` to make them fully white without changing geometry. Buttons and time/volume pills use rgba(0,0,0,.7); the enclosing control bar retains the reference's rgba(0,0,0,.43), 2px backdrop blur, 10px radius/insets/padding and 10px gaps. Buttons are 35 × 35 with 24px icons. ABC Diatype inherits from body; obsolete Inter reference is ignored.

Timeline is now a separate top row: 8px rounded track and played/buffered segments, 18px thumb. The lower row holds play, the expanding volume pill and a time pill on the left, with fullscreen alone on the right. Native existing toolbar was reused; added only `film-row` (`e6225086-7943-31b5-2596-da27b7faa32f`) and `film-left` (`e6225086-7943-31b5-2596-da27b7faa32e`) to express this two-row layout. Existing buttons, range inputs and time element were moved, preserving IDs and behavior.

The volume group is one 70%-black pill. Its button has transparent fill inside that shared surface to avoid double-darkening. The sound icon stays fixed while the same pill expands rightward from 35px to 175px, exposing the 120px range plus spacing. Expansion uses Global Styles fast duration and primary movement easing; opacity remains linear. In Preview these resolve to 462ms and cubic-bezier(.11,.61,.27,.99). Pointer hover and keyboard-visible focus expand it. Mobile fine-pointer preview uses a shorter 60px range; coarse-pointer devices use mute and system volume rather than an unsupported programmatic iOS volume slider.

No CC control or subtitle track: no transcription connector, CLI or installed speech-recognition runtime was available in this session. The user expressly authorized omitting CC if subtitles could not be produced. No placeholder captions or invented transcript were added.

Fullscreen (native or full-window fallback) now hides controls AND the cursor after 2,500ms of inactivity during playback. Pointer movement/down, keyboard activity and focus restore them and restart the timer. Paused playback, active pointer interaction and exiting fullscreen keep/show controls. The `createFilmIdle` controller owns and disposes its timer; no timer is reset on ordinary timeupdate events. Root `data-film-idle` owns visibility/cursor state. Reduced motion removes visual transitions without changing inactivity behavior.

Actual saved Webflow Preview checked desktop and 393px mobile (345px video), no control overflow, 35px buttons, white icons, rgba surfaces, inherited ABC Diatype, expanding pill 175px/range 120px with unchanged sound-button x coordinate, volume input changes/unmute, fullscreen idle hidden + cursor none, and wake-up + cursor auto. All 255 repository tests pass, including the new deterministic inactivity/reset/paused/disposal test. Source, native Webflow styles/structure and scoped runtime are saved; no Webflow publication, GitHub merge or animation-channel activation.

## CMS Rich Text marker support — 2026-11-17

The earlier marker suggestion alone was insufficient: no marker loader had been installed. User placed the exact marker `<div data-stitch-video="real-ai"></div>` in Press item `6afc12dd06289bf688e81385` (Stitch casts Patrick J. Adams to launch Stitch AI, agentic AI for banks). Custom code was already enabled. The missing runtime is now saved as a new, independently named HtmlEmbed `12a3c867-ec7a-6837-b0eb-faba3290c584` on **Presses Template** `69fd1bd8b7dae1c93ab30a0e`, appended to the Body. Existing template embeds, CMS fields/content, site-wide code and landing player are preserved. It is not installed on Blogs Template or every site page.

`cms.js` finds only exact `real-ai` markers, inserts trusted generated markup (no arbitrary dataset HTML or remote configuration), and mounts the canonical `initFilmPlayer`. The same `build-real-ai-film.mjs` produces native landing markup/runtime and self-contained `cms-runtime.html` from one shared player source. CMS runtime includes scoped base styles because native landing classes alone cannot be assumed on collection pages. `cms.css` supplies 16:9 marker geometry, clipping, initial play artwork and Rich Text-specific resets. The user's marker remains the only CMS content required; no markup needs to be pasted again.

No Webflow component instance is created at runtime. The complete HTML player is inserted exactly at the marker's position between text blocks. Background cut, both posters, full film, icon assets, controls, volume pill and fullscreen idle behavior reuse the current landing configuration. Only articles containing a marker render a player. No external animation loader or release-channel change is needed for this draft runtime.

Late Rich Text rendering is supported by a MutationObserver. Multiple markers are independent, duplicate initialization is guarded, removed players are disposed, and full disposal restores the original marker contents/classes. Reinstalling the generated loader disposes its prior instance before remounting. Unit tests cover exact-key selection, multiple/repeated markers, late insertion and removal/cleanup. Refreshing generated content or changing media/control source requires rebuilding and saving the generated snippets to their respective Webflow embeds; repository edits alone do not update a saved/published Webflow embed.

Actual item Preview verified initial muted loop, whole-poster start, full-film playback, pause, mute, keyboard seek, loaded 24px icons, inherited ABC Diatype and 800 × 450 desktop / 345 × 194.06 mobile sizing without control overflow. All 257 tests pass. Source and Press template draft saved; no CMS item or Webflow page/site publication, GitHub merge or animation activation. The public article will need an authorized publication to receive the new template runtime.

## Compact stable volume hover — 2026-11-17

Desktop volume track reduced from 120px to 80px (expanded pill 175px → 135px); the existing 60px mobile fine-pointer track remains. `.film-volume-group` now owns `pointer-events: auto`, overriding the decorative control overlay's inherited `none`. This makes the complete pill—including the margin gap between icon and slider—one continuous hover target, preventing collapse/reopen while crossing that gap. Icon position, volume behavior, motion tokens and other controls are unchanged. Updated the native landing class and regenerated/saved both landing and Press CMS runtimes; no publication. Local CMS preview confirmed 80px track, group hover retained while pointer sits in the gap, and working volume adjustment.


## Optional multilingual subtitles — 2026-11-17 (local preparation)

The user requested transcription and optional English, Arabic, Vietnamese and Indonesian subtitles. This supersedes the original control inventory restriction on captions for the local prepared version. Existing saved Webflow drafts have not received this change.

Editable source and review status: `src/embeds/real-ai-film/subtitles/README.md`. `cues.json` initially contained 18 parallel timed cues; the builder generates four WebVTT files and a timestamped English transcript, validates their timings, and includes their contents in both player embeds. Raw local medium.en machine recognition and word timestamps are retained separately. English still needs a listening review; translations are AI drafts for native-speaker review. No spoken content is invented in the long action/music pauses.

`initFilmSubtitles` adds independently owned Blob-backed native text tracks per instance and a text-only overlay. CC is a compact control beside fullscreen, orange while a subtitle language is selected. Its native select provides Off / English / العربية / Tiếng Việt / Bahasa Indonesia; it inherits the body font with weight 500. Arabic uses `lang=ar` and `dir=rtl`. Normal/custom fullscreen uses hidden tracks plus `cuechange` overlays to avoid controls; native iOS video fullscreen uses the browser's showing track. Cleanup disables/removes tracks, revokes URLs, clears text and removes listeners. Subtitles default off per instance. No third-party transcription upload or separate subtitle CDN deployment is required.

Local verification: actual browser rendered all four languages, including RTL Arabic; 393px mobile checked caption/control separation; landing and generated Rich Text/CMS player tested. Automated checks cover switching, off, RTL, native-fullscreen mode transitions, cleanup, and existing playback. Physical iOS fullscreen remains unverified. Preparation is local only; no Webflow draft/publication, GitHub merge or animation release was performed.


### Subtitle content and background refinement — 2026-11-17

User correction: omit the two closing title lines only in English, keep their Arabic/Vietnamese/Indonesian translations. Empty per-language cue text now deliberately excludes that cue from generated output. Seven dedicated hip-hop lyric cues at 37.04–54.50 seconds are added in all four languages with ♪ markers; the initial recognition had skipped the vocals. Canonical source now has 25 cue intervals (23 English cues, 25 per translated track). The song-specific raw recognition is preserved; listening and translation review remain outstanding.

Removed the broad outer background from `.film-caption`. Its inline `.film-caption-text` child uses `box-decoration-break: clone` and padding so each visible line has a background hugging the words. Plain text remains inserted with `textContent`, with no cue HTML execution. Browser verified English song cues, all three song translations, the retained Indonesian hero line and its English omission; mobile screenshot confirms the backgrounds follow each line. Relevant player/CMS tests pass. Both generated local player builds updated; Webflow remains untouched.

### Subtitle typography variables — 2026-11-17

The user specified ABC Diatype for English/Vietnamese/Indonesian and IBM Plex Sans Arabic for Arabic. Prepared caption CSS binds `.film-caption` to `--_typography---font-styles--body` and its `[lang="ar"]` state to `--_typography---font-styles--arabic-body`, with inherited-font fallbacks. These exact CSS variable names match the existing project site-style references. Caption weight is 400; dropdown options remain 500, with the Arabic option using the Arabic body variable. No hardcoded component font families or new font uploads are introduced. The local test pages still load their own ABC Diatype files; Arabic there remains a fallback unless the site's Arabic font/variable is supplied. During an authorized staging integration, verify both variables and computed fonts in actual Webflow Preview; native iOS fullscreen remains browser-controlled. No staging release or Webflow draft change is authorized by the future-tense font request.

### Figma CC icon and dark subtitle menu — 2026-11-17 (local)

User references: Figma `PCbd0DyXWAD2cDANtl7bpH` CC `679:10154` (editable vector `679:10155`) and menu list `673:3253`. The exact exported 24×24 CC SVG is preserved untouched in `assets/captions-original.svg` and embedded as a data URI in generated markup, avoiding a temporary Figma URL or new asset-hosting requirement. It renders at its original 24×24 dimensions inside the existing 35px control. The object's specific `film-subtitle-toggle` class precedes its shared `film-control` class.

The native select has been replaced by a compact dark menu following the reference's 8px panel radius, 4px vertical inset, 28px content rows with 2px vertical spacing, 6px row corners and 14px/20px medium text. The old Inter reference is ignored; all text uses the established body/Arabic body variables. Dark surfaces are #1B1B1B with #3D3D3D border, divider and selected row. “Off” is the first item with a divider below it. Narrow screens remove inter-row margins and position the panel beside CC to fit within the clipped video instead of extending above it.

Flags use the exact user-provided hosted sprite `https://cdn.prod.website-files.com/6823036cd77b3093eaf9154d/6af5dbc6f660e23710d49447_stitch-contact-country-flags-optimized.svg` (verified 512×384), with the existing contact-form positions manifest. Language/country associations: English→US, Arabic→Saudi Arabia, Vietnamese→Vietnam, Indonesian→Indonesia. Each decorative artwork is 27×18 with 2px CSS rounding and a separate outside 1px #4B4B4B outline with 3px corners, matching the contact form's geometry with the requested darker perimeter. No flag SVG paths are changed or duplicated.

`initFilmSubtitleMenu` owns accessible menu radio states, independent IDs, selected-language announcement, Arrow Up/Down, Home/End, Escape, Tab/Shift-Tab, outside-pointer/focus dismissal, focus restoration and cleanup. Native buttons support Enter/Space. Open-menu state keeps fullscreen controls awake; closing restarts the normal idle clock. Each instance owns its menu and subtitle tracks. Tests cover selection, keyboard wrap, focus, dismissal and teardown. Browser verified exact icon geometry, all four loaded flags, Arabic selection, desktop/mobile layout and generated article embed. Saved locally only; no Webflow draft/publication, staging activation or Git merge.

### Filled captions-on icon — 2026-11-17 (local)

User supplied Figma `692:3786` / vector `692:3787` as the enabled-state icon. Exact untouched 24×24 SVG is retained in `assets/captions-on-original.svg` and embedded alongside the existing outlined SVG. `data-film-subtitles-active` now swaps their visibility: outlined for Off, filled for any selected language, including gaps without active cues. Removed the prior orange enabled-control background so the icon fill communicates the state. Both local landing and CMS builds regenerated. Browser confirmed both loaded assets are naturally 24×24 and only the correct icon renders at 24×24 for each state; seven relevant player/CMS tests pass. No Webflow or release changes.

### Staging integration preparation — 2026-11-17

Saved the new caption overlay, right control group, menu and existing scoped runtime to Real AI; updated the existing Presses Template CMS runtime. Native IDs: overlay `5c1c2e23-fc4d-0d8f-6077-a0c267f5e79e`, right group `effa9687-d9b4-c7f9-5172-7eb79308b476`, CC trigger `effa9687-d9b4-c7f9-5172-7eb79308b475`, menu `0dd95ee1-ded7-2ef0-eee8-71b909092e2e`. Existing fullscreen node was moved into the right group without replacing it. Caption trigger has the specific `film-subtitle-toggle` main class followed by the shared `film-control` combo; WHTML's compound selector created the native combination without copying control properties. Native language labels retain `film-subtitle-label` for Arabic font selection. Runtime JSON lives in the existing scoped embed, avoiding a redundant data wrapper.

Both exact CC files are managed Webflow assets, uploaded through Data API and byte-verified from the CDN: outlined `6afc7f9e2d74ac5a2dc761d0`, filled `6afc7f9e7f7477dd9dec06a7`. Native image hooks explicitly mark off/on; local/CMS generated markup continues to carry the exact embedded files. The controller also supports keyboard activation on Webflow's imported Links. Generated JS whitespace is compacted using the existing Vite transformer to keep the self-contained CMS embed below Webflow's code size limit.

Client review pack: `deliverables/stitch-ai-subtitle-review.zip`, built by `scripts/build-real-ai-subtitle-review.py`. It includes a portable UTF-8 review HTML with side-by-side English references and RTL Arabic, four readable timed `.txt` files, and four `.vtt` files. All content is clearly marked draft and reviewers are asked for language/cue number/corrected text. The visible closing titles appear as reference text in the review pack but remain absent from English playback subtitles.

Actual Webflow Preview integration checks: English computed font `ABCDiatype, Arial, sans-serif`; Arabic computed font `"IBM Plex Sans Arabic", Arial, sans-serif` with RTL. The builder emits country-scoped sprite rules from the existing manifest because WHTML's inline-property importer otherwise merges all flag offsets into the base class. Explicit caption z-index 1 and control z-index 2 preserve menu stacking when the native caption paragraph follows controls in DOM order. At 393px Preview width the 345×194.0625 player contains the full 210×159 menu without scrolling. Staging activation evidence is in `docs/releases/2026-11-17-real-ai-film-subtitles-staging.md`.

### RTL range fills — 2026-11-17 (saved locally)

Range track gradients now use `--film-track-direction`, defaulting to `to right` and switching to `to left` on each input's `:dir(rtl)` state. This follows inherited document/ancestor direction and explicit input overrides, matching the existing native thumb and input behavior. Played, buffered and volume fills all use that direction; Firefox's track also includes the buffered segment. Rebuilt landing and CMS runtimes and local previews. All seven player/CMS behavior tests pass; browser visual verification and Webflow installation remain outstanding. No publication or release activation.


### RTL player controls — 2026-11-17

Played, buffered and volume track fills follow each input’s inherited direction using `:dir(rtl)` and `--film-track-direction`. The subtitle menu uses logical `inset-inline-end` at desktop and mobile sizes so it stays beside the mirrored CC control. Both generated embeds and local previews rebuilt; landing and Presses Template embeds saved without publication. Full `npm run validate:release` passes (264 tests; wallet swap and Country Flags closure verified).
