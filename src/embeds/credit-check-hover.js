import {make, setPath, roundedPath} from '../lib/effects/connector.js';

// Keep routing attached to the rendered card edges, including CSS hover/reveal.
export function creditCheckRoute(start, end, bend) {
 return {
  line:roundedPath([start,{x:start.x,y:bend},{x:end.x,y:bend},end],4),
  arrow:`M ${end.x-3.5355} ${end.y-3.5355} L ${end.x} ${end.y} L ${end.x+3.5355} ${end.y-3.5355}`
 };
}

export function createCreditCheckHover(root, {duration, ease}) {
 const top=root.querySelector?.('.cc-credit-position .cc-card');
 const bottom=root.querySelector?.('.cc-decline-position .cc-card');
 const host=root.querySelector?.('.cc-flow');
 if(!top||!bottom||!host)return;
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 const animations=new Set(), listeners=[];
 let enabled=false, svg, line, dot, arrow, raf=0, until=0;
 const render=()=>{
  const h=host.getBoundingClientRect(), a=top.getBoundingClientRect(), b=bottom.getBoundingClientRect();
  if(!h.width||!h.height)return;
  const x=r=>(r.left+r.width/2-h.left)*540/h.width;
  const start={x:x(a),y:(a.bottom-h.top)*278/h.height};
  const end={x:x(b),y:(b.top-h.top)*278/h.height};
  const route=creditCheckRoute(start,end,155);
  setPath(line,route.line);setPath(arrow,route.arrow);
  dot.setAttribute('cx',start.x);dot.setAttribute('cy',start.y);
 };
 const frame=time=>{raf=0;if(!enabled)return;render();if(time<until)raf=requestAnimationFrame(frame);};
 const track=()=>{if(!enabled)return;until=performance.now()+duration*2;render();if(!raf)raf=requestAnimationFrame(frame);};
 const spin=icon=>{
  if(!enabled||!fine.matches||!icon?.animate||[...animations].some(a=>a.effect?.target===icon))return;
  const animation=icon.animate([{rotate:'0deg'},{rotate:'720deg'}],{duration:duration*2,easing:ease});
  animations.add(animation);
  animation.onfinish=()=>{animations.delete(animation);animation.cancel();};
 };
 const on=(node,event,handler)=>{if(!node)return;node.addEventListener(event,handler);listeners.push(()=>node.removeEventListener(event,handler));};
 [top,bottom].forEach(card=>{on(card,'pointerenter',track);on(card,'pointerleave',track);});
 on(root.querySelector('.cc-add'),'pointerenter',()=>spin(root.querySelector('.cc-plus-position svg')));
 on(bottom,'pointerenter',()=>spin(root.querySelector('.cc-close-position svg')));
 const stop=()=>{
  enabled=false;cancelAnimationFrame(raf);raf=0;
  animations.forEach(a=>a.cancel());animations.clear();
  root.removeAttribute('data-cc-connector-ready');svg?.remove();svg=null;
 };
 let resize;
 if(typeof ResizeObserver!=='undefined'){resize=new ResizeObserver(track);resize.observe(root);resize.observe(top);resize.observe(bottom);}
 return {
  setEnabled(value){
   if(value===enabled)return;
   if(!value){stop();return;}
   try{
    svg=make('svg',host,{class:'cc-connector-live',viewBox:'0 0 540 278',preserveAspectRatio:'none','aria-hidden':'true'});
    line=make('path',svg,{fill:'none',stroke:'#d1d1d1','stroke-width':1});
    dot=make('circle',svg,{r:2.66667,fill:'#d1d1d1'});
    arrow=make('path',svg,{fill:'none',stroke:'#d1d1d1','stroke-width':1,'stroke-linecap':'round','stroke-linejoin':'round'});
    enabled=true;track();root.setAttribute('data-cc-connector-ready','');
   }catch{stop();}
  },
  dispose(){stop();resize?.disconnect();listeners.forEach(fn=>fn());}
 };
}
