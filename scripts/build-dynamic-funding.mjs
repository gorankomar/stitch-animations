import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
// Draft-only runtime; remove when this feature is released through page-all-lite.
const result=await build({entryPoints:['src/embeds/dynamic-funding.js'],bundle:true,format:'iife',minify:true,write:false,target:'es2020'});
await mkdir('dist/embeds',{recursive:true});
await writeFile('dist/embeds/dynamic-funding-motion.html',`<script data-df-draft-runtime>\n${result.outputFiles[0].text}\n</script>\n`);
