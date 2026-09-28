import {readFile,writeFile,mkdir} from 'node:fs/promises';
const css=await readFile('src/embeds/create-card.css','utf8');
const markup=await readFile('src/embeds/create-card-markup.html','utf8');
const style=`<style>${css}</style>`;
await mkdir('dist/embeds',{recursive:true});
await writeFile('dist/embeds/create-card-styles.html',style);
await writeFile('create-card.html',`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Create New Card</title><link href="https://fonts.googleapis.com/css2?family=Inconsolata&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">${style}</head><body style="margin:0;padding:40px 20px;background:white"><main style="max-width:516px;margin:auto">${markup}</main><script type="module" src="/src/embeds/create-card.js"></script></body></html>`);
console.log('Built create card styles and preview');
