# Screen-only comparison, fonts unchanged — 2026-10-20

Images: https://stitch-website.webflow.io/tests/home-img
HTML: https://stitch-website.webflow.io/tests/home-html

## Scope and method

The user removed the left headline/description/button block from both test pages. Both source snapshots confirm the previous headline is absent. Fonts were deliberately left unchanged for this baseline. There were no Webflow edits, script blocking, forced reduced-motion settings or publication actions by the agent.

30 valid cold-load audits: five per page in each of three profiles. Lighthouse 13.5.0 and official Chrome for Testing 155.0.8059.84. Fresh isolated browser per audit; page order alternates AB/BA by numbered pair. Mobile viewport 412×823 at DPR 1.75, desktop 1350×940 at DPR 1. Standard mobile uses Lighthouse simulated Slow 4G/4× CPU; desktop uses the default desktop preset. Supplementary mobile applies DevTools throttling during loading (562.5 ms request latency, 1,474.56 Kbps download, 675 Kbps upload, 4× CPU). Compare formats within each profile rather than comparing scores across methods. This is local Lighthouse, not Google-hosted PageSpeed Insights or real-user field data.

All 30 accepted runs have numeric scores and no warnings. Both source bodies were byte-identical at the start and end; hashes are saved in source-provenance.json. Values are per-metric medians, not all from a single selected run. KB is decimal.

## Median audit results

| Profile / format | Score | FCP | LCP | Speed Index | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|
| Mobile, simulated / images | 55 | 5.171 s | 12.373 s | 5.241 s | 280.5 ms | 0.00000 |
| Mobile, simulated / html | 80 | 3.075 s | 3.483 s | 3.075 s | 285.5 ms | 0.00004 |
| Desktop, simulated / images | 97 | 0.825 s | 0.986 s | 1.217 s | 0.0 ms | 0.00000 |
| Desktop, simulated / html | 85 | 1.520 s | 1.520 s | 1.520 s | 0.0 ms | 0.00364 |
| Mobile, directly throttled / images | 92 | 1.718 s | 1.938 s | 1.987 s | 295.1 ms | 0.00000 |
| Mobile, directly throttled / html | 92 | 1.877 s | 1.877 s | 2.106 s | 302.7 ms | 0.00004 |

## LCP is still not equivalent

Every native-page diagnostic selects the text “Your current activity summary.” inside the Dashboard screen. Mobile images select Dashboard; desktop images select Ledgers. Removing the external headline therefore does not make LCP measure the same content in both versions. LCP selects individual eligible images/text blocks; it does not aggregate the native screen into a single image-equivalent candidate. Inline SVG graphics are not whole-element LCP candidates. [Google’s LCP definition](https://web.dev/articles/lcp) explains eligibility. The reported native LCP should not be interpreted as the moment every screen reaches its final font-correct appearance.

## Directly throttled mobile: initial visibility versus final appearance

| Metric/event | Images | HTML |
|---|---:|---:|
| First Contentful Paint | 1.718 s | 1.877 s |
| Speed Index, visual progress | 1.987 s | 2.106 s |
| LCP, different candidates | 1.938 s | 1.877 s |
| Last recorded visible change, whole viewport | 4.047 s | 6.408 s |
| ABCDiatype font downloads complete | 4.560 s | 6.365 s |
| All three raster image downloads complete | 4.010 s | Not applicable |

The group-median Speed Index difference is 119 ms (HTML later); initial progress is close. Last recorded visual changes differ by 2.361 seconds: images 4.047 s, HTML 6.408 s. Images’ last hero asset finishes at about 4.010 s, while native platform fonts finish about 6.365 s. These resource completions closely align with the later filmstrip changes. Network completion is resource availability, not itself an exact paint timestamp. The timing and filmstrips support late font swaps as the main reason native final appearance settles later in this setup. Native fallback text and SVG content can be visible earlier, so the 6.408-second value does not mean the screen is blank until then.

All directly throttled pairs, preserving every run:

| Pair | Images SI | HTML SI | Images last visible change | HTML last visible change |
|---|---:|---:|---:|---:|
| 1 | 2.007 s | 2.106 s | 4.001 s | 6.408 s |
| 2 | 1.908 s | 2.233 s | 3.858 s | 6.511 s |
| 3 | 2.028 s | 2.082 s | 4.047 s | 6.389 s |
| 4 | 1.987 s | 2.075 s | 4.143 s | 6.385 s |
| 5 | 1.912 s | 3.674 s | 4.055 s | 7.973 s |

For simulated profiles, raw capture/resource times are recorded on the unthrottled host and must not be mixed with simulated headline timings. The table above uses the directly applied profile, where observed visual and network times share the actual throttled timeline. Speed Index is an integral of visual progress, not a three-screens-complete timestamp. Last visible change is a filmstrip observation, not a new standardized Core Web Vital or a proof of all background requests finishing.

## Transfer sizes and changed font baseline

| Profile / format | Document | Webflow CSS | Hero images | All fonts | Total page | Requests | DOM elements |
|---|---:|---:|---:|---:|---:|---:|---:|
| mobile-images | 15.1 KB | 22.9 KB | 99.7 KB | 213.2 KB | 1278.1 KB | 75 | 47 |
| mobile-html | 41.1 KB | 26.7 KB | 0.0 KB | 329.7 KB | 1323.9 KB | 74 | 1257 |
| desktop-images | 15.1 KB | 22.8 KB | 139.1 KB | 213.3 KB | 1317.5 KB | 75 | 47 |
| desktop-html | 41.1 KB | 26.7 KB | 0.0 KB | 329.8 KB | 1324.8 KB | 74 | 1257 |
| applied-images | 15.1 KB | 22.8 KB | 99.7 KB | 213.2 KB | 1277.1 KB | 76 | 47 |
| applied-html | 41.1 KB | 26.8 KB | 0.0 KB | 329.7 KB | 1323.9 KB | 75 | 1257 |

The image page now requests ABCDiatype Regular but not Medium/Bold. Native needs all three weights. Relative to the image page, native adds about 26 KB compressed HTML, 4 KB CSS and 116.5 KB fonts, while removing approximately 99.7 KB mobile / 139.1 KB desktop raster images. Native is therefore about 47 KB heavier on directly throttled mobile and about 7 KB heavier on desktop in this screen-only setup. Removing the left block removed a previously shared medium-font requirement on the image page, so the extra native-font cost is larger than the previous 58 KB experiment. The approximately 30 KB markup/CSS estimate remains accurate; it never included all incremental font dependencies.

The roughly 1.28–1.32 MB page totals include shared analytics, reCAPTCHA, webfont and other global scripts; these were not blocked. The three images share connections and can overlap their downloads; three requests should not be treated as three fully sequential round trips. Native removes three image requests but introduces two extra font files in this configuration. Dynamic tracking requests cause small variation in total request counts. On the full homepage, any font weight already required by other content should not be counted again as an incremental screen dependency. This isolated first-load baseline must not be generalized to a font-cached repeat visit.

## Five-run scores and variability

| Profile / format | Run 1 | Run 2 | Run 3 | Run 4 | Run 5 | SI min–max |
|---|---:|---:|---:|---:|---:|---|
| mobile-images | 53 | 55 | 56 | 54 | 76 | 3.523–5.501 s |
| mobile-html | 66 | 86 | 80 | 53 | 80 | 2.653–6.946 s |
| desktop-images | 97 | 98 | 94 | 98 | 97 | 0.881–1.497 s |
| desktop-html | 83 | 89 | 93 | 85 | 83 | 1.137–1.808 s |
| applied-images | 92 | 89 | 92 | 92 | 93 | 1.908–2.028 s |
| applied-html | 92 | 91 | 92 | 92 | 77 | 2.075–3.674 s |

The simulated mobile scores favour native (80 vs 55), desktop favours images (97 vs 85), and directly throttled mobile scores tie at 92. Different LCP candidates, paint scheduling, shared scripts and network/server timing make a single score insufficient to rank final visual readiness. The directly observed font/filmstrip timeline is more specific to the user’s question about when this static composition stops visibly changing. Five samples provide a robust median against isolated outliers, not a proof of statistical significance across all devices or networks.

## Rendering work

| Profile / format | Main thread | Style/layout | Painting/compositing | Parse HTML/CSS |
|---|---:|---:|---:|---:|
| mobile-images | 1764 ms | 156 ms | 10 ms | 32 ms |
| mobile-html | 1911 ms | 235 ms | 53 ms | 40 ms |
| desktop-images | 454 ms | 38 ms | 3 ms | 8 ms |
| desktop-html | 485 ms | 62 ms | 15 ms | 11 ms |
| applied-images | 1516 ms | 143 ms | 18 ms | 16 ms |
| applied-html | 1766 ms | 247 ms | 83 ms | 25 ms |

Native adds 1,210 DOM elements. The CPU figures are whole-page categories and include shared scripts and DOM-dependent work; they are not isolated component microbenchmarks. Category medians need not sum to the total median.

## Conclusion and frozen baseline

With the current fonts, initial visual progress is close, but images reach their final appearance about 2.36 seconds earlier in the directly throttled mobile filmstrips. Native does not currently win on total transfer size in this isolated screen-only setup because two additional font weights outweigh its compressed markup/CSS saving. The LCP targets remain different. This is the preserved pre-font-optimization baseline; no font or component changes were made. A later font-optimized comparison should keep these layouts and repeat the same profiles, while identifying which font files/weights changed.

All 30 complete Lighthouse HTML/JSON reports, results.json, exact source snapshots/hashes, runner and aggregation script are saved here. No warm-cache, other-language or field INP test was performed.
