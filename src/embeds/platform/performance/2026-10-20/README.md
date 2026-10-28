# Platform screen staging comparison — 2026-10-20

Image page: https://stitch-website.webflow.io/
Native page: https://stitch-website.webflow.io/home-test

## Method

Lighthouse 13.5.0, local headless Brave/Chromium 154 on macOS. Three sequential, alternating fresh-browser runs per page per profile (12 total). Default Lighthouse mobile simulated throttling (150 ms RTT, 1,638.4 Kbps throughput, 4× CPU slowdown); default desktop preset for desktop. No pages, scripts or releases were changed. These are local lab results, not Google-hosted PageSpeed Insights or field Core Web Vitals. All runs completed without runtime errors.

Values below are per-metric medians; they need not belong to the same individual run. KB uses decimal bytes.

| Profile / page | Score | FCP | LCP | Speed Index | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|
| mobile-images | 64 | 3.36 s | 3.82 s | 8.82 s | 405 ms | 0.0013 |
| mobile-html | 43 | 9.01 s | 17.01 s | 9.90 s | 532 ms | 0.0013 |
| desktop-images | 80 | 1.66 s | 1.94 s | 2.51 s | 0 ms | 0.0022 |
| desktop-html | 91 | 1.21 s | 1.21 s | 1.93 s | 43 ms | 0.0022 |

## Variability

| Profile / page | Individual performance scores |
|---|---|
| mobile-images | 77, 64, 43 |
| mobile-html | 33, 50, 43 |
| desktop-images | 72, 90, 80 |
| desktop-html | 84, 95, 91 |

## Published transfer and DOM comparison

| Profile / page | Document | Webflow CSS (shared + page) | Hero images | Total page transfer | DOM elements |
|---|---:|---:|---:|---:|---:|
| mobile-images | 57.6 KB | 33.1 KB | 99.7 KB | 10.92 MB | 1547 |
| mobile-html | 83.8 KB | 36.8 KB | 0.0 KB | 10.85 MB | 2757 |
| desktop-images | 57.6 KB | 33.1 KB | 139.1 KB | 10.97 MB | 1547 |
| desktop-html | 83.8 KB | 36.8 KB | 0.0 KB | 10.86 MB | 2757 |

The native page increases document transfer by about 26.2 KB and Webflow CSS by 3.7 KB, for approximately 30 KB added. It removes the three hero image requests. Desktop hero images transfer approximately 139 KB, while responsive mobile images transfer approximately 100 KB. Approximate net saving: 109 KB desktop and 70 KB mobile. This is a page-difference estimate, not a controlled resource substitution. Analytics and media downloads add variability to whole-page totals. No additional screen-specific font downloads were identified; both pages loaded the same font URL set.

## Interpretation and limits

- Native screens are smaller to transfer; this confirms the previous 30–35 KB estimate against published output. It does not establish a universal speed advantage.
- These as-served pages favour images in the mobile simulated score and HTML in the desktop score. Do not attribute the entire score or timing gap to the screen markup.
- Every LCP diagnostic identifies the same announcement-banner text, not the platform screenshots. Lighthouse LCP therefore is not a direct measurement of when all three screens finish appearing.
- Mobile simulated LCP medians are 3.82 s (images) and 17.01 s (native), but unthrottled trace-observed LCP medians are 2.21 s and 2.45 s. The latter are diagnostic trace observations on the host connection, NOT a substitute mobile test. This large simulation difference and wide image-page range warrant care interpreting the 17-second result.
- Document response time varies between runs; mobile image-page observed TTFB spans approximately 0.19–1.77 seconds. Identical browser settings do not remove CDN/server and third-party variability.
- Three videos account for roughly 8.8 MB of downloaded media in the first mobile run. Trackers, reCAPTCHA, fonts and animation scripts are also active. Total page payload is about 10.9 MB, so the screen-byte saving is below roughly 1% of total audit traffic. This does not mean all bytes are equally critical to initial rendering.
- The DOM grows from 1,547 to 2,757 elements (+1,210 / +78%). Desktop main-thread median grows from 874 to 1,130 ms; style/layout median from about 98 to 144 ms. These are whole-page measurements, not isolated screen costs. Mobile main-thread medians are nearly equal, about 4.31 versus 4.30 seconds.
- Visual screenshots in the reports show equivalent hero compositions, though the native content is intentionally editable and not pixel-identical.
- No measurements of the complete hero composition-ready time or real-user INP were collected. CLS is effectively the same in these runs.

## Recommendation

Keep the native implementation as a candidate for its localization/editing/animation benefits, but do not claim a demonstrated mobile speed win. For a causal comparison, repeat on two controlled staging clones with identical scripts/media and instrumentation for the hero-ready moment; retain the as-is tests as the end-to-end baseline. A separate controlled run may suppress unrelated analytics/media locally for BOTH variants, clearly labelled, without changing production.

Full reports for all 12 runs and structured per-run results are stored beside this document. Representative median-score runs: mobile-images-2, mobile-html-3, desktop-images-3, desktop-html-3.
