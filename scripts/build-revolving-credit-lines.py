"""Assemble exact exported route layers without redrawing or optimizing them."""
from pathlib import Path
import re
root = Path('src/embeds')
parts = []
for index, name in enumerate(['route-base', 'route-pulse-a', 'route-pulse-b']):
    source = (root / 'assets/credit-products' / f'{name}-original.svg').read_text()
    inner = re.search(r'<svg[^>]*>(.*)</svg>', source, re.S).group(1)
    for identity in re.findall(r'id="([^"]+)"', inner):
        replacement = f'rc-{index}-' + re.sub(r'[^a-zA-Z0-9_-]', '-', identity)
        inner = inner.replace(f'id="{identity}"', f'id="{replacement}"').replace('#' + identity, '#' + replacement)
    inner = re.sub('<path ', f'<path data-rc-route="{index}" ', inner, count=1)
    parts.append('<g transform="translate(83.25 189.637) rotate(-90)">' + inner + '</g>')
svg = '<svg class="rc-route-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 278" width="540" height="278" fill="none" aria-hidden="true">' + ''.join(parts) + '</svg>'
(root / 'revolving-credit-lines.html').write_text(svg)
