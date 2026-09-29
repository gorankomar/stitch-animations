import {readFile,writeFile,mkdir} from 'node:fs/promises';
const css=await readFile('src/embeds/secure-auth.css','utf8');
const markup=await readFile('src/embeds/secure-auth-markup.html','utf8');
await mkdir('dist/embeds',{recursive:true});
await writeFile('dist/embeds/secure-auth-styles.html',`<style>${css}</style>`);
await writeFile('secure-auth.html',`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>3D Secure Authentication</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>${css}</style></head><body style="margin:0;padding:40px 20px;background:white"><main style="max-width:516px;margin:auto">${markup}</main><script type="module" src="/src/embeds/secure-auth.js"></script></body></html>`);
