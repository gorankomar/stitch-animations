#!/bin/zsh
export CHROME_PATH='/private/tmp/stitch-audit-browser/chrome/mac_arm-155.0.8059.84/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
for mode in mobile desktop applied; do
 for run in 1 2 3 4 5; do
  kinds=(images html)
  if (( run % 2 == 0 )); then kinds=(html images); fi
  for kind in "${kinds[@]}"; do
   spec="$mode-$kind-$run"
   if [[ "$kind" == images ]]; then target='https://stitch-website.webflow.io/tests/home-img'; else target='https://stitch-website.webflow.io/tests/home-html'; fi
   opts=()
   if [[ "$mode" == desktop ]]; then opts+=(--preset=desktop); fi
   if [[ "$mode" == applied ]]; then opts+=(--throttling-method=devtools); fi
   npm --cache /private/tmp/stitch-npm-cache exec --yes --package=lighthouse@13.5.0 -- lighthouse "$target" --only-categories=performance --output=json --output=html --output-path="/private/tmp/stitch-screens-only-comparison/$spec" --chrome-flags='--headless=new --no-first-run' --quiet "${opts[@]}" > "/private/tmp/stitch-screens-only-comparison/$spec.log" 2>&1
   echo "$spec exit=$?"
  done
 done
done
