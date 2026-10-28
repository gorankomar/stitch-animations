#!/bin/zsh
export CHROME_PATH='/private/tmp/stitch-audit-browser/chrome/mac_arm-155.0.8059.84/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
for mode in mobile desktop; do
 for run in 1 2 3 4 5; do
  for kind in images html; do
   spec="$mode-$kind-$run"
   if [[ "$kind" == images ]]; then target='https://stitch-website.webflow.io/tests/home-img'; else target='https://stitch-website.webflow.io/tests/home-html'; fi
   opts=()
   if [[ "$mode" == desktop ]]; then opts+=(--preset=desktop); fi
   npm --cache /private/tmp/stitch-npm-cache exec --yes --package=lighthouse@13.5.0 -- lighthouse "$target" --only-categories=performance --output=json --output=html --output-path="/private/tmp/stitch-hero-comparison/$spec" --chrome-flags='--headless=new --no-first-run --force-prefers-reduced-motion=reduce' --quiet "${opts[@]}" > "/private/tmp/stitch-hero-comparison/$spec.log" 2>&1
   echo "$spec exit=$?"
  done
 done
done
