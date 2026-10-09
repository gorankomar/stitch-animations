import { readFile, writeFile } from 'node:fs/promises';
const dir = 'src/embeds/';
const markup = (await readFile(`${dir}worldwide-markets-markup.html`, 'utf8')).replace(/https:\/\/cdn\.prod\.website-files\.com\/[^" ]+worldwide-markets-map\.svg/g, '/src/embeds/assets/worldwide-markets/map.svg');
const css = (await Promise.all(['animation-components.css', 'worldwide-markets-native.css', 'worldwide-markets-scoped.css'].map(file => readFile(dir + file, 'utf8')))).join('\n');
await writeFile('worldwide-markets.html', `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Worldwide Markets</title><style>body{margin:0;padding:32px;font-family:Arial;background:#fafafa}main{display:flex;gap:24px;align-items:start;flex-wrap:wrap}${css}</style></head><body><main>${[258,360,516].map(width => `<div style="width:${width}px">${markup}</div>`).join('')}</main><script type="module" src="/src/embeds/worldwide-markets.js"></script></body></html>`);
