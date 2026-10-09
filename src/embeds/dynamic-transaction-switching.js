import { stageInitializer, animateStage } from '../lib/effects/animation-stage.js';
import { createPathPulse } from '../lib/effects/path-pulse.js';
import { createDotsField } from '../lib/effects/dots-field.js';
import { cubicBezier } from '../lib/motion.js';
import { toMs } from '../lib/time.js';

export function transactionPulseSchedule(speed=72,span=40,gap=.6){
 const starts={left:0,right:0,top:0,bottom:0};
 // Both horizontal heads travel under the side boxes to their center junctions.
 for(const side of ['left','right'])for(const direction of ['top','bottom'])starts[`${side}-${direction}`]=161/speed;
 return {starts,period:161/speed+(87.5+span)/speed+gap};
}
export function heartbeatScale(time,duration,ease){
 const phase=(time%(duration*2.4))/(duration*2.4),offsets=[0,.1,.22,.32,.48,1],values=[1,1.055,1,1.035,1,1];
 const i=offsets.findIndex((v,j)=>j<5&&phase>=v&&phase<offsets[j+1]);
 return values[i]+(values[i+1]-values[i])*ease((phase-offsets[i])/(offsets[i+1]-offsets[i]));
}
let serial=0;
export const init=stageInitializer('[data-dynamic-transaction-switching]',root=>{
 const badge=root.querySelector('[data-dts-heartbeat]'),paths=[...root.querySelectorAll('[data-dts-pulse]')];
 if(!badge||paths.length!==8)return;
 const css=getComputedStyle(root),duration=toMs(css.getPropertyValue('--motion-duration-default'),0)/1000;
 const curve=css.getPropertyValue('--motion-ease-primary').trim().match(/^cubic-bezier\(([^)]+)\)$/)?.[1].split(',').map(Number);
 if(!(duration>0)||curve?.length!==4||!curve.every(Number.isFinite))return;
 const ease=cubicBezier(...curve),schedule=transactionPulseSchedule(),pulses=[],saved=[];
 let stop,stopDots,disposed=false;
 const dots=root.querySelector('.dts-dots'),canvas=root.querySelector('[data-dts-dots]');
 const savedDots=dots?.style.backgroundImage,savedOpacity=canvas?.style.opacity;
 const mountDots=()=>{stopDots?.();stopDots=null;if(canvas?.getContext('2d')){stopDots=createDotsField({canvas,sensor:dots,interactive:false,options:{gap:root.clientWidth*16/540,baseSize:root.clientWidth*.6/540}});dots.style.backgroundImage='none';canvas.style.opacity='1';}};
 const original=badge.style.transform;
 const cleanup=()=>{if(disposed)return;disposed=true;stop?.();stopDots?.();if(dots)dots.style.backgroundImage=savedDots;if(canvas){canvas.style.opacity=savedOpacity;canvas.getContext('2d')?.clearRect(0,0,canvas.width,canvas.height);}pulses.forEach(p=>p.dispose());saved.forEach(([n,k,v])=>n.setAttribute(k,v));badge.style.transform=original;root.removeAttribute('data-dts-ready');};
 try{
  mountDots();
  const svg=root.querySelector('.dts-connectors'),prefix=`dts-${++serial}-`,ids=new Map([...svg.querySelectorAll('[id]')].map(n=>[n.id,prefix+n.id]));
  for(const node of svg.querySelectorAll('*'))for(const attr of [...node.attributes]){
   let value=attr.value;if(attr.name==='id'&&ids.has(value))value=ids.get(value);
   else for(const[id,newId]of ids)value=value.replaceAll(`url(#${id})`,`url(#${newId})`);
   if(value!==attr.value){saved.push([node,attr.name,attr.value]);node.setAttribute(attr.name,value);}
  }
  paths.forEach(path=>pulses.push(createPathPulse(path,{start:schedule.starts[path.dataset.dtsPulse],period:schedule.period})));
  stop=animateStage(root,{threshold:.1,update({time,reduced,dirty}){try{
   if(!root.isConnected){cleanup();return;}
   if(dirty)mountDots();
   badge.style.transform=reduced?original:`scale(${heartbeatScale(time,duration,ease)})`;
   pulses.forEach(p=>p.update(time,reduced));
  }catch(error){cleanup();console.warn('Dynamic transaction switching retained its static fallback.',error);}}});
  root.setAttribute('data-dts-ready','');
 }catch(error){cleanup();console.warn('Dynamic transaction switching retained its static fallback.',error);}
 return cleanup;
});
if(typeof document!=='undefined'){
 const mount=window[Symbol.for('stitch.dynamic-transaction-switching.init')] ||= init;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(),{once:true});else mount();
}
