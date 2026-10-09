import fs from 'node:fs/promises';
const {optimize}=await import(process.env.SVGO_MODULE || 'svgo');
const dir='src/embeds/assets/dynamic-transaction-switching';
const previous=JSON.parse(await fs.readFile('src/embeds/assets/issuer-routing/optimization.json','utf8'));
const config=previous.config;
const manifest=[];
for(const file of await fs.readdir(`${dir}/originals`)){
 const raw=await fs.readFile(`${dir}/originals/${file}`,'utf8');
 const data=optimize(raw,config).data;
 await fs.writeFile(`${dir}/${file}`,data);manifest.push({file,originalBytes:Buffer.byteLength(raw),optimizedBytes:Buffer.byteLength(data)});
}
await fs.writeFile(`${dir}/optimization.json`,JSON.stringify({version:'4.1.0',config,exceptions:['Preserve original xmlns, dimensions, gradients and viewBox. Inline references are namespaced per instance.'],manifest},null,2));
const svg=async(name)=>await fs.readFile(`${dir}/${name}.svg`,'utf8');
const cqi=n=>`${n/5.4}cqi`;
const css=[];const rule=(name,props)=>css.push(`.${name}{${Object.entries(props).map(([k,v])=>`${k}:${v}`).join(';')}}`);
rule('dts-root',{width:'100%','min-width':'0'});
rule('dts-frame',{position:'relative',width:'100%','aspect-ratio':'540 / 278',overflow:'hidden','border-radius':cqi(8),'background-image':'linear-gradient(216.01477deg,rgba(231,231,231,.37) 0%,rgba(255,255,255,.37) 51.725%,rgba(231,231,231,.37) 106.43%),linear-gradient(90deg,#fff,#fff)'});
rule('dts-dots',{position:'absolute',left:cqi(8),top:cqi(12),width:cqi(520),height:cqi(317.22176),'pointer-events':'none','background-image':'radial-gradient(circle,rgba(196,200,208,.26) .111111cqi,transparent .111111cqi)','background-size':'2.962963cqi 2.962963cqi'});
rule('dts-connectors',{position:'absolute',left:'0%',top:'0%',width:'100%',height:'100%','pointer-events':'none','z-index':'2'});
rule('dts-dots-canvas',{width:'100%',height:'100%',display:'block',opacity:'0'});
rule('dts-network-box',{position:'absolute',left:'0%',top:'0%',width:'100%',height:'100%',display:'flex','justify-content':'center','align-items':'center','border-width':cqi(1),'border-style':'solid','border-color':'#eaecf0','border-radius':cqi(6),'background-image':'linear-gradient(0deg,#f2f2f2,#fff)',opacity:'1','z-index':'1'});
const boxes=[['giropay',64,-38,.2],['visa',225,-39,1],['unionpay',386,-38,.2],['mada',64,94,1],['stitch',226,95,1],['amex',386,94,1],['stcpay',64,225,.2],['mastercard',225,227,1],['stripe',386,225,.2]];
let html='<div class="dts-root" data-dynamic-transaction-switching=""><div class="dts-frame" role="img" aria-label="Stitch dynamically routes transactions to payment networks">';
html+='<div class="dts-dots"><canvas class="dts-dots-canvas" data-dts-dots="" aria-hidden="true"></canvas></div>';
let connectors='<svg class="dts-connectors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 278" width="540" height="278" aria-hidden="true">';
const lines=[['right','translate(389.16667 136.33333) rotate(90)'],['left','translate(150.83333 141.66667) rotate(-90)'],['top','translate(267.33333 47.83333)'],['bottom','translate(272.66667 230.16667) rotate(180)'],['branch-top','translate(108.5 51)'],['branch-bottom','translate(109.5 225.5) rotate(180)'],['branch-top','translate(430.5 51)'],['branch-bottom','translate(431.5 225.5) rotate(180)']];
let serial=0;
for(const[name,transform]of lines){let art=await svg(name);const ids=[...art.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);for(const id of ids)art=art.replaceAll(`id="${id}"`,`id="dts-static-${serial}-${id}"`).replaceAll(`url(#${id})`,`url(#dts-static-${serial}-${id})`);serial++;connectors+=`<g transform="${transform}">${art.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g>`;}
const routes=[['left',270,139,153.5,139,0,1],['right',270,139,386.5,139,0,1],['top',270,139,270,50.5,0,1],['bottom',270,139,270,227.5,0,1],['left-top',109,139,109,51.5,1,.2],['left-bottom',109,139,109,225.5,1,.2],['right-top',431,139,431,51.5,1,.2],['right-bottom',431,139,431,225.5,1,.2]];
for(const[name,x,y,x2,y2,branch,alpha]of routes){const edge=branch?(y2<y?93:185):(x2===153.5?218:x2===386.5?322:y2===50.5?91:187);const distance=branch?46:Math.abs((x===x2?edge-y:edge-x));const length=Math.hypot(x2-x,y2-y);const stop=distance/length;
 connectors+=`<defs><linearGradient id="dts-gradient-${name}" gradientUnits="userSpaceOnUse" x1="${x}" y1="${y}" x2="${x2}" y2="${y2}"><stop offset="${stop}" stop-color="#666" stop-opacity="0"/><stop offset="1" stop-color="#afafaf" stop-opacity="${alpha}"/></linearGradient></defs><path data-dts-pulse="${name}" d="M${x} ${y} L${x2} ${y2}" fill="none" stroke="url(#dts-gradient-${name})" stroke-width="1.5" opacity="0"/>`;
}
connectors+='</svg>';html+=connectors;
for(const[name,x,y,alpha]of boxes){const center=name==='stitch',size=center?88:90;rule(`dts-box-${name}`,center?{position:'absolute',left:cqi(x),top:cqi(y),width:cqi(size),height:cqi(size),display:'flex','justify-content':'center','align-items':'center','border-width':cqi(1),'border-style':'solid','border-color':alpha<1||name==='visa'?'#9f9f9f':'#e7e7e7','border-radius':cqi(center?18:6),'background-image':'linear-gradient(0deg,#f2f2f2,#fff)',opacity:String(alpha),...(center||alpha<1?{'box-shadow':`0 ${cqi(10)} ${cqi(10)} rgba(0,0,0,.1)`}:{}),'z-index':'3'}:{position:'absolute',left:cqi(x),top:cqi(y),width:cqi(90),height:cqi(90),'z-index':'1'});
 if(center){rule('dts-stitch-tile',{width:cqi(64),height:cqi(64),'background-color':'#000','border-radius':cqi(8.96),display:'flex','justify-content':'center','align-items':'center',color:'#fff'});rule('dts-logo-stitch',{width:cqi(41.5),height:cqi(32*18/17),display:'flex','align-items':'center','justify-content':'center'});html+=`<div class="dts-box-stitch" data-dts-heartbeat=""><div class="dts-stitch-tile"><div class="dts-logo-stitch" data-dts-logo="stitch"></div></div></div>`;}
 else{const width=name==='mada'?68.04:54,height=name==='mada'?20.69:38;rule(`dts-logo-${name}`,{width:cqi(width),height:cqi(height),display:'flex','align-items':'center','justify-content':'center',...(name==='visa'||name==='mastercard'?{'background-color':'#fff','border-radius':cqi(4)}:{})});
 html+=`<div class="dts-box-${name}"><div class="dts-network-box"><div class="dts-logo-${name}" data-dts-logo="${name}"></div></div></div>`;}
}
html+='</div></div>';
await fs.writeFile('src/embeds/dynamic-transaction-switching-markup.html',html);
await fs.writeFile('src/embeds/dynamic-transaction-switching-native.css',css.join('\n'));
await fs.writeFile('src/embeds/dynamic-transaction-switching-connectors.svg',connectors);
