# Hero-only image versus HTML benchmark — 2026-10-20

Image page: https://stitch-website.webflow.io/tests/home-img
HTML page: https://stitch-website.webflow.io/tests/home-html

## Method and important qualification

Five valid runs per page per device profile: 20 total. Each run launches a fresh isolated Chrome browser; order alternates images and HTML within each numbered pair. Lighthouse 13.5.0 and official Chrome for Testing 155.0.8059.84 on macOS. Mobile uses Lighthouse default simulated throttling (150 ms RTT, 1,638.4 Kbps throughput, 4× CPU slowdown); desktop uses the default desktop preset. All 20 accepted runs completed with a numeric performance score and no run warnings. Medians are calculated separately for each metric, not from one selected run. KB means decimal bytes.

**Browser reduced-motion emulation was enabled equally for both pages.** Normal-animation diagnostic runs in Brave and official Chrome returned NO_FCP, although screenshots showed visible content. The normal trace contained a firstPaint event but no firstContentfulPaint. Both pages contain entrance reveal animations; reduced-motion emulation restored contentful paint metrics. This is strong evidence of animation-related metric interference, not proof of a particular browser bug. Failed diagnostics are excluded from all medians and preserved separately. These results compare the reduced-motion/static rendering path, not the normal-animation experience. No Webflow content, script or publishing changes were made. This is local Lighthouse, not Google-hosted PageSpeed Insights or field Core Web Vitals.

## Median results

| Profile / page | Score | FCP | LCP | Speed Index | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|
| mobile-images | 49 | 6.85 s | 13.43 s | 6.86 s | 392 ms | 0.00000 |
| mobile-html | 53 | 6.55 s | 13.28 s | 6.55 s | 428 ms | 0.00004 |
| desktop-images | 94 | 0.88 s | 1.30 s | 1.36 s | 0 ms | 0.00273 |
| desktop-html | 92 | 1.20 s | 1.20 s | 1.23 s | 0 ms | 0.00278 |

Speed Index measures visual progress across the viewport; lower is better. It is not an exact all-three-screens-ready timestamp. LCP candidates differ: mobile images selects Dashboard, desktop images selects Ledgers, while HTML selects the hero H1 in every run. A lower HTML LCP does not establish that all screens appeared sooner.

## All five results

| Profile / page | Run 1 score | Run 2 | Run 3 | Run 4 | Run 5 | Median |
|---|---:|---:|---:|---:|---:|---:|
| mobile-images | 38 | 50 | 49 | 49 | 51 | 49 |
| mobile-html | 33 | 53 | 55 | 77 | 45 | 53 |
| desktop-images | 96 | 92 | 94 | 96 | 92 | 94 |
| desktop-html | 68 | 96 | 94 | 92 | 88 | 92 |

## Transfer cost and DOM

| Profile / page | HTML document | Webflow CSS | Hero images | All fonts | Whole-page transfer | Requests | Elements |
|---|---:|---:|---:|---:|---:|---:|---:|
| mobile-images | 15.5 KB | 23.6 KB | 99.8 KB | 346.5 KB | 1419.2 KB | 80 | 58 |
| mobile-html | 41.7 KB | 27.5 KB | 0.0 KB | 404.0 KB | 1404.0 KB | 77 | 1268 |
| desktop-images | 15.4 KB | 23.8 KB | 139.1 KB | 346.6 KB | 1455.9 KB | 79 | 58 |
| desktop-html | 41.8 KB | 27.5 KB | 0.0 KB | 404.1 KB | 1404.4 KB | 77 | 1268 |

Native markup adds about 26.3 KB to the document and 3.8 KB to the Webflow stylesheets. It also introduces one additional ABCDiatype-Bold.woff2 font request, about 57.5 KB, absent from the image-only page. Thus the isolated native replacement costs approximately 88 KB including the extra font, versus about 100 KB of responsive hero images on mobile and 139 KB on desktop. Total-page median saving is about 15 KB mobile / 52 KB desktop. Differences between the component estimate and total saving reflect response headers and other third-party resource variation. If the full homepage already needs the same bold font elsewhere, its incremental cost should not be counted again. In the earlier full-homepage comparison both variants already loaded it.

The same groups of shared analytics, reCAPTCHA, webfonts and global scripts remain in these hero-only pages. The videos and other page sections are removed, but the audit still transfers around 1.4 MB. The isolated pages therefore remove major content noise without becoming a graphics-only benchmark.

## Rendering work

| Profile / page | Main-thread total | Style/layout | Paint/composite/render | Parse HTML/CSS |
|---|---:|---:|---:|---:|
| mobile-images | 1865 ms | 184 ms | 11 ms | 21 ms |
| mobile-html | 2158 ms | 251 ms | 47 ms | 30 ms |
| desktop-images | 486 ms | 44 ms | 4 ms | 5 ms |
| desktop-html | 529 ms | 65 ms | 16 ms | 8 ms |

These are whole-page measured CPU categories; do not add per-category medians and expect the total median to match. The HTML page adds 1,210 elements. Some analytics processing can vary with the DOM and run timing. Five runs reduce outlier influence but do not prove statistical significance.

## Conclusion

- Mobile median scores are 49 images versus 53 HTML. Speed Index is 6.86 versus 6.55 seconds, about 0.31 seconds / 4.6% faster for HTML. Mobile TBT is slightly higher for HTML (428 versus 392 ms).
- Desktop median scores are 94 images versus 92 HTML. Speed Index is 1.36 versus 1.23 seconds, about 0.13 seconds / 9.5% faster for HTML. Both have zero median TBT.
- These small and conflicting differences, together with overlapping run ranges, do not establish a decisive format winner. Images use less rendering work; HTML saves transfer bytes but adds a font dependency in this isolated setup.
- The experiment supports choosing native components for localization/editability/animation benefits without claiming a large proven load-speed advantage. Normal-animation performance remains unscored because of the NO_FCP diagnostics.
- Remaining scripts and font loading are materially larger than the graphics-format delta. A further graphics-only test would need a separately labelled equal treatment for those shared dependencies. No such resources were blocked or removed in these accepted runs.

## Files

`results.json` contains every valid run, settings, resource breakdown, LCP element, font URLs, CPU breakdown and medians/ranges. All 20 full JSON and HTML Lighthouse reports are stored here. `diagnostics/` contains invalid normal-animation attempts, excluded from results. The runner documents the common reduced-motion browser flag. It uses temporary paths for browser and output; adjust those paths if reproducing elsewhere.

Related background: [Lighthouse discussion of opacity and paint timing](https://github.com/GoogleChrome/lighthouse/issues/11603), [animation-related LCP diagnostic](https://github.com/GoogleChrome/lighthouse/issues/10869). These are context for investigation, not an identification of the precise cause in this site.
