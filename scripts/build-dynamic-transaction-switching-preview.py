from pathlib import Path
import re
base=Path('src/embeds/assets/dynamic-transaction-switching')
html=Path('src/embeds/dynamic-transaction-switching-markup.html').read_text()
for name in ['giropay','visa','unionpay','mada','stitch','amex','stcpay','mastercard','stripe']:
 svg=(base/(name+'.svg')).read_text()
 if name=='mastercard': svg='<div class="preview-method">'+svg+'</div>'
 if name=='giropay': svg='<div class="preview-method">'+svg+'</div>'
 if name=='unionpay': svg='<div class="preview-method">'+svg+'</div>'
 if name=='stitch':
  svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 17" width="41.5" height="32" fill="currentColor"><path d="M0 16.9999h22v-4.2623H0zM0 4.26h22V0H0zm0 6.3451h22V8.4716H0z"/></svg>'
 html=html.replace('data-dts-logo="'+name+'"></div>','data-dts-logo="'+name+'">'+svg+'</div>')
Path('src/embeds/dynamic-transaction-switching-preview-markup.html').write_text(html)
css=Path('src/embeds/dynamic-transaction-switching-native.css').read_text()
css+='\n.dts-root{container-type:inline-size;writing-mode:horizontal-tb}.dts-dots>svg{width:100%;height:100%}.dts-frame [data-dts-logo]>svg,.preview-method>svg{width:100%;height:100%;object-fit:contain}.preview-method{width:100%;height:100%;background:#fff;border-radius:.74074cqi;display:flex;align-items:center;justify-content:center}.preview-method>svg{width:auto;height:auto;max-width:100%;max-height:100%}.dts-logo-stitch>svg{width:100%;height:100%}\n'
Path('dynamic-transaction-switching.html').write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dynamic transaction switching</title><style>*{box-sizing:border-box}body{margin:0;padding:24px;background:#e9e9ed;--motion-ease-primary:cubic-bezier(.11,.61,.27,.99);--motion-duration-default:770ms}main{width:min(540px,100%);margin:auto}'+css+'</style></head><body><main>'+html+'</main><script type="module" src="/src/embeds/dynamic-transaction-switching.js"></script></body></html>')
