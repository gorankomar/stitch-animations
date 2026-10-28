import {createSoftPathPulse} from '../../lib/effects/soft-path-pulse.js';
const ns='http://www.w3.org/2000/svg';
export const effectNames={rising:'Rising Color Soft Fill',trace:'Stroke Trace',sweep:'Color Sweep',bloom:'Center Bloom',pulse:'Color Pulse',glow:'Soft Glow',ink:'Ink Spread',highlight:'Highlight Pass'};
export function createColorEffects(art,id,easeCurve = value => value) {
 const {svg,basePaths,width}=art;
 const defs=document.createElementNS(ns,'defs');svg.append(defs);
 function gradient(tag,name,stops){const g=document.createElementNS(ns,tag);g.id=`${id}-${name}`;g.setAttribute('gradientUnits','userSpaceOnUse');g.innerHTML=stops;defs.append(g);return g;}
 const colorStop=(offset,opacity,color='var(--hover-color)')=>`<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`;
 const sweep=gradient('linearGradient','sweep',colorStop(0,1)+colorStop(1,0));
 const bloom=gradient('radialGradient','bloom',colorStop('72%',1)+colorStop('100%',0));bloom.setAttribute('cx',width/2);bloom.setAttribute('cy',width/2);
 const sheen=gradient('linearGradient','sheen',colorStop(0,0,'white')+colorStop('.5',.5,'white')+colorStop(1,0,'white'));
 const filter=document.createElementNS(ns,'filter');filter.id=`${id}-glow`;filter.setAttribute('x','-70%');filter.setAttribute('y','-70%');filter.setAttribute('width','240%');filter.setAttribute('height','240%');filter.innerHTML='<feGaussianBlur stdDeviation="0.45"/>';defs.append(filter);
 const copies=(stroke,extra={})=>basePaths.map(base=>{const path=base.cloneNode(true);path.removeAttribute('id');path.removeAttribute('style');path.setAttribute('stroke',stroke);for(const [k,v]of Object.entries(extra))path.setAttribute(k,v);path.style.display='none';base.parentNode.append(path);return path;});
 const fill=copies('var(--hover-color)');
 const spatial=copies(`url(#${sweep.id})`);
 const halo=copies('var(--hover-color)',{filter:`url(#${filter.id})`});
 const shine=copies(`url(#${sheen.id})`);
 const ink=copies('var(--hover-color)',{pathLength:'1','stroke-dasharray':'0 1','stroke-dashoffset':'0'});
 let pulses=null;
 return {
 ensurePulse(){if(pulses)return false;pulses=basePaths.map(base=>{const path=base.cloneNode(true);path.removeAttribute('id');path.removeAttribute('style');path.setAttribute('stroke','var(--hover-color)');base.parentNode.append(path);const length=path.getTotalLength();const span=Math.max(length*.35,.05);const controller=createSoftPathPulse(path,{span,speed:length+span,color:'var(--hover-color)',period:1000,minDelay:0,maxDelay:0});return {controller,path};});return true;},
 render(kind,progress,eased,reduced,highlightProgress=progress){
  const p=reduced?(progress>0?1:0):progress;
  for(const group of [fill,spatial,halo,shine,ink])for(const path of group)path.style.display='none';
  pulses?.forEach(({controller,path})=>{if(kind==='pulse'&&!reduced){const length=path.getTotalLength(),span=Math.max(length*.35,.05);controller.refreshGeometry(span,length+span);}controller.update(kind==='pulse'&&!reduced?p:-1);});
  const box=art.effectBounds||svg.getBBox();
  const minX=box.x,minY=box.y,w=Math.max(box.width,1),h=Math.max(box.height,1);
  if(kind==='sweep'||kind==='bloom'){
   const boundary=minX+w*(-.25+eased*1.5);
   sweep.setAttribute('x1',boundary-w*.2);sweep.setAttribute('x2',boundary);sweep.setAttribute('y1','0');sweep.setAttribute('y2','0');
   bloom.setAttribute('cx',minX+w/2);bloom.setAttribute('cy',minY+h/2);bloom.setAttribute('r',Math.max(.001,eased*Math.hypot(w,h)*.8));
   spatial.forEach(path=>{path.setAttribute('stroke',p===1?'var(--hover-color)':`url(#${kind==='sweep'?sweep.id:bloom.id})`);path.style.display=p>0?'':'none';});
  }
  if(kind==='glow'||kind==='highlight'||(kind==='pulse'&&reduced))fill.forEach(path=>{path.style.display='';path.style.opacity=String(kind==='highlight'?Math.min(1,p/.35):p);});
  if(kind==='glow')halo.forEach(path=>{path.style.display='';path.style.opacity=String(p*.65);});
  if(kind==='highlight'&&!reduced){const sheenProgress=easeCurve(Math.max(0,(highlightProgress-.35)/.65));const x=minX+w*(-.45+sheenProgress*1.9);sheen.setAttribute('x1',x-w*.25);sheen.setAttribute('x2',x+w*.25);sheen.setAttribute('y1',minY);sheen.setAttribute('y2',minY+h*.3);shine.forEach(path=>{path.style.display=highlightProgress>.35&&highlightProgress<1?'':'none';path.style.opacity=String(Math.max(0,Math.min(1,(1-sheenProgress)/.4)));});}
  if(kind==='ink')ink.forEach(path=>{path.style.display=p>0?'':'none';path.setAttribute('stroke-dasharray',`${eased} ${2-eased}`);path.setAttribute('stroke-dashoffset',String(-(1-eased)/2));});
 },
 dispose(){pulses?.forEach(({controller})=>controller.dispose());}
 };
}
