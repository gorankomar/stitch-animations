import fs from 'node:fs/promises';
import {build} from 'esbuild';
const base='src/embeds/assets/3ds-enabled-security';
const assets=JSON.parse(await fs.readFile(`${base}/webflow-assets.json`,'utf8'));
const q=n=>`${+(n/5.4).toFixed(6)}cqi`;
const diameters=[488,380,264],names=['outer','middle','inner'];
let inside=names.map((name,i)=>`<div class="tds-ring tds-ring-${i}" data-tds-ring="${i}"><img class="tds-art tds-art-${i}" src="${assets[name].url}" alt=""></div>`).join('');
inside+=`<div class="tds-badge" data-tds-heartbeat=""><img class="tds-badge-art" src="${assets.badge.url}" alt=""></div><div class="tds-label"><p class="tds-title">3DS</p><p class="tds-subtitle">Enabled</p></div>`;
const markup=`<div class="tds-container" data-3ds-enabled-security="" role="img" aria-label="3DS-enabled security"><div class="tds-frame">${inside}</div></div>`;
const css=`.tds-container{width:100%;min-width:0;position:relative}.tds-frame{width:100%;aspect-ratio:540 / 278;position:relative;overflow:hidden;border-radius:${q(8)};background-image:linear-gradient(216.014772deg,rgba(231,231,231,.37),rgba(255,255,255,.37) 51.725%,rgba(231,231,231,.37) 106.43%),linear-gradient(90deg,#fff,#fff)}
.tds-ring{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none}
${diameters.map((d,i)=>`.tds-ring-${i}{width:${q(d)};height:${q(d)}}.tds-art-${i}{width:${(d+40)/d*100}%;height:${(d+40)/d*100}%;left:${-20/d*100}%;top:${-20/d*100}%}`).join('\n')}
.tds-art{display:block;position:absolute;max-width:none}.tds-badge{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${q(152)};height:${q(152)}}.tds-badge-art{display:block;width:100%;height:100%;max-width:none}.tds-label{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${q(82)};display:flex;flex-direction:column;row-gap:${q(8)};text-align:center;color:#4b4b4b}.tds-title{margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;font-family:inherit;font-size:${q(40)};line-height:${q(30)};font-weight:700}.tds-subtitle{margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;font-family:inherit;font-size:${q(20)};line-height:${q(20)};font-weight:500}.tds-motion-embed{display:none}`;
const scoped='<style>.tds-container{container-type:inline-size;writing-mode:horizontal-tb}</style>';
const {outputFiles}=await build({entryPoints:['src/embeds/3ds-enabled-security.js'],bundle:true,write:false,minify:true,format:'iife',target:'es2020'});
const motion=`<script>${outputFiles[0].text}</script>`;
await fs.mkdir('dist/embeds',{recursive:true});
for(const [path,value] of Object.entries({'src/embeds/3ds-enabled-security-markup.html':markup,'src/embeds/3ds-enabled-security-native.css':css,'dist/embeds/3ds-enabled-security-styles.html':scoped,'dist/embeds/3ds-enabled-security-motion.html':motion,'3ds-enabled-security.html':`<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>3DS-enabled security</title><style>body{margin:0;padding:40px;background:#fafafa;font-family:Arial,sans-serif}:root{--motion-ease-primary:cubic-bezier(.11,.61,.27,.99);--motion-duration-default:770ms}main{max-width:540px;margin:auto}${css}</style><main>${markup}</main>${scoped}${motion}</html>`}))await fs.writeFile(path,value);
