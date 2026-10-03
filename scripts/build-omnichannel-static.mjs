import fs from 'node:fs/promises';
const base='src/embeds/assets/omnichannel-origination';
const files=['imgBarChartSquare01','imgBarChart08','imgClock','imgLuggage02','imgCar01','imgSafe','imgActivityHeart','imgFile06','imgStar01','imgFingerprint04','imgLuggage3','imgCar2','imgLuggage4','imgDownload01'];
const icons=[];
for(const file of files){
 const source=await fs.readFile(`${base}/${file}.svg`,'utf8');
 const original=await fs.readFile(`${base}/originals/${file}.svg`,'utf8');
 const width=original.match(/width="([^"]+)"/)[1];
 const weight=source.match(/stroke-width="([^"]+)"/)?.[1]||'1';
 // Full-viewBox rectangular clips are redundant for these source icon paths.
 // Removing them permits valid repeated component instances without SVG ID collisions.
 const svg=source.replace(/\sclip-path="[^"]+"/g,'').replace(/<defs>.*?<\/defs>/gs,'').replace(/\sid="[^"]+"/g,'').replace(/\sstroke-width="[^"]+"/g,'').replace('<svg ',`<svg class="oo-svg" width="${width}" height="${width}" aria-hidden="true" stroke-width="${weight}" `);
 icons.push({file,svg,width:Number(width),weight});
}
await fs.writeFile(`${base}/icons.json`,JSON.stringify(icons,null,2));
const icon=(file)=>icons.find(i=>i.file===file).svg;
const rows=[
 [['imgFile06','Pay Roll Documents'],['imgStar01','Rating'],['imgFingerprint04','Identity']],
 [['imgBarChartSquare01','Pay stubs'],['imgBarChart08','Shopping'],['imgClock','Shifts'],['imgLuggage02','Gigs']],
 [['imgCar01','Vehicels'],['imgSafe','Deposit Destinations'],['imgActivityHeart','Health']]
];
let inside='';
for(const [i,file] of ['imgEllipse330','imgEllipse331','imgEllipse332'].entries()){
 let svg=(await fs.readFile(`${base}/${file}.svg`,'utf8')).replace(/\sid="[^"]+"/g,'').replace(/<circle /g, '<circle vector-effect="non-scaling-stroke" ').replace('<svg ', '<svg class="oo-ring-svg" aria-hidden="true" ');
 inside+=`<div class="oo-ring oo-ring-${i}" data-oo-ring="${i}">${svg}</div>`;
}
rows.forEach((items,i)=>{const itemMarkup=items.map(([file,label])=>`<div class="oo-item"><div class="oo-icon" data-oo-icon="${file}">${icon(file)}</div><p class="oo-label">${label}</p></div>`).join('');inside+=`<div class="oo-row oo-row-${i}" data-oo-row="${i}"><div class="oo-track" data-oo-track=""><div class="oo-sequence" data-oo-sequence="">${itemMarkup}</div></div></div>`});
inside+='<div class="oo-fade oo-fade-left"></div><div class="oo-fade oo-fade-right"></div>';
inside+='<div class="oo-position"><div class="oo-follow" data-follow-mouse="" data-strength="0.05"><div class="oo-reveal" data-oo-reveal=""><div class="oo-card"><div class="oo-source"><p class="oo-source-label">Source</p><div class="oo-badges">';
['imgLuggage3','imgCar2','imgLuggage4'].forEach((file,i)=>inside+=`<div class="oo-badge${i===2?' oo-badge-dark':''}"><div class="oo-small-icon" data-oo-icon="${file}">${icon(file)}</div></div>`);
inside+='</div></div><div class="oo-title">Verification<br>of income &amp;<br>employment</div><div class="oo-download"><div class="oo-small-icon" data-oo-icon="imgDownload01">'+icon('imgDownload01')+'</div><p class="oo-download-label">Download</p></div></div></div></div></div>';
const css=`
.oo-container {width:100%;min-width:0;position:relative;}
.oo-frame {width:100%;aspect-ratio:258 / 232;position:relative;overflow:hidden;border-radius:3.100775cqi;background-image:linear-gradient(231.777deg,rgba(231,231,231,.37),rgba(255,255,255,.37) 51.725%,rgba(231,231,231,.37) 106.43%),linear-gradient(90deg,#fff,#fff);}
.oo-ring {position:absolute;}
.oo-ring-0 {width:120.155039cqi;height:120.155039cqi;left:-10.077519cqi;top:-10.077519cqi;}
.oo-ring-1 {width:92.248062cqi;height:92.248062cqi;left:3.875969cqi;top:3.875969cqi;}
.oo-ring-2 {width:65.891473cqi;height:65.891473cqi;left:17.054264cqi;top:17.054264cqi;}
.oo-ring-svg {width:100%;height:100%;display:block;}
.oo-row {position:absolute;}
.oo-row-0 {left:2.713178cqi;top:26.356589cqi;}
.oo-row-1 {left:-2.713178cqi;top:39.922481cqi;}
.oo-row-2 {left:1.162791cqi;top:53.488372cqi;}
.oo-track {display:flex;width:max-content;gap:3.875969cqi;}
.oo-sequence {display:flex;align-items:center;gap:3.875969cqi;flex-shrink:0;}
.oo-item {display:flex;align-items:center;gap:2.325581cqi;padding:1.937984cqi;border:0.193798cqi solid #e7e7e7;background-color:#fcfcfc;border-radius:1.550388cqi;flex-shrink:0;}
.oo-icon {width:6.20155cqi;height:6.20155cqi;flex-shrink:0;}
.oo-small-icon {width:3.100775cqi;height:3.100775cqi;flex-shrink:0;}
.oo-svg {width:100%;height:100%;display:block;}
.oo-label {font-size:3.100775cqi;line-height:1.21;color:#000;white-space:nowrap;margin:0;font-weight:400;}
.oo-fade {position:absolute;width:101.550388cqi;height:94.573643cqi;left:-1.550388cqi;top:0;pointer-events:none;}
.oo-fade-left {background-image:linear-gradient(90.177509deg,rgba(255,255,255,0) 43.473%,#fff 110.09%);transform:rotate(180deg);}
.oo-fade-right {background-image:linear-gradient(90.177509deg,rgba(255,255,255,0) 43.473%,#fff 110.09%);}
.oo-position {position:absolute;left:50.03876%;top:50%;width:42.635659cqi;transform:translate(-50%,-50%);}
.oo-follow {width:100%;}
.oo-reveal {width:100%;opacity:1;}
.oo-card {box-sizing:border-box;width:100%;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:3.875969cqi;padding:5.813953cqi 4.651163cqi;border:0.387597cqi solid #e7e7e7;border-radius:2.325581cqi;background-image:linear-gradient(0deg,#f2f2f2,#fff);box-shadow:0 3.875969cqi 3.875969cqi rgba(0,0,0,.1);}
.oo-source {display:flex;flex-direction:column;align-items:flex-start;gap:2.325581cqi;}
.oo-source-label {font-size:2.325581cqi;line-height:1.21;color:#121212;font-weight:400;margin:0;}
.oo-badges {display:flex;gap:1.550388cqi;align-items:center;}
.oo-badge {background-color:#efefef;display:flex;align-items:center;padding:1.550388cqi;border-radius:3.875969cqi;}
.oo-badge-dark {background-color:#454545;}
.oo-title {font-size:4.263566cqi;line-height:5.813953cqi;font-weight:500;color:#121212;}
.oo-download {display:flex;gap:1.937984cqi;align-items:center;}
.oo-download-label {font-size:2.325581cqi;line-height:1.21;color:#0070ff;white-space:nowrap;font-weight:400;margin:0;}
`;
await fs.writeFile('src/embeds/omnichannel-origination-native.css',css);
await fs.writeFile('src/embeds/omnichannel-origination-markup.html',`<div class="oo-container" data-omnichannel-origination=""><div class="oo-frame">${inside}</div></div>`);
await fs.writeFile('src/embeds/omnichannel-origination-content.html',`<div class="oo-layers">${inside}</div>`);
