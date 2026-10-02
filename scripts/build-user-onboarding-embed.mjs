import {build} from 'vite';
import fs from 'node:fs/promises';
const result=await build({configFile:false,build:{write:false,minify:true,lib:{entry:'src/embeds/user-onboarding.js',formats:['iife'],name:'UserOnboarding'},rollupOptions:{output:{inlineDynamicImports:true}}}});
const output=Array.isArray(result)?result[0]:result;
const code=output.output.find(x=>x.type==='chunk').code;
await fs.mkdir('dist/embeds',{recursive:true});
await fs.writeFile('dist/embeds/user-onboarding-motion.html',`<script>${code}</script>`);
await fs.writeFile('dist/embeds/user-onboarding-styles.html',`<style>${await fs.readFile('src/embeds/user-onboarding.css','utf8')}</style>`);
