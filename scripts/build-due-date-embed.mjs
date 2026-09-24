import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {moduleScript} from './embed-module.mjs';
const css=await readFile('src/embeds/due-date-graphic.css','utf8');
const markup=await readFile('src/embeds/due-date-graphic-markup.html','utf8');
const style=`<style>.due_graphic,.due_graphic *{box-sizing:border-box}${css}</style>`;
await mkdir('dist/embeds',{recursive:true});
await writeFile('dist/embeds/due-date-graphic.html',`${style}${moduleScript('feature-due-date')}`);
await writeFile('due-date.html',`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Change Due Date</title><link href="https://fonts.googleapis.com/css2?family=Inconsolata&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"></head><body style="margin:0;padding:40px 20px;background:white"><main style="max-width:516px;margin:auto">${markup}</main>${style}<script type="module" src="/src/embeds/due-date-graphic.js"></script></body></html>`);
console.log('Built due date module embed and preview');
