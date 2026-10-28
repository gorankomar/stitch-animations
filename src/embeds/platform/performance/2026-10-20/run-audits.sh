#!/bin/zsh
export CHROME_PATH='/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
for spec in mobile-html-1 mobile-images-2 mobile-html-2 mobile-images-3 mobile-html-3 desktop-images-1 desktop-html-1 desktop-images-2 desktop-html-2 desktop-images-3 desktop-html-3; do
  if [[ "$spec" == *images* ]]; then target='https://stitch-website.webflow.io/'; else target='https://stitch-website.webflow.io/home-test'; fi
  opts=()
  if [[ "$spec" == desktop* ]]; then opts+=(--preset=desktop); fi
  npm --cache /private/tmp/stitch-npm-cache exec --yes --package=lighthouse -- lighthouse "$target" --only-categories=performance --output=json --output=html --output-path="/private/tmp/stitch-page-comparison/$spec" --chrome-flags='--headless=new --disable-gpu --no-first-run' --quiet "${opts[@]}" > "/private/tmp/stitch-page-comparison/$spec.log" 2>&1
  echo "$spec exit=$?"
done
