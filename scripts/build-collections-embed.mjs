import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
const result = await build({entryPoints:['src/embeds/collections-graphic.js'],bundle:true,write:false,minify:true,format:'iife',target:'es2020'});
await mkdir('dist/embeds',{recursive:true});
await writeFile('dist/embeds/collections-graphic.html',`<script>${result.outputFiles[0].text}</script>`);
console.log('Built collections motion embed');
