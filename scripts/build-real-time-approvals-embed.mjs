import {build} from 'vite';
import fs from 'node:fs/promises';
const result=await build({configFile:false,build:{write:false,minify:true,lib:{entry:'src/embeds/real-time-approvals.js',formats:['iife'],name:'RealTimeApprovals'},rollupOptions:{output:{inlineDynamicImports:true}}}});
const output=Array.isArray(result)?result[0]:result;
await fs.mkdir('dist/embeds',{recursive:true});
await fs.writeFile('dist/embeds/real-time-approvals-motion.html',`<script>${output.output.find(x=>x.type==='chunk').code}</script>`);
await fs.writeFile('dist/embeds/real-time-approvals-styles.html',`<style>${await fs.readFile('src/embeds/real-time-approvals.css','utf8')}</style>`);
