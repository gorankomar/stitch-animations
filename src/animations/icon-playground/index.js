import { createHolderTilt } from '../../lib/effects/holder-tilt.js';
import { BLOG_WINDOW } from './blog-motion.js';
import { createTwoWayMotion } from './two-way-motion.js';
import ledgerOpened from '../../embeds/icon-playground/assets/ledgers-redrawn-opened-master.svg?raw';
import ledgerClosed from '../../embeds/icon-playground/assets/ledgers-redrawn-closed-master.svg?raw';
import { configureLedgerSketches } from './ledger-motion.js';
import { createCardStack } from './card-stack.js';
import { createColorEffects, effectNames } from './color-effects.js';
import { motionNames, prepareExtraMotion, bindExtraMotion, wholeMotion } from './extra-motion.js';
import { traceRoutes, routeProgress, traceDashState, isArtworkPath } from './stroke-trace.js';
import { readMotionEasingCurve } from '../../lib/motion.js';
import { getDefaultDurationMs } from '../../lib/easing.js';
import { icons } from './icons.js';
configureLedgerSketches({opened:ledgerOpened,closed:ledgerClosed});
const effectDescriptions = {
 rising:'A soft color boundary rises from bottom to top.',
 trace:'Color draws over each stroke; the original lines fade to 10%.',
 sweep:'A soft color boundary sweeps from left to right.',
 bloom:'Hover color blooms outward from the center.',
 pulse:'A soft color segment travels along the strokes once, then passes out. Hover again to replay.',
 glow:'Hover color fades in with a tight, soft halo.',
 ink:'Hover color draws outward from the middle of each path.',
 highlight:'The icon changes color, followed by a slow, subtle highlight. Hover again to replay.'
};
const sizes = [32,48,64,96];
const grid = document.querySelector('#grid');
const duration = document.querySelector('#duration');
const stroke = document.querySelector('#stroke');
const base = document.querySelector('#base-color');
const hover = document.querySelector('#hover-color');
const effect = document.querySelector('#effect');
const details = document.querySelector('#details');
for(const [value,label] of Object.entries(effectNames)){if(![...effect.options].some(option=>option.value===value))effect.add(new Option(label,value));}
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let sequence = 0;
const states = [];
const ease = readMotionEasingCurve();
const defaultDuration = getDefaultDurationMs();
duration.value = defaultDuration;
// Preserve the original path geometry; only presentation and instance IDs change.
function artwork(source, key, size) {
  const svg = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
  const width = +svg.getAttribute('width');
  const id = `icon-${sequence++}`;
  for (const node of [svg,...svg.querySelectorAll('*')]) {
    if (node.id) { const old = node.id; node.id = `${id}-${old}`;
      for (const ref of svg.querySelectorAll('[clip-path]')) ref.setAttribute('clip-path',ref.getAttribute('clip-path').replace(`#${old}`,`#${node.id}`));
    }
  }
  svg.classList.add('icon-art');
  svg.setAttribute('aria-hidden','true');
  // Root dimensions remain those of the export; scale the outer SVG with CSS transform.
  svg.style.transform = `scale(${size / (width + 16)})`;
  prepareExtraMotion(svg, key);
  if(['whitepapers','api-references'].includes(key))for(const side of ['left','right']){
    const group=document.createElementNS('http://www.w3.org/2000/svg','g');
    group.classList.add(`rear-paper-${side}`);
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d','M5 2.8H11Q13 2.8 13 4.8V11.2Q13 13.2 11 13.2H5Q3 13.2 3 11.2V4.8Q3 2.8 5 2.8Z');
    path.classList.add(`rear-paper-outline-${side}`);
    path.setAttribute('fill','none');path.setAttribute('stroke-linejoin','round');group.append(path);svg.append(group);
  }
  if(key==='digital-wallets'){
    const clip=document.createElementNS('http://www.w3.org/2000/svg','clipPath');clip.id=`${id}-card-peek`;
    const window=document.createElementNS('http://www.w3.org/2000/svg','path');
    // Clip against the actual rounded wallet silhouette, rather than a straight
    // cutoff that leaves air between the note and the upper-left corner.
    const walletOutline=svg.querySelector('.motion-piece-0').getAttribute('d');
    window.setAttribute('d',`M-5 -8H23V23H-5Z ${walletOutline}Z`);
    window.setAttribute('clip-rule','evenodd');window.setAttribute('fill-rule','evenodd');
    clip.append(window);const definitions=document.createElementNS('http://www.w3.org/2000/svg','defs');definitions.append(clip);svg.append(definitions);
    const windowGroup=document.createElementNS('http://www.w3.org/2000/svg','g');windowGroup.setAttribute('clip-path',`url(#${clip.id})`);
    const card=document.createElementNS('http://www.w3.org/2000/svg','g');card.classList.add('wallet-peek-card');
    for(const index of [1]){
      const note=document.createElementNS('http://www.w3.org/2000/svg','g');note.classList.add(`wallet-note-${index}`);
      if(index===0)note.setAttribute('transform','translate(.8 -2.4)');
      const backing=document.createElementNS('http://www.w3.org/2000/svg','polygon');backing.setAttribute('points','1.8,4.7 11.8,2.6 13,8.3 3,10.4');backing.setAttribute('fill','#efefef');note.append(backing);
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M1.8 4.7L11.8 2.6L13 8.3L3 10.4Z');path.setAttribute('fill','none');path.setAttribute('stroke-linejoin','round');path.setAttribute('stroke-linecap','round');path.classList.add('wallet-peek-piece',`wallet-note-outline-${index}`);note.append(path);card.append(note);
    }
    windowGroup.append(card);svg.insertBefore(windowGroup,svg.firstChild);
  }
  const original = [...svg.querySelectorAll('path')].filter(isArtworkPath);
  original.forEach(path=>{path.setAttribute('stroke','var(--base-color)');path.removeAttribute('stroke-width');});
  const ns = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(ns,'defs');
  const gradient = document.createElementNS(ns,'linearGradient');
  gradient.id = `${id}-rise`; gradient.setAttribute('gradientUnits','userSpaceOnUse');
  gradient.innerHTML = '<stop offset="0" stop-color="var(--hover-color)"/><stop offset="1" stop-color="var(--hover-color)" stop-opacity="0"/>';
  defs.append(gradient);svg.append(defs);
  const overlays=original.map(path=>{const clone=path.cloneNode(true);clone.removeAttribute('id');clone.setAttribute('stroke',`url(#${gradient.id})`);path.parentNode.append(clone);return clone;});
  // Separate existing move commands without changing their coordinates, for targeted optional motion.
  if (key === 'card-upload' || key === 'transactions') {
    for(const path of [...original,...overlays]) {
      const parts=path.getAttribute('d').match(/M[^M]*/g);
      if(key==='transactions' && parts?.length===4){path.setAttribute('d',parts.slice(0,2).join(''));path.classList.add('transfer-forward');const back=path.cloneNode();back.setAttribute('d',parts.slice(2).join(''));back.classList.remove('transfer-forward');back.classList.add('transfer-back');path.parentNode.append(back);continue;}
      if(parts?.length>1){path.setAttribute('d',parts.slice(key==='card-upload'?2:0).join(''));if(key==='card-upload'){const arrow=path.cloneNode();arrow.setAttribute('d',parts.slice(0,2).join(''));arrow.classList.add('detail-part');path.parentNode.append(arrow);}}
    }
  }
  const risingPaths = [...svg.querySelectorAll('path')].filter(path => path.getAttribute('stroke')?.startsWith('url('));
  const basePaths = [...svg.querySelectorAll('path')].filter(path => path.getAttribute('stroke') === 'var(--base-color)');
  const traces = traceRoutes(key, basePaths).map(route => {
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', route.d);
    path.setAttribute('class', `stroke-trace ${route.part}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'var(--hover-color)');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('pathLength', '1');
    path.setAttribute('stroke-dasharray', '1 1');
    const rearSide=['left','right'].find(side=>route.part.split(' ').includes(`rear-paper-outline-${side}`));
    const walletNote=[0,1].find(index=>route.part.split(' ').includes(`wallet-note-outline-${index}`));
    const altSheet=[0,1].find(index=>route.part.split(' ').includes(`alt-paper-part-${index}`));
    const flipSheet=[0,1].find(index=>route.part.split(' ').includes(`flip-paper-part-${index}`));
    (flipSheet!==undefined?svg.querySelector(`.flip-sheet-${flipSheet}`):route.part.split(' ').includes('flip-panel-edge')?svg.querySelector('.flip-panel'):altSheet!==undefined?svg.querySelector(`.alt-sheet-${altSheet}`):rearSide?svg.querySelector(`.rear-paper-${rearSide}`):walletNote!==undefined?svg.querySelector(`.wallet-note-${walletNote}`):svg).append(path);
    return {path, ...route};
  });
  return {svg,gradient,width,frameSize:width+16,risingPaths,traces,basePaths,effectBounds:key==='blogs'?BLOG_WINDOW:key==='whitepapers-flip'?{x:2.66667,y:1.33333,width:10.66663,height:13.33337}:null};
}
function updateColors(){document.querySelector('#details-status').textContent=details.checked?'On':'Off';document.querySelector('#effect-description').textContent=effectDescriptions[effect.value];grid.classList.toggle('show-extra-motion',details.checked);grid.style.setProperty('--base-color',base.value);grid.style.setProperty('--hover-color',hover.value);grid.style.setProperty('--stroke',stroke.value);document.querySelector('#stroke-value').value=`${Number(stroke.value).toFixed(2).replace(/0$/,'')} px`;document.querySelector('#duration-value').value=`${duration.value} ms`;}
try {
 const svgSources = import.meta.glob('../../embeds/icon-playground/assets/*.svg', {query:'?raw',import:'default',eager:true});
 const sources = icons.map(([key])=>{const assetKey=['whitepapers-alt','whitepapers-flip'].includes(key)?'whitepapers':key;const source=svgSources[`../../embeds/icon-playground/assets/${assetKey}.svg`];if(!source)throw Error(`Icon unavailable: ${assetKey}`);return source;});
 for (const [i,[key,label,note]] of icons.entries()) {
 const row=document.createElement('div');row.className='icon-row';row.dataset.icon=key;row.innerHTML=`<div class="row-name">${label}<small>${note}</small><small class="motion-name">${motionNames[key]}</small></div>`;
 grid.append(row);
 for(const size of sizes){const sample=document.createElement('div');sample.className='sample';const button=document.createElement('button');button.className='icon-button';button.style.setProperty('--size',`${size}px`);button.setAttribute('aria-label',`${label}, ${size} pixel container`);const art=artwork(sources[i],key,size);button.append(art.svg);sample.append(button);const caption=document.createElement('span');caption.textContent=`${size} × ${size}`;sample.append(caption);row.append(sample);
 const colors=createColorEffects(art,`color-${sequence}`,ease);
 const renderCardStack=['cards','credit-card','whitepapers','api-references'].includes(key)?createCardStack(art,`stack-${sequence}`,['whitepapers','api-references'].includes(key)?{direction:'sides',spacing:2.8}:{}):null;
 let renderExtraMotion=bindExtraMotion(art.svg,key);
 const twoWay=createTwoWayMotion(key,ease);
 let progress=0,altProgress=0,fadeProgress=0,highlightProgress=0,target=0,frame=0,last=0,nearbyHovered=false;
 function render(){const trace = effect.value === 'trace';
 if(effect.value==='pulse'&&colors.ensurePulse())renderExtraMotion=bindExtraMotion(art.svg,key);
 art.basePaths.forEach(path => path.style.opacity = String(trace ? 1 - fadeProgress * .9 : effect.value==='pulse'&&!reduced.matches ? 1-fadeProgress*.45 : 1));
 art.risingPaths.forEach(path => path.style.display = effect.value==='rising' ? '' : 'none');
 for(const route of art.traces){const amount=routeProgress(ease(progress),route.start,route.end);route.path.style.display=trace&&amount>0?'':'none';const dash=traceDashState(amount);route.path.setAttribute('stroke-dasharray',dash.array);route.path.setAttribute('stroke-dashoffset',String(dash.offset));}
 const eased=ease(progress);
 const p=details.checked&&!reduced.matches?eased:0;
 art.svg.style.transform=`scale(${size/art.frameSize}) ${wholeMotion(key,p)}`;
 renderExtraMotion(['whitepapers-alt','whitepapers-flip'].includes(key)?(details.checked&&!reduced.matches?ease(altProgress):0):p,details.checked&&!reduced.matches?(['whitepapers-alt','whitepapers-flip'].includes(key)?altProgress:progress):0,twoWay?(details.checked&&!reduced.matches?twoWay.position:[0,0]):null);
 renderCardStack?.(p);
 colors.render(effect.value,progress,eased,reduced.matches,highlightProgress);
 const box=art.effectBounds||art.svg.getBBox();
 const height=Math.max(box.height,1),boundary=box.y+height*(1.25-eased*1.5);
 art.gradient.setAttribute('x1','0');art.gradient.setAttribute('x2','0');
 art.gradient.setAttribute('y1',boundary);art.gradient.setAttribute('y2',boundary-height*.25);
 art.risingPaths.forEach(path=>path.setAttribute('stroke',progress===1?'var(--hover-color)':`url(#${art.gradient.id})`));
 }

 function tick(time){const dt=last?Math.min(time-last,64):0;last=time;progress+=Math.sign(target-progress)*Math.min(Math.abs(target-progress),dt/Number(duration.value));fadeProgress+=Math.sign(target-fadeProgress)*Math.min(Math.abs(target-fadeProgress),dt/(Number(duration.value)*.5));highlightProgress+=Math.sign(target-highlightProgress)*Math.min(Math.abs(target-highlightProgress),dt/(Number(duration.value)*3));if(key==='whitepapers-flip'&&!reduced.matches&&target===1&&altProgress>=1)altProgress=0;altProgress+=Math.sign(target-altProgress)*Math.min(Math.abs(target-altProgress),dt/(Number(duration.value)*(key==='whitepapers-flip'?2.6:3)));twoWay?.advance(dt,Number(duration.value));render();if((key==='whitepapers-flip'&&!reduced.matches&&target===1)||(['whitepapers-alt','whitepapers-flip'].includes(key)&&altProgress!==target)||progress!==target||fadeProgress!==target||(effect.value==='highlight'&&highlightProgress!==target)||twoWay?.active)frame=requestAnimationFrame(tick);else{frame=0;last=0;}}
 function change(){target=nearbyHovered||button.matches(':focus-visible')?1:0;twoWay?.setHovered(target===1);if(reduced.matches){progress=target;altProgress=target;fadeProgress=target;highlightProgress=target;twoWay?.finish();render();return;}if(!frame)frame=requestAnimationFrame(tick);}
 function updateHover(event){const box=button.getBoundingClientRect(),label=caption.getBoundingClientRect();const inside=(rect,pad=0)=>event.clientX>=rect.left-pad&&event.clientX<=rect.right+pad&&event.clientY>=rect.top-pad&&event.clientY<=rect.bottom+pad;const next=inside(box,20)||inside(label);if(next!==nearbyHovered){nearbyHovered=next;change();}}
 sample.addEventListener('pointerenter',updateHover);sample.addEventListener('pointermove',updateHover);sample.addEventListener('pointerleave',()=>{nearbyHovered=false;change();});button.addEventListener('focus',change);button.addEventListener('blur',change);states.push({render,change,replay(){progress=0;altProgress=0;fadeProgress=0;highlightProgress=0;change();}});render();
 }
 }updateColors();
} catch(error){document.querySelector('#error').hidden=false;document.querySelector('#error').textContent=error.message;}
for(const input of [duration,stroke,base,hover,details])input.addEventListener('input',()=>{updateColors();states.forEach(s=>s.render());});
reduced.addEventListener('change',()=>states.forEach(s=>s.change()));
document.querySelector('#reset').addEventListener('click',()=>{duration.value=defaultDuration;stroke.value=1.4;base.value='#3d3d3d';hover.value='#0070ff';details.checked=true;effect.value='rising';updateColors();states.forEach(s=>s.render());});

effect.addEventListener('change',()=>{updateColors();states.forEach(s=>{s.replay();s.render();});});

const holderToggle=document.querySelector('#holder-effect');
const holderTilt=createHolderTilt({root:grid});
function updateHolder(){holderTilt.setEnabled(holderToggle.checked);document.querySelector('#holder-status').textContent=holderToggle.checked?'On':'Off';}
holderToggle.addEventListener('change',updateHolder);
document.querySelector('#reset').addEventListener('click',()=>{holderToggle.checked=true;updateHolder();});
window.addEventListener('pagehide',()=>holderTilt.dispose(),{once:true});
updateHolder();
