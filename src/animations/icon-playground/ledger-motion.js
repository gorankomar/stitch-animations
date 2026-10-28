export const TUCKED_PAPER_PATH = 'M14 3L14 3C14 3 14 3 14 3L14 11C14 11 14 11 14 11L5 11C3.89543 11 3 11.8954 3 13L3 13';
let opened='',closed='';
export function configureLedgerSketches(sources){opened=sources.opened;closed=sources.closed;profiles.length=0;}
const ns='http://www.w3.org/2000/svg';
const profiles=[];
// Normalize both redraw states to the original 10.66663 × 13.33337 centerline bounds.
export function normalizeLedgerPath(d,openOffset=0){
 const sx=10.66663/11,sy=13.33337/14;
 const point=(x,y)=>`${2.66667+(x-3)*sx} ${1.33333+(y-openOffset-1)*sy}`;
 const tokens=d.match(/[A-Za-z]|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/g);let i=0,x=0,y=0;const out=[];
 while(i<tokens.length){const command=tokens[i++];if(/[zZ]/.test(command)){out.push(command);continue;}
  if(command==='H'){x=+tokens[i++];out.push(`L${point(x,y)}`);continue;}
  if(command==='V'){y=+tokens[i++];out.push(`L${point(x,y)}`);continue;}
  const count=command==='C'?3:1,points=[];for(let j=0;j<count;j++){x=+tokens[i++];y=+tokens[i++];points.push(point(x,y));}out.push(command+points.join(' '));
 }return out.join('');
}
function samples(d){const path=document.createElementNS(ns,'path');path.setAttribute('d',d);const length=path.getTotalLength(),closed=/z$/i.test(d);return Array.from({length:96},(_,i)=>{const p=path.getPointAtLength(length*i/(closed?96:95));return [p.x,p.y];});}
function align(start,end,isClosed){let best=end,bestCost=Infinity;for(const points of [end,[...end].reverse()])for(let shift=0;shift<(isClosed?end.length:1);shift++){const candidate=points.map((_,i)=>points[(i+shift)%points.length]);const cost=start.reduce((sum,p,i)=>sum+(p[0]-candidate[i][0])**2+(p[1]-candidate[i][1])**2,0);if(cost<bestCost){bestCost=cost;best=candidate;}}return best;}
export function interpolateLedgerPoints(start,end,p){return start.map((point,i)=>[point[0]+(end[i][0]-point[0])*p,point[1]+(end[i][1]-point[1])*p]);}
export function prepareLedger(svg){
 const parser=new DOMParser();
 const closedDoc=parser.parseFromString(closed,'image/svg+xml');
 const openedDoc=parser.parseFromString(opened,'image/svg+xml');
 const parts=['book-top','paper','book-bottom'];
 const starts=parts.map(name=>normalizeLedgerPath(closedDoc.querySelector(`[id="${name}"]`).getAttribute('d')));
 const ends=parts.map(name=>normalizeLedgerPath(openedDoc.querySelector(`[id="${name}"]`).getAttribute('d'),.5102));
 // The hidden top-corner arc belongs to the cover. Tuck the paper's
 // exposed endpoint onto its right edge instead of dragging it across the cover.
 starts[1]=normalizeLedgerPath(TUCKED_PAPER_PATH);
 const template=svg.querySelector('path'),host=template.parentNode;host.replaceChildren();
 for(let i=0;i<parts.length;i++){
  const path=template.cloneNode();path.removeAttribute('id');path.setAttribute('class',`motion-piece-${i}`);path.dataset.ledgerPart=parts[i];path.setAttribute('d',starts[i]);host.append(path);
  if(!profiles[i]){const start=samples(starts[i]),end=align(start,samples(ends[i]),false);profiles[i]={startD:starts[i],endD:ends[i],start,end,closed:false};}
 }
}
export function ledgerGeometry(index,p){const profile=profiles[index];if(!profile)return null;if(p===0)return profile.startD;if(p===1)return profile.endD;if(index===1)return ledgerPaperGeometry(profile.startD,profile.endD,p);const points=interpolateLedgerPoints(profile.start,profile.end,p);return points.map((point,i)=>(i?'L':'M')+point.join(' ')).join('')+(profile.closed?'Z':'');}
export function ledgerVisibility(){return 1;}

// Matching commands keep the sheet's corners paired, rather than interpolating
// unrelated arc-length samples. The top-left endpoint follows the adjoining
// corner initially, then retracts left into its exact opened position.
export function ledgerPaperGeometry(startD,endD,p){
 const start=startD.match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/g).map(Number);
 let index=0;const path=endD.replace(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/g,value=>String(start[index]+(Number(value)-start[index++])*p));
 const t=Math.max(0,Math.min(1,(p-.3)/.7)),release=t*t*(3-2*t);
 const firstX=2.66667+(11+p*(1-release))*10.66663/11;
 return path.replace(/^M[-+\d.e]+/,`M${firstX}`);
}
