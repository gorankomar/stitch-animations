import fs from 'node:fs/promises';
import { build } from 'esbuild';

const q = n => `${+(n / 5.4).toFixed(7)}cqi`;
const documents = [
  ['Consumer', 'user', ['Identity record', 'Address proof', 'Credit report', 'Consent form', 'KYC summary', 'Profile review']],
  ['Employment', 'luggage', ['Offer letter', 'Contract (2024)', 'HR reference', 'Service record', 'Work permit']],
  ['Income', 'bank-note', ['Payslip (Jan)', 'Payslip (Feb)', 'Tax return', 'Salary letter', 'Bonus record', 'W-2 (2024)', '1099 (2024)']],
  ['Assets', 'bank', ['Bank statement', 'Savings record', 'Property deed', 'Portfolio', 'Asset summary', 'Valuation']],
  ['Docs', 'file', ['W-2 (2024)', '1099 (2024)', 'Tax return', 'ID copy', 'Statement']]
];
let html = '<div class="workflow-flexibility" data-workflow-flexibility="" role="img" aria-label="Workflow Flexibility: Consumer, Employment, Income, Assets and Docs"><div class="wfx-frame" data-wfx-frame=""><div class="wfx-grid features-graphic_grid-bg" aria-hidden="true"></div>';
documents.forEach(([name, icon, docs], i) => {
  html += `<div class="wfx-window wfx-slot-${i}" data-wfx-window="${name}"><div class="wfx-label${i === 0 ? ' wfx-label-raised' : ''}" data-wfx-label=""><div class="wfx-label-icon${i===0?' wfx-icon-raised':''}" data-wfx-icon="${icon}"></div><p class="wfx-label-text">${name}</p></div><div class="wfx-documents">`;
  docs.forEach(text => { html += `<div class="wfx-document"><p class="wfx-document-name">${text}</p><div class="wfx-download" data-wfx-icon="download" aria-hidden="true"></div></div>`; });
  html += '</div></div>';
});
html += '<div class="wfx-bottom-fade" aria-hidden="true"></div></div></div>';
const css = `
.workflow-flexibility{width:100%;min-width:0}
.wfx-frame{position:relative;width:100%;height:${q(395)};overflow:hidden;border-radius:${q(8)};background-image:linear-gradient(226deg,rgba(231,231,231,.37),rgba(255,255,255,.37) 51.725%,rgba(231,231,231,.37)),linear-gradient(90deg,#fff,#fff)}
.wfx-grid{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
.wfx-window{position:absolute;left:50%;transform:translateX(-50%);height:${q(273)};box-sizing:border-box;border:${q(1)} solid #e7e7e7;border-radius:${q(12)};background-image:linear-gradient(0deg,#f2f2f2,#fff);box-shadow:0 ${q(10)} ${q(20)} rgba(0,0,0,.1)}
${[ [277,127], [331,160], [389,196], [448,232], [502,272] ].map(([w,t],i)=>`.wfx-window.wfx-slot-${i}{width:${q(w)};top:${q(t)};z-index:${i+1}${i===4?`;height:${q(311)}`:''}}`).join('\n')}
.wfx-label{position:absolute;left:50%;top:${q(6)};transform:translateX(-50%);display:flex;align-items:center;gap:${q(6)};padding:${q(5)};border:${q(1)} solid transparent;border-radius:${q(4)};color:#454545;font-size:${q(10)};line-height:1.2;font-weight:500;white-space:nowrap}
.wfx-label.wfx-label-raised{top:${q(-18)};padding:${q(10)};gap:${q(10)};background-color:#3d3d3d;border-color:#efefef;border-radius:${q(8)};font-size:${q(12)};color:#fff}
.wfx-label-text{margin:0}
.wfx-label-icon.wfx-icon-raised{width:${q(16)};height:${q(16)};padding:${q(2)};box-sizing:border-box;border-radius:100%;background-color:#fff}
.wfx-label-icon{color:#454545;display:flex;align-items:center;justify-content:center;width:${q(12)};height:${q(12)};flex-shrink:0}
.wfx-documents{position:absolute;left:50%;top:${q(48)};transform:translateX(-50%);width:${q(305)};display:flex;flex-wrap:wrap;justify-content:center;gap:${q(11)}}
.wfx-document{display:flex;align-items:center;justify-content:center;gap:${q(10)};padding:${q(6)} ${q(8)};border:${q(1)} solid #e7e7e7;border-radius:${q(4)};background-image:linear-gradient(34deg,#f2f2f2 31.868%,#fff 66.117%)}
.wfx-document-name{margin:0;padding:${q(2)} ${q(6)};border-radius:${q(20)};background-color:#fff;color:#5d5d5d;font-size:${q(8)};line-height:${q(14)};font-weight:500;white-space:nowrap}
.wfx-download{display:flex;align-items:center;justify-content:center;width:${q(12)};height:${q(12)};flex-shrink:0;color:#5d5d5d}
.wfx-bottom-fade{position:absolute;left:0;top:0;width:100%;height:100%;z-index:6;pointer-events:none;background-image:linear-gradient(180deg,rgba(255,255,255,0) 73.273%,#fff 110.3%)}
`;
const scoped = '.workflow-flexibility{container-type:inline-size;writing-mode:horizontal-tb}[data-workflow-flexibility] .wfx-grid{--grid-size:9.2592593cqi;--grid-line:.1851852cqi}';
await fs.writeFile('src/embeds/workflow-flexibility-markup.html', html);
await fs.writeFile('src/embeds/workflow-flexibility-native.css', css);
await fs.writeFile('src/embeds/workflow-flexibility-scoped.css', scoped);
const bundle=await build({entryPoints:['src/embeds/workflow-flexibility.js'],bundle:true,format:'iife',minify:true,write:false,target:'es2020'});
await fs.mkdir('dist/embeds',{recursive:true});
await fs.writeFile('dist/embeds/workflow-flexibility-motion.html',`<script data-workflow-flexibility-draft-runtime>\n${bundle.outputFiles[0].text}\n</script>`);
// Local previews use the untouched source SVGs. Webflow uses existing icon components.
for (const icon of ['user','luggage','bank-note','bank','file','download']) {
  html = html.replaceAll(`data-wfx-icon="${icon}"></div>`, `data-wfx-icon="${icon}"><img src="/src/embeds/assets/workflow-flexibility/originals/${icon}.svg" alt="" style="width:${q(12)};height:${q(12)};display:block"></div>`);
  html = html.replaceAll(`data-wfx-icon="${icon}" aria-hidden="true"></div>`, `data-wfx-icon="${icon}" aria-hidden="true"><img src="/src/embeds/assets/workflow-flexibility/originals/${icon}.svg" alt="" style="width:${q(12)};height:${q(12)};display:block"></div>`);
}
await fs.writeFile('workflow-flexibility.html', `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Workflow Flexibility</title><style>:root{--motion-duration-default:770ms;--motion-ease-primary:cubic-bezier(.11,.61,.27,.99)}body{font-family:Arial,sans-serif;background:#fafafa;margin:24px}main{display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap}.preview{width:540px;max-width:100%}.small{width:270px}${css}${scoped}.features-graphic_grid-bg{background:radial-gradient(140% 120% at 0 0,#e6e6e6,rgba(251,251,251,.35) 55%,transparent);mask-image:repeating-linear-gradient(to right,#000 0,#000 var(--grid-line),transparent var(--grid-line),transparent var(--grid-size)),repeating-linear-gradient(to bottom,#000 0,#000 var(--grid-line),transparent var(--grid-line),transparent var(--grid-size))}</style></head><body><main><section class="preview">${html}</section><section class="preview small">${html}</section></main><script type="module" src="/src/embeds/workflow-flexibility.js"></script></body></html>`);
