# Real AI background video

Saved to Webflow draft on 2026-11-17. No Webflow publication or animation-channel change.

## Media

Temporary supplied source: `stitch-ai-cut.mp4` (Real AI raw assets). Delivery copy removes all audio streams without re-encoding H.264 and moves MP4 metadata to the front for progressive playback. 1920 × 1080, 9.72 seconds.

Bucket: `stitch-website-animations`. The existing IAM policy permits release assets, not a new `media/` prefix. Uploaded only this asset under an isolated release asset directory; this is not a complete animation release and must never be activated as a channel.

URL: https://d280qq257tic0i.cloudfront.net/Stitch+Animations/releases/667d21ffa2c7b996cf13f5565db9641f4cd77e47/assets/stitch-ai-cut-background.mp4

Upload and exact CDN-byte comparison succeeded in https://github.com/gorankomar/stitch-animations/actions/runs/44062705123 on isolated branch `codex/real-ai-video-upload-20261117`. Main and both channel pointers are unchanged. Asset metadata identifies temporary Real AI use; cache max-age is one day. No scheduled expiration: retain while referenced, replace when final media arrives.

## Webflow structure

Real AI page `6af2c4b2616c8b948cbb3006` has two native DOM video elements:
- Hero: `7c92c8e3-9ff2-e089-a36f-e4e4ca722003`, immediately after the original photo and before the shade/content.
- LP Film: `4b439cf2-e90f-5f3a-44aa-726176071cb2`, immediately after the original photo and before the shade/play artwork.

Shared native class `real-ai-background-video`: absolute inset 0, width/height 100%, object-fit cover, centered, pointer-events none. No added wrappers. Existing images remain behind videos as fallback; their asset `6afc2646ec470e75e77e4137` is also each video poster. Existing shade, text, rounded clipping and play art retain their native appearance.

Use explicit string `true` for autoplay, muted, loop and playsinline attributes. Empty muted/loop attributes were retained in the data model but dropped by Designer Preview rendering; explicit values fixed playback. No controls attribute. Videos are decorative, aria-hidden, tabindex -1, with picture-in-picture and remote playback disabled. Source has no audio track as an additional guarantee of silence. Browsers can pause offscreen videos or disallow autoplay in power-saving modes; poster fallback remains visible. No fullscreen request or direct video pointer interaction.

## Verification and pending full film

Actual Webflow Preview showed both videos playing when visible, looping with muted true and controls false. Desktop, 820px tablet, and 393px mobile layouts checked; mobile LP Film is 345 × 194.06. Inline attribute retained on both elements. Physical iOS hardware was not available for verification.

The full film and Figma controls were supplied later on 2026-11-17. The lower poster now switches from this background loop to the full film on a whole-poster click; see [LP Film player](real-ai-film-player.md). The hero remains unchanged. The lower loop poster is now the full film’s first frame. Both original standalone photo elements were subsequently removed by the user; the video poster assets remain.

## Replacement cut — 2026-11-17

Replaced both hero and LP Film background sources with the new same-name supplied cut: 25.04 seconds, 1920 × 1080 H.264, 3,313,051 bytes. Delivery is video-only and fast-start, with no re-encoding. Current URL: https://d280qq257tic0i.cloudfront.net/Stitch+Animations/releases/97b491b074b0c5a08d9674a14b6d212bb669e5a7/assets/real-ai-loop/stitch-ai-cut-2448fc24eac8.mp4

CloudFront bytes exactly match the local delivery file (SHA-256 prefix `2448fc24eac8`). Isolated upload branch `codex/real-ai-loop-v2-20261117`, commit `ebdeb04257e1bebea31567c84f1cf02a07755b56`, workflow https://github.com/gorankomar/stitch-animations/actions/runs/44071035912. Fresh content-versioned URL prevents the previous same-name cut being cached. Both existing posters and all playback attributes are preserved. Full-film source, controls, hero appearance, animation channels and main branch are unchanged. Saved Webflow draft only; no publication. Local film preview now references the new loop.

The replacement cut’s exact first frame is now the poster for both background loops (user follow-up, 2026-11-17). Webflow asset `6afc35ea5a5862d31e2897ae`, https://cdn.prod.website-files.com/6823036cd77b3093eaf9154d/6afc35ea5a5862d31e2897ae_stitch-ai-cut-2448fc24eac8-poster.webp. PNG master and 1920 × 1080 WebP (quality 88; 141,978 bytes) are retained in `src/embeds/real-ai-film/assets/background-poster-master.png` and `background-poster.webp`. WebP visually verified. The full-film video retains its own first-frame poster. Saved draft only.
