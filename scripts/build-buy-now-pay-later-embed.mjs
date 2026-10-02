import {build} from 'vite';
import fs from 'node:fs/promises';
const result=await build({configFile:false,build:{write:false,minify:true,lib:{entry:'src/embeds/buy-now-pay-later.js',formats:['iife'],name:'BuyNowPayLater'},rollupOptions:{output:{inlineDynamicImports:true}}}});
const output=Array.isArray(result)?result[0]:result;
await fs.mkdir('dist/embeds',{recursive:true});
await fs.writeFile('dist/embeds/buy-now-pay-later-motion.html',`<script>${output.output.find(x=>x.type==='chunk').code}</script>`);
await fs.writeFile('dist/embeds/buy-now-pay-later-styles.html',`<style>${await fs.readFile('src/embeds/buy-now-pay-later.css','utf8')}</style>`);
