"""Compose local preview from existing component snapshots; never deployed CSS."""
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
def extract(source, classname):
    match = re.search(r'<div\b[^>]*class="[^"]*\b' + re.escape(classname) + r'\b[^"]*"[^>]*>', source)
    if not match:
        raise ValueError(classname)
    depth = 0
    for token in re.finditer(r'<(/?)div\b[^>]*>', source[match.start():]):
        depth += -1 if token.group(1) else 1
        if depth == 0:
            return source[match.start():match.start() + token.end()]

base = extract((root / 'src/embeds/top-ups-preview-markup.html').read_text(), 'credit-card_wrap')
base = base.replace('class="credit-card_company-block"', 'class="credit-card_company-block w-condition-invisible"').replace('class="credit-card_type"', 'class="credit-card_type w-condition-invisible"')
base = base.replace('data-random="false"', 'data-random="true"')
graphic = (root / 'src/embeds/deposits-wallet-markup.html').read_text()
for classname, variant in [('dw-card-a', ''), ('dw-card-b', 'e1d76b2a-7322-d938-666a-66e1cd7a292f'), ('dw-card-c', 'e73ae07e-3c06-8a41-9896-4c934f3577ba')]:
    card = base.replace(' w-variant-5bfc8bd2-120a-7705-22f4-90beebf323aa', (' w-variant-' + variant) if variant else '')
    graphic = re.sub(r'(<div class="' + classname + r'"[^>]*>)</div>', lambda m: m.group(1) + card + '</div>', graphic)
screen = (root / 'src/embeds/deposits-wallet-screen.html').read_text()
wallet = extract((root / 'index.html').read_text(), 'deposits_wallet')
visa = extract(wallet, 'deposits_wallet-logo').replace('class="deposits_wallet-logo"', 'class="deposits_wallet-logo is-visa"')
mc_svg = re.search(r'<svg\b[^>]*class="credit-card_provider-logo is-mc"[^>]*>.*?</svg>', base, re.S).group(0)
mc_svg = mc_svg.replace('mc-path is-current-color', 'mc-path is-current-color w-variant-5633f55a-49ce-d580-0734-0a38ec61b20b').replace('mc-path is-original-color', 'mc-path is-original-color w-variant-5633f55a-49ce-d580-0734-0a38ec61b20b')
wallet = wallet.replace(extract(wallet, 'deposits_wallet-logo'), visa + '<div class="deposits_wallet-logo is-mc">' + mc_svg + '</div>')
for i, number in enumerate(['6463', '7788', '3215']):
    item = wallet.replace('6463', number)
    if i == 1:
        item = item.replace('deposits_wallet-logo is-visa', 'deposits_wallet-logo is-visa w-variant-88b4eacd-e316-74d0-ef5d-2221e89e5ef9').replace('deposits_wallet-logo is-mc', 'deposits_wallet-logo is-mc w-variant-88b4eacd-e316-74d0-ef5d-2221e89e5ef9')
    screen = re.sub(r'(<div class="dw-wallet-position"[^>]*data-dw-wallet="' + str(i) + r'"[^>]*>)</div>', lambda m: m.group(1) + item + '</div>', screen)
phone = (root / 'src/embeds/realistic-phone-markup.html').read_text().replace('<div class="rp-content"></div>', '<div class="rp-content">' + screen + '</div>')
graphic = re.sub(r'(<div class="dw-phone-position"[^>]*>)</div>', lambda m: m.group(1) + phone + '</div>', graphic)
# Existing check icon artwork from the repository.
check = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" fill="none" width="100%" height="100%" stroke-width="1"><path d="M8.33 2.5 3.75 7.08 1.67 5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>'
graphic = graphic.replace('<div class="dw-added-icon"></div>', '<div class="dw-added-icon">' + check + '</div>')
(root / 'src/embeds/deposits-wallet-preview-markup.html').write_text(graphic)
page = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Deposits — Digital Wallet</title><link rel="stylesheet" href="/src/embeds/top-ups-preview.css"><link rel="stylesheet" href="/src/embeds/realistic-phone-native.css"><link rel="stylesheet" href="/src/embeds/realistic-phone.css"><link rel="stylesheet" href="/src/embeds/deposits-wallet-native.css"><link rel="stylesheet" href="/src/embeds/deposits-wallet.css"><style>*{box-sizing:border-box}:root{--motion-ease-primary:cubic-bezier(.11,.61,.27,.99);--motion-duration-default:770ms;--reveal-stagger-default:200ms;--reveal-opacity-ratio:.34}body{padding:32px;font-family:Denim,Arial,sans-serif}main{display:flex;gap:32px;flex-wrap:wrap;align-items:flex-start}.sample{width:593px;max-width:100%}.small{width:320px}h1{font-size:20px}button{margin-bottom:20px}</style></head><body><h1>Deposits — Digital Wallet</h1><button id="replay">Replay reveal</button><main>'''
page = page.replace('<main>', '<label> Preview width <select id="width"><option>593</option><option>320</option><option>450</option><option>800</option></select></label><main>')
page += '<div class="sample">' + graphic + '</div><div class="sample small">' + graphic + '</div></main>'
(root / 'deposits-wallet-static-preview.html').write_text(page + '</body></html>')
page += '''<script type="module">import {init} from '/src/embeds/deposits-wallet.js';import '/src/embeds/realistic-phone-clock.js';let dispose=init();document.querySelector('#replay').onclick=()=>{dispose();dispose=init();};document.querySelector('#width').onchange=e=>document.querySelector('.sample').style.width=e.target.value+'px';if(new URLSearchParams(location.search).has('static'))dispose();window.depositPreview={init,dispose:()=>dispose()};</script></body></html>'''
(root / 'deposits-wallet-preview.html').write_text(page)
