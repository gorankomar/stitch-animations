import {build} from 'vite';
import fs from 'node:fs/promises';
const result=await build({configFile:false,build:{write:false,minify:true,lib:{entry:'src/embeds/revolving-credit.js',formats:['iife'],name:'RevolvingCredit'},rollupOptions:{output:{inlineDynamicImports:true}}}});
const output=Array.isArray(result)?result[0]:result;
await fs.mkdir('dist/embeds',{recursive:true});
await fs.writeFile('dist/embeds/revolving-credit-motion.html',`<script>${output.output.find(x=>x.type==='chunk').code}</script>`);
await fs.writeFile('dist/embeds/revolving-credit-styles.html',`<style>${await fs.readFile('src/embeds/revolving-credit.css','utf8')}</style>`);
