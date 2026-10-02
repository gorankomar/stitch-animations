import {build} from 'vite';
import fs from 'node:fs/promises';
import {moduleScript} from './embed-module.mjs';
const result=await build({configFile:false,build:{write:false,minify:true,lib:{entry:'src/embeds/credit-check.js',formats:['iife'],name:'CreditCheck'},rollupOptions:{output:{inlineDynamicImports:true}}}});
const output=Array.isArray(result)?result[0]:result;
await fs.mkdir('dist/embeds',{recursive:true});
await fs.writeFile('dist/embeds/credit-check-motion.html',process.env.STITCH_ASSET_BASE ? moduleScript('feature-credit-check') : `<script>${output.output.find(x=>x.type==='chunk').code}</script>`);
await fs.writeFile('dist/embeds/credit-check-styles.html',`<style>${await fs.readFile('src/embeds/credit-check.css','utf8')}</style>`);
