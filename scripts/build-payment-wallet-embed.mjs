import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../',import.meta.url));
const result = await build({absWorkingDir:root,entryPoints:['src/embeds/payment-wallet.js'],bundle:true,write:false,minify:true,format:'iife',target:'es2020'});
const css = await readFile(new URL('../src/embeds/payment-wallet.css',import.meta.url),'utf8');
await mkdir(new URL('../dist/embeds/',import.meta.url),{recursive:true});
await writeFile(new URL('../dist/embeds/payment-wallet.html',import.meta.url), `<style>${css}</style>\n<script>${result.outputFiles[0].text}</script>`);
