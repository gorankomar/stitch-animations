import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {moduleScript} from './embed-module.mjs';
const css = await readFile('src/embeds/financial-graphic.css','utf8');
await mkdir('dist/embeds',{recursive:true});
await writeFile('dist/embeds/financial-graphic.html', `<style>${css}</style>\n${moduleScript('feature-financial')}`);
console.log('Built financial module embed');
