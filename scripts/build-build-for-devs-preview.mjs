import { readFile, writeFile } from 'node:fs/promises';
const markup = await readFile('src/embeds/build-for-devs-markup.html', 'utf8');
const css = await readFile('src/embeds/build-for-devs.css', 'utf8');
const scoped = await readFile('src/embeds/build-for-devs-scoped.css', 'utf8');
await writeFile('build-for-devs.html', `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Build for Devs</title><style>body{font-family:Arial,sans-serif;margin:0;padding:30px;background:#f5f5f5}${css}${scoped}</style></head><body><main style="max-width:516px;margin:auto">${markup}</main><script type="module" src="/src/embeds/create-card.js"></script></body></html>`);
console.log('Built Build for Devs local preview using the existing Create New Card runtime');
