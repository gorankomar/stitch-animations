const NS='http://www.w3.org/2000/svg';
// Preserve the supplied check-circle paths; the transient dots are additional artwork.
const RING='M36.6667 20C36.6667 29.2047 29.2047 36.6667 20 36.6667C10.7953 36.6667 3.33333 29.2047 3.33333 20C3.33333 10.7953 10.7953 3.33333 20 3.33333C29.2047 3.33333 36.6667 10.7953 36.6667 20Z';
export function createSendingConfirmation({host,title,duration,stagger,ease,opacityRatio,delay=0}) {
  let animations=[],timers=[],overlay,disposed=false;
  const originalTitle=title.textContent;
  const clear=()=>{animations.forEach(a=>a.cancel());animations=[];timers.forEach(clearTimeout);timers=[];};
  const dispose=()=>{disposed=true;clear();overlay?.remove();host.removeAttribute('data-es-sending');title.textContent=originalTitle;};
  const node=(tag,attrs)=>{const el=document.createElementNS(NS,tag);for(const [key,value]of Object.entries(attrs))el.setAttribute(key,String(value));return el;};
  const animate=(el,frames,options)=>{const animation=el.animate(frames,{fill:'both',...options});animations.push(animation);return animation;};
  const later=(fn,ms)=>{timers.push(setTimeout(()=>{if(!disposed){try{fn();}catch{dispose();}}},ms));};
  try {
    overlay=node('svg',{viewBox:'0 0 40 40','aria-hidden':'true',class:'es-send-animation',fill:'none'});
    const ring=node('path',{d:RING,stroke:'#0070FF','stroke-width':2.6,'stroke-linecap':'round',pathLength:1});
    const check=node('path',{d:'M12.5 20L17.5 25L27.5 15',stroke:'#0070FF','stroke-width':2.6,'stroke-linecap':'round','stroke-linejoin':'round',pathLength:1});
    const dots=Array.from({length:3},(_,i)=>node('circle',{cx:12+i*8,cy:20,r:1.6,fill:'#0070FF'}));
    overlay.append(ring,check,...dots);host.append(overlay);
    overlay.style.animationDuration='var(--motion-duration-fast)';
    const fastToken=getComputedStyle(overlay).animationDuration,fast=parseFloat(fastToken)*(fastToken.endsWith('ms')?1:1000);
    if(!Number.isFinite(fast))throw Error('Missing fast duration');
    host.setAttribute('data-es-sending','');title.textContent='Email sending';
    const fade=duration*opacityRatio;
    const swapTitle=(text,at)=>{animate(title,[{opacity:1},{opacity:0},{opacity:1}],{duration:fade*2,delay:at,easing:'linear',fill:'forwards'});later(()=>{title.textContent=text;},at+fade);};
    const cycle=(initialDelay=0)=>{
      clear();
      ring.style.strokeDasharray='1';ring.style.strokeDashoffset='1';ring.style.opacity='0';
      check.style.strokeDasharray='1';check.style.strokeDashoffset='1';check.style.opacity='0';
      const moveAt=initialDelay+duration*2,orbitAt=moveAt+stagger*2+fast,orbitEnd=orbitAt+duration*2;
      const checkAt=orbitEnd+fade,sentAt=checkAt+fast,returnAt=sentAt+duration*2,returnDotsAt=returnAt+fast*2,total=returnDotsAt+duration;
      dots.forEach((dot,i)=>{
        const x=12+i*8,phase=-i*Math.PI*2/3;
        const orbitPoint=t=>({transform:`translate(${20+16.6667*Math.cos(phase+4*Math.PI*t*t)-x}px,${16.6667*Math.sin(phase+4*Math.PI*t*t)}px)`});
        const position=orbitPoint(0);
        const frames=[{transform:'translate(0px,0px)',offset:0},{transform:'translate(0px,0px)',offset:(moveAt+i*stagger)/total,easing:ease},{...position,offset:(moveAt+i*stagger+fast)/total},{...position,offset:orbitAt/total}];
        for(let step=1;step<=72;step++){const t=step/72;frames.push({...orbitPoint(t),offset:(orbitAt+duration*2*t)/total});}
        frames.push({...orbitPoint(1),offset:returnDotsAt/total,easing:ease},{transform:'translate(0px,0px)',offset:1});
        animate(dot,frames,{duration:total,easing:'linear'});
        animate(dot,[{opacity:.2},{opacity:1},{opacity:.2}],{duration,delay:initialDelay+i*stagger,iterations:2,easing:'linear'});
        animate(dot,[{opacity:1},{opacity:0}],{duration:fade,delay:orbitEnd,easing:'linear',fill:'forwards'});
        animate(dot,[{opacity:0},{opacity:.2}],{duration:fade,delay:returnDotsAt,easing:'linear',fill:'forwards'});
      });
      animate(ring,[{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{duration,delay:orbitAt+duration,easing:ease});
      animate(ring,[{opacity:0},{opacity:1}],{duration:fade,delay:orbitAt+duration,easing:'linear',fill:'forwards'});
      animate(check,[{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{duration:fast,delay:checkAt,easing:ease});
      animate(check,[{opacity:0},{opacity:1}],{duration:fast*opacityRatio,delay:checkAt,easing:'linear',fill:'forwards'});
      swapTitle(originalTitle,sentAt);
      animate(check,[{strokeDashoffset:'0'},{strokeDashoffset:'1'}],{duration:fast,delay:returnAt,easing:ease,fill:'forwards'});
      animate(check,[{opacity:1},{opacity:0}],{duration:fast*opacityRatio,delay:returnAt,easing:'linear',fill:'forwards'});
      animate(ring,[{strokeDashoffset:'0'},{strokeDashoffset:'1'}],{duration:fast,delay:returnAt+fast,easing:ease,fill:'forwards'});
      animate(ring,[{opacity:1},{opacity:0}],{duration:fast*opacityRatio,delay:returnAt+fast,easing:'linear',fill:'forwards'});
      swapTitle('Email sending',returnAt+fast);
      later(()=>cycle(),total);
      return total;
    };
    const total=cycle(delay);
    return {duration:total,dispose};
  } catch(error) {dispose();throw error;}
}
