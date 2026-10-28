# Static hero image versus HTML benchmark — 2026-10-20

Image page: https://stitch-website.webflow.io/tests/home-img
HTML page: https://stitch-website.webflow.io/tests/home-html

## Scope and method

30 successful cold-load Lighthouse audits: five runs per page for each of three profiles. All completed with numeric performance scores and no warnings. No forced reduced-motion preference, no resource blocking, no JavaScript disabling and no website changes. This follow-up uses the user-updated pages with entrance animations disabled. It supersedes the previous reduced-motion experiment for these updated pages.

Lighthouse 13.5.0 with official Chrome for Testing 155.0.8059.84. Fresh isolated browser per audit. Each numbered pair alternates page order: images first on odd-numbered pairs, HTML first on even pairs. Mobile viewport 412×823, DPR 1.75; desktop 1350×940, DPR 1. The standard mobile profile uses Lighthouse simulated Slow 4G with 4× CPU slowdown. The supplementary mobile profile applies DevTools throttling during the navigation, using the same configured mobile profile (request latency 562.5 ms, download 1,474.56 Kbps, upload 675 Kbps, 4× CPU slowdown). Simulation and directly applied throttling are different methods; compare formats within a method, not absolute scores across methods. This is local Lighthouse, not Google-hosted PageSpeed Insights or field data.

Both page HTML source snapshots were byte-identical at the start and end; SHA-256 values are saved in source-provenance.json. The external script URL lists match between pages. Both include the same global tracking/authentication/analytics/font scripts; no video or unrelated page sections remain. CSS page bundles differ as expected for the native components. The snapshots still contain inert reveal target attributes but have no activating data-anim root attributes. Normal paint metrics were recorded in every accepted audit.

Medians below are calculated separately for each metric. They need not correspond to one individual run. KB uses decimal bytes.

## Median results

| Profile / format | Score | FCP | LCP | Speed Index | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|
| Mobile, simulated / images | 75 | 2.515 s | 4.496 s | 3.556 s | 306.5 ms | 0.00000 |
| Mobile, simulated / html | 70 | 3.371 s | 3.899 s | 3.728 s | 272.5 ms | 0.00004 |
| Desktop, simulated / images | 96 | 0.880 s | 1.153 s | 1.271 s | 0.0 ms | 0.00273 |
| Desktop, simulated / html | 97 | 0.999 s | 0.999 s | 1.162 s | 0.0 ms | 0.00627 |
| Mobile, directly throttled / images | 91 | 1.842 s | 1.923 s | 2.086 s | 302.7 ms | 0.00000 |
| Mobile, directly throttled / html | 87 | 1.917 s | 1.917 s | 2.124 s | 319.9 ms | 0.00004 |

LCP selects different content. Every HTML run selects the H1 headline. Mobile image runs select Dashboard; desktop image runs select Ledgers. A lower HTML LCP does not prove that all native screens finish sooner. Speed Index is a whole-viewport visual-progress measure, not an exact three-screens-ready timestamp.

## Five-run variability

| Profile / format | Run 1 score | Run 2 | Run 3 | Run 4 | Run 5 | Speed Index min–max |
|---|---:|---:|---:|---:|---:|---|
| mobile-images | 53 | 75 | 75 | 87 | 52 | 2.641–6.226 s |
| mobile-html | 56 | 75 | 70 | 56 | 84 | 2.877–6.475 s |
| desktop-images | 96 | 88 | 98 | 96 | 94 | 1.155–1.504 s |
| desktop-html | 99 | 97 | 79 | 97 | 96 | 0.789–1.998 s |
| applied-images | 92 | 91 | 91 | 91 | 91 | 2.013–2.154 s |
| applied-html | 91 | 86 | 90 | 87 | 82 | 2.074–2.320 s |

Paired Speed Index differences (HTML minus images; positive means HTML slower):
- Mobile, simulated: +249 ms, +1087 ms, -559 ms, +2910 ms, -3233 ms; paired median +249 ms.
- Desktop, simulated: -470 ms, -342 ms, +843 ms, -91 ms, -175 ms; paired median -175 ms.
- Mobile, directly throttled: +84 ms, +111 ms, +166 ms, -12 ms, -1 ms; paired median +84 ms.

The simple difference between the two directly throttled group medians is 38 ms; the median of the five paired differences is 84 ms. These are different valid summaries. Three of five directly throttled pairs favour images and two favour HTML. This is not a decisive overall visual-loading win for either format. The standard simulated mobile results have much wider ranges than the directly throttled results.

## Published transfer sizes

| Profile / format | Document | Webflow CSS | Hero images | All fonts | Whole page | Requests | DOM elements |
|---|---:|---:|---:|---:|---:|---:|---:|
| mobile-images | 15.3 KB | 23.6 KB | 99.7 KB | 346.5 KB | 1413.2 KB | 78 | 56 |
| mobile-html | 41.3 KB | 27.3 KB | 0.0 KB | 404.0 KB | 1402.2 KB | 76 | 1266 |
| desktop-images | 15.3 KB | 23.4 KB | 139.2 KB | 346.6 KB | 1452.8 KB | 78 | 56 |
| desktop-html | 41.3 KB | 27.0 KB | 0.0 KB | 404.2 KB | 1400.9 KB | 75 | 1266 |
| applied-images | 15.3 KB | 23.6 KB | 99.8 KB | 346.5 KB | 1412.7 KB | 78 | 56 |
| applied-html | 41.3 KB | 27.6 KB | 0.0 KB | 404.0 KB | 1400.2 KB | 76 | 1266 |

Native markup adds about 26 KB to the compressed document and about 4 KB to Webflow CSS. It removes three raster image requests (about 100 KB mobile / 139 KB desktop). Native also requires an additional ABCDiatype-Bold.woff2 font, about 58 KB. Thus the isolated native replacement has about 88 KB of incremental transfer including its extra font, rather than the markup/CSS-only estimate of about 30 KB. Actual whole-page median savings are roughly 11–13 KB mobile and 52 KB desktop. Third-party/header variation explains small differences between the resource delta and page-total delta. On a full homepage already using that font elsewhere, it should not be counted again as a new dependency. The tested pages load around 1.4 MB overall, mostly shared resources outside the graphics delta.

## Directly throttled timeline and late font swaps

| Resource/timeline event | Images | HTML |
|---|---:|---:|
| First Contentful Paint | 1.842 s | 1.917 s |
| Speed Index (visual-progress integral) | 2.086 s | 2.124 s |
| Last recorded visible change, whole viewport | 6.961 s | 7.055 s |
| Headline font download complete | 6.947 s | 7.035 s |
| ABCDiatype platform/body font downloads complete | 6.175 s | 6.716 s |
| All three raster image downloads complete | 4.564 s | Not applicable (inline markup/SVG) |

The final visible changes are around seven seconds under this applied mobile profile, not two seconds. The headline webfont finishes at approximately the same time: about 6.95 s images / 7.03 s HTML. The font events and filmstrip indicate late font swaps, even with entrance animations disabled. Image assets and native fallback text can be visible earlier than final font-correct rendering. Native platform/body font readiness is about 6.72 s, while all three raster assets finish around 4.56 s. These network end times establish resource availability, not exact paint times. The native inline SVG content has no corresponding image download. The native visual-progress integral does not establish all native fonts are ready by 2.12 seconds.

For simulated profiles, raw trace resource/visual times come from the unthrottled host capture, whereas headline metrics are simulated. Do not compare their raw trace times to the directly throttled timeline. The supplementary directly throttled profile avoids this ambiguity: its capture is actually network/CPU throttled.

## Rendering cost

| Profile / format | Total main-thread work | Style/layout | Paint/composite/render | Parse HTML/CSS |
|---|---:|---:|---:|---:|
| mobile-images | 1857 ms | 168 ms | 18 ms | 30 ms |
| mobile-html | 1937 ms | 216 ms | 57 ms | 46 ms |
| desktop-images | 462 ms | 43 ms | 4 ms | 8 ms |
| desktop-html | 484 ms | 59 ms | 14 ms | 11 ms |
| applied-images | 1596 ms | 154 ms | 25 ms | 18 ms |
| applied-html | 1914 ms | 259 ms | 93 ms | 27 ms |

Native adds 1,210 DOM elements. In applied mobile runs, median total main-thread work rises from about 1.60 to 1.91 seconds; style/layout from 154 to 259 ms and painting from 25 to 93 ms. These are whole-page measured categories, including common scripts and their DOM-dependent work, not isolated component microbenchmarks. The transferred byte saving does not remove this rendering cost. Desktop median total main-thread work differs by about 22 ms. Category medians need not add up to the total median.

## Conclusion

Overall visual loading is close. Standard simulated mobile scores favour images (75 vs 70), desktop scores favour HTML very slightly (96 vs 97), and applied mobile scores favour images (91 vs 87). Directly throttled Speed Index is 2.086 vs 2.124 seconds, just 38 ms apart by group medians; final recorded visual changes are 6.961 vs 7.055 seconds, 94 ms apart. These results do not support a large speed advantage for native graphics. Images use less rendering work; HTML saves transfer bytes and preserves editing/localization/animation flexibility. Font delivery is a clear remaining optimization opportunity, especially if the native bold font would otherwise be new. No recommendation here requires replacing components solely on the basis of these small loading differences.

No warm-cache repeat-navigation, non-English locale, real-user INP or field percentile test was performed. This report covers the supplied static English staging pages on the documented cold-load profiles. No scripts, CSS, markup, Webflow settings or published content were modified during testing.

All 30 complete HTML/JSON Lighthouse reports, structured per-run results, source snapshots, hashes, runner and aggregation code are stored beside this document.
