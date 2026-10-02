# Raster images from Figma

Apply this workflow to photographic/raster image layers in supplied Figma illustrations. Keep text, native shapes, and vectors native or SVG; do not flatten the whole composition just to compress an image. Preserve the Figma crop, aspect ratio, transparency, and color appearance.

## Export and size

1. Export a PNG master from Figma at enough resolution for the largest intended use. Preserve it without destructive optimization; generate each WebP from this master, never from a previously lossy output. Store delivery assets with the component in `src/embeds`; record the master location in component notes.
2. Determine the maximum rendered image dimensions across the illustration's supported parent widths. Default to 2× those CSS dimensions for high-density screens, bounded by available source resolution. For a photo that remains 40 × 40 CSS pixels, target 80 × 80 encoded pixels. If the illustration grows and the avatar reaches 80 CSS pixels, target 160 encoded pixels instead. Do not classify an image as tiny solely from its size in the original Figma frame.
3. Avoid upscaling, stretching, or unrequested cropping. Export a larger master if the source cannot support the intended density; otherwise record the resolution limitation. Supply responsive variants when larger uses would otherwise make small screens download a needlessly large image.

## Compression defaults

These are project starting points, not guarantees of visual equivalence or fixed byte budgets. Quality refers to lossy WebP's 0–100 encoder setting; it is not a percentage of retained quality.

| Profile | Intended content/use | Starting setting |
| --- | --- | --- |
| `large` | Large photos, prominent imagery, subtle gradients or detail-sensitive content; conservative default when uncertain | Lossy quality 90 |
| `standard` | Ordinary photographic images | Lossy quality 80 |
| `tiny` | Small photographic avatars/thumbnails, typically no larger than 64 × 64 CSS pixels at their maximum use | Lossy quality 65 |
| `lossless` | Raster text, logos, flat artwork, crisp lines, or images where lossy artifacts remain visible | Lossless |

Use method 6 for compression effort, sharp RGB-to-YUV conversion for lossy output, and lossless alpha. Preserve ICC metadata if present; omit EXIF/XMP. Never flatten transparency. Stronger compression for tiny images is permitted only while faces and other identifying detail remain clear. Try higher quality when artifacts appear; quality 100 is still lossy, so use lossless when required.

## Automation

Use the WebM project's [libwebp](https://github.com/webmproject/libwebp) and its official [cwebp encoder](https://developers.google.com/speed/webp/docs/cwebp). This replaces the manual PNG → Mac WebP Converter step. `cwebp` must be available on PATH; on macOS it can be installed with `brew install webp` if absent.

```sh
# 40 CSS pixel avatar at 2×, after confirming its maximum use
node scripts/optimize-raster.mjs avatar.png avatar.webp --profile tiny --width 80

# Prominent image: preserve source dimensions unless a target width is known
node scripts/optimize-raster.mjs photo.png photo.webp --profile large

# Override quality after visual comparison
node scripts/optimize-raster.mjs photo.png photo-q95.webp --profile large --quality 95

# Crisp raster artwork
node scripts/optimize-raster.mjs artwork.png artwork.webp --profile lossless
```

The helper preserves aspect ratio when resizing, rejects upscaling and existing output paths, keeps the PNG unchanged, and reports dimensions, sizes, encoder version, and settings. Select the profile explicitly from the actual use; the helper cannot infer display size or approve visual quality.

## Verify and record

Compare PNG and WebP at the intended rendered size on a high-density display and at the largest supported illustration width. Inspect facial details, edges, gradients, colors, and transparency against the actual background. Inspect decoded pixels at 100% as a secondary artifact check. Raise quality or use lossless if the difference is distracting. Recheck the final Webflow image and crop after integration.

Compare bytes against the PNG master and, when resizing, a PNG at the same dimensions so resizing savings are not mistaken for compression savings. Do not force WebP if it is larger without a useful delivery reason; retain the PNG and record the exception. Avoid arbitrary byte targets that sacrifice appearance.

Record source/Figma node, master path, maximum CSS dimensions, pixel density, output dimensions, profile/quality, encoder version, source/output bytes, and visual verification in component notes. Ask about sizing only when the maximum use cannot be established; otherwise use these defaults and report them. This rule applies to new or revisited assets, not an unsolicited bulk conversion of existing images.
