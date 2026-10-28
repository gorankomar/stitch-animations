import {preparePaperFlip,renderPaperFlip} from './paper-flip-motion.js';
import {preparePaperAlt,renderPaperAlt} from './paper-alt-motion.js';
import { prepareBlog, blogPose, blogTextGeometry, ensureBlogClip } from './blog-motion.js';
import { prepareLedger, ledgerGeometry } from './ledger-motion.js';
import { readMotionEasingCurve } from '../../lib/motion.js';
export const WALLET_OPEN_DEGREES = 10;
export const TRANSACTION_TRAVEL = 1.4;
export const ROUTING_TRAVEL = 1.35;
export const motionNames = {
  globe: 'Rolling globe', integrations: 'Connections expand', ledgers: 'Cover opens, page slips',
  transactions: 'Arrows exchange', 'card-upload': 'Deposit dips and lifts', cards: 'Three-card stack',
  loans: 'Wallet opens', applications: 'Form lines slide', bnpl: 'Bag lifts',
  onboarding: 'Magnifier searches', 'digital-loans': 'Outline dips and lifts, mark scrolls',
  'credit-card': 'Three-card stack', 'digital-wallets': 'Clasp opens, banknote peeks out', routing: 'Connections spread',
  'whitepapers-flip':'Corner sweeps, content redraws','whitepapers-alt':'Unfold, shrink and swap',blogs:'Article scroll',whitepapers:'Papers spread sideways',
  'developers-guide':'Brackets expand, slash contracts and extends','api-references':'Papers spread, code opens'
};
const existing = new Set(['transactions', 'card-upload', 'credit-card']);
// Split only at exported move commands. Coordinates and curves stay untouched.
// These same classes are copied to the rising overlay and trace routes.
export function prepareExtraMotion(svg, key) {
  if(key==='whitepapers-flip'){preparePaperFlip(svg);return;}
  if(key==='whitepapers-alt'){preparePaperAlt(svg);return;}
  if(key==='ledgers'){prepareLedger(svg);return;}
  if (existing.has(key)) return;
  let index = 0;
  for (const path of [...svg.querySelectorAll('path')]) {
    const parts = path.getAttribute('d').match(/M[^M]*/g) || [];
    for (const d of parts) {
      const part = path.cloneNode();
      part.removeAttribute('id');
      part.setAttribute('d', d);
      part.classList.add(`motion-piece-${index++}`);
      path.parentNode.insertBefore(part, path);
    }
    path.remove();
  }
  if(key==='blogs')prepareBlog(svg);
  if(key==='globe'){
    svg.querySelector('.motion-piece-4').setAttribute('d','M1.33331 8.00036L14.6666 8.00036');
    const meridian=svg.querySelector('.motion-piece-3').cloneNode();meridian.setAttribute('class','motion-piece-5');svg.querySelector('.motion-piece-0').parentNode.append(meridian);}
}
export function wholeMotion(key, p) {
  switch (key) {
    case 'bnpl': return `translateY(${-Math.sin(Math.PI*p)*.95}px)`;

    default: return '';
  }
}
export function pieceMotion(key, index, p, box) {
  if(key==='developers-guide'){
    if(index<2)return `translateX(${p*(index===0?1.1:-1.1)}px)`;
    if(index===2)return ''; // Slash length is animated through geometry, preserving stroke weight.
  }
  if(key==='api-references' && (index===1||index===2))return `translate(${p*(index===1?.55:-.55)}px, ${-p*.6}px)`;
  if (key === 'integrations') {
    if(index>=15) return '';
    const x = (box.x + box.width/2 - 8)*p*.125;
    const y = (box.y + box.height/2 - 8)*p*.125;
    return `translate(${x}px, ${y}px)`;
  }
  if (key === 'loans' && index === 2) return `rotate(${-p*WALLET_OPEN_DEGREES}deg)`;
  if (key === 'applications' && index < 2) return `translateX(${p*(index===0?-.8:.8)}px) scaleX(${1-p*.18})`;
  if (key === 'bnpl' && index === 0) return `translateY(${-p*1.05}px)`;

  if (key === 'digital-loans' && index === 0) return `translateY(${p*1.35}px)`;
  if (key === 'digital-loans' && index === 1) return `translateY(${-p*.45}px)`;
  if (key === 'digital-wallets' && index === 1) return `translateX(${p*1.1}px)`;
  if (key === 'routing' && [1,2,4,5].includes(index)) return `translateX(${p*(index===4?-ROUTING_TRAVEL:index===5?0:ROUTING_TRAVEL)}px) scale(${1+p*.16})`;
  return '';
}
export function bindExtraMotion(svg, key) {
  const primaryEase=readMotionEasingCurve();
  const rimMask=key==='globe'?ensureGlobeRimMask(svg):null;
  const blogClip=key==='blogs'?ensureBlogClip(svg):null;
  // Hidden effect paths have empty getBBox results. Every duplicate must use
  // the same visible source measurements, never its own display-dependent box.
  const sourceBoxes=new Map();
  for(const path of svg.querySelectorAll('path')){
    const match=[...path.classList].find(name=>name.startsWith('motion-piece-'));
    if(match&&path.getAttribute('stroke')==='var(--base-color)')sourceBoxes.set(match,path.getBBox());
  }
  const pieces = [...svg.querySelectorAll('path')].map(path => {
    const match = [...path.classList].find(name => name.startsWith('motion-piece-'));
    if (!match) return null;
    path.style.transformBox = 'fill-box';
    path.style.transformOrigin = 'center';
    if(key==='globe'){path.style.transformBox='view-box';path.style.transformOrigin='8px 8px';}
    if(key==='loans' && match==='motion-piece-2'){path.style.transformBox='view-box';path.style.transformOrigin='2px 3.33333px';}
    let visibilityGroup=null;
    if(key==='globe' && ['motion-piece-0','motion-piece-1','motion-piece-5'].includes(match)){
      visibilityGroup=path.parentNode;
      if(!visibilityGroup.hasAttribute('data-globe-meridian')){const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.setAttribute('data-globe-meridian','');visibilityGroup.insertBefore(group,path);group.append(path);visibilityGroup=group;}
    }
    if(key==='globe' && match==='motion-piece-5')visibilityGroup.setAttribute('mask',`url(#${rimMask})`);
    if(key==='blogs' && !['motion-piece-1','motion-piece-3'].includes(match)){
      let parent=path.parentNode;if(!parent.hasAttribute('data-blog-content')){const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.setAttribute('data-blog-content','');parent.insertBefore(group,path);group.append(path);parent=group;}parent.setAttribute('clip-path',`url(#${blogClip})`);
    }
    const originalD=path.dataset.extraOriginalD || path.getAttribute('d');
    path.dataset.extraOriginalD=originalD;
    return {path, index: Number(match.slice('motion-piece-'.length)), box: sourceBoxes.get(match)||path.getBBox(), originalD, visibilityGroup};
  }).filter(Boolean);
  return (p,rawProgress=p,motionPosition=null) => {
    if(key==='whitepapers-flip'){renderPaperFlip(svg,rawProgress,primaryEase);return;}
    if(key==='whitepapers-alt'){renderPaperAlt(svg,rawProgress,primaryEase);return;}
    for(const {path,index,box,originalD,visibilityGroup} of pieces) {
      if(key==='globe'||key==='integrations'||key==='loans'||key==='ledgers'||key==='whitepapers') path.setAttribute('d',detailGeometry(key,index,p,originalD));
      if(key==='developers-guide' && index===2){
        const scale=1+(motionPosition?motionPosition[0]:p*.2);
        path.setAttribute('d',`M${8+1.33333*scale} ${8-6*scale}L${8-1.33333*scale} ${8+6*scale}`);
      }
      path.style.transform = pieceMotion(key,index,p,box);
      if(key==='blogs'){path.style.transform=blogPose(index,rawProgress,primaryEase);const text=blogTextGeometry(index,rawProgress);if(text)path.setAttribute('d',text);}
      if(key==='digital-loans' && index===1 && motionPosition)path.style.transform=`translateY(${motionPosition[1]}px)`;
      if(key==='digital-wallets' && index===1 && motionPosition)path.style.transform=`translateX(${motionPosition[0]}px)`;
      if(key==='onboarding' && index>=4){const [x,y]=motionPosition||Object.values(searchOffset(rawProgress,primaryEase));path.style.transform=`translate(${x}px, ${y}px)`;}
      if(visibilityGroup)visibilityGroup.style.opacity=String(globeVisibility(index,p,rawProgress));
      if(key==='routing' && index===0) {
        const d = path.dataset.motionOriginalD || path.getAttribute('d');path.dataset.motionOriginalD=d;
        path.setAttribute('d',d.replace(/^M12\.0417/,`M${12.0417+p*ROUTING_TRAVEL}`).replace(/H12\.0417$/,`H${12.0417+p*ROUTING_TRAVEL}`));
      }
      if(key==='routing' && index===3) path.setAttribute('d',`M${4.95833-p*ROUTING_TRAVEL} 8.5L12.0417 8.5`);
    }
    if(key==='digital-wallets'){
      const card=svg.querySelector('.wallet-peek-card');
      if(card){
        card.removeAttribute('transform');card.style.display=p>0?'':'none';
        for(const index of [1]){
          const note=card.querySelector(`.wallet-note-${index}`);
          const t=primaryEase(Math.max(0,Math.min(1,(rawProgress-index*.14)/.86)));
          const tilt=Math.atan2(2.1,10)*180/Math.PI*(1-Math.max(0,(t-.65)/.35));
          note.setAttribute('transform',`translate(${t*.45} ${1.6-t*5}) rotate(${tilt} 1.8 4.7)${index===0?' translate(.8 -2.4)':''}`);
          note.style.display=t>0?'':'none';
        }
      }
    }

    for(const part of svg.querySelectorAll('.transfer-forward')) part.style.transform=`translateX(${(motionPosition?motionPosition[0]:transactionOffset(rawProgress,primaryEase))}px)`;
    for(const part of svg.querySelectorAll('.transfer-back')) part.style.transform=`translateX(${-(motionPosition?motionPosition[0]:transactionOffset(rawProgress,primaryEase))}px)`;
    for(const part of svg.querySelectorAll('.detail-part')) part.style.transform=`translateY(${(motionPosition?motionPosition[1]:depositOffset(rawProgress,primaryEase))}px)`;
  };
}

// Dip first, then rise less than the original 1.1-unit lift. Same track reverses on exit.
// Two eased legs and a 10%-duration dwell, sampled on the raw hover clock.
export function anticipationProgress(p, ease=value=>value) {
 const symmetric=t=>t<.5?(1-ease(1-t*2))*.5:.5+ease((t-.5)*2)*.5;
 if(p<.34)return {out:symmetric(p/.34),back:0};
 if(p<.44)return {out:1,back:0};
 return {out:1,back:symmetric((p-.44)/.56)};
}
export function depositOffset(p, ease) {
 const {out,back}=anticipationProgress(p,ease);
 return out*.85-back*1.45;
}

// Morph centerline geometry rather than scaling strokes. Globe meridians keep
// at least 55% of their resting curvature, so they never collapse edge-on.
export function detailGeometry(key, index, p, originalD) {
  if(key==='ledgers')return ledgerGeometry(index,p)||originalD;
  if (p === 0) return originalD;
  if(key==='whitepapers' && index===3)return `M${6.66667+p*.95} 6H5.33333`;
  if(key==='loans' && index===2) {
    const {x,y}=walletConnection(p);
    return originalD.replace(/V4\.66667$/,`L${x} ${y}`);
  }
  if(key==='integrations') {
    if(index===15) return `M${6.5-p*.9} ${7.16667-p*.5}L8 8`;
    if(index===16) return `M8 8L${9.5+p*.9} ${7.16667-p*.5}`;
    if(index===17) return `M8 8V${9.66667+p*.95}`;
  }
  if(key==='globe' && (index<2||index===5)) {
    if(p===1) return originalD;
    const factor=globeWidth(index,p)/(index===5?6.66663:index===1?-2.66666:2.66663);
    let coordinate=0;
    return originalD.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, value => {
      const axisIndex=coordinate++;
      if(axisIndex===0||axisIndex===12)return value;
      const isX=axisIndex%2===0;
      return isX ? String(7.99997+(Number(value)-7.99997)*factor) : value;
    });
  }
  return originalD;
}

// Inverse-rotate the closing endpoint so it remains attached to the stationary
// wallet rim while the back panel rotates around its fixed left hinge.
export function walletConnection(p) {
  const angle=p*WALLET_OPEN_DEGREES*Math.PI/180;
  const dx=11.3333-2,dy=4.66667-3.33333;
  return {x:2+dx*Math.cos(angle)-dy*Math.sin(angle),y:3.33333+dx*Math.sin(angle)+dy*Math.cos(angle)};
}

export function searchOffset(p,ease) {
 const {out,back}=anticipationProgress(p,ease);
 return {x:out-back*1.8,y:out*.8-back*1.45};
}

// Keep traveling centerlines inside the outer rim. Occlude coincident rear
// meridians instead of stacking nearly coincident strokes into a heavy band.
export function globeWidth(index,p) {
 if(index===5)return 6.66663*Math.cos(p*Math.PI*2);
 const radius=4.8;
 const phase=index===5?Math.PI/2:index===0?Math.asin(2.66663/radius):-Math.asin(2.66666/radius);
 return Math.sin(phase+p*Math.PI*2)*radius;
}
export function globeVisibility(index,p,raw=p) {
 const fade=distance=>Math.max(0,Math.min(1,(distance-.25)/1.25));
 if(index===0)return 1;
 const separation=Math.abs(globeWidth(index,p)-globeWidth(0,p));
 if(index===1)return fade(separation);
 return raw>0&&raw<1?1:0;
}

// The traveling rear meridian uses the actual rim curve and is physically
// occluded by that rim, rather than fading away on an arbitrary timer.
function ensureGlobeRimMask(svg) {
 if(svg.dataset.globeRimMask)return svg.dataset.globeRimMask;
 const ns='http://www.w3.org/2000/svg';
 const mask=document.createElementNS(ns,'mask');
 const id=svg.querySelector('linearGradient').id+'-rim-mask';
 mask.id=id;mask.setAttribute('maskUnits','userSpaceOnUse');
 for(const [name,value]of Object.entries({x:-4,y:-4,width:24,height:24}))mask.setAttribute(name,value);
 const background=document.createElementNS(ns,'rect');
 for(const [name,value]of Object.entries({x:-4,y:-4,width:24,height:24,fill:'white'}))background.setAttribute(name,value);
 const rim=document.createElementNS(ns,'circle');
 for(const [name,value]of Object.entries({cx:7.99997,cy:8.00036,r:6.66665,fill:'none',stroke:'black','stroke-width':'var(--stroke, 1.4)'}))rim.setAttribute(name,value);
 mask.append(background,rim);svg.querySelector('defs').append(mask);svg.dataset.globeRimMask=id;return id;
}

export function transactionOffset(p,ease=value=>value){
 const pullback=.65;
 const {out}=anticipationProgress(p,ease);
 // The final outward leg uses the primary token directly, without a second
 // whole-timeline ease or the symmetric easing used for the anticipation.
 const finish=p<=.44?0:ease((p-.44)/.56);
 return -pullback*out+(TRANSACTION_TRAVEL+pullback)*finish;
}
