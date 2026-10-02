import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createDemoCursor, sampleCursor, clampProgress } from '../lib/effects/demo-cursor.js';
import { getPrimaryEase, getDefaultDurationMs } from '../lib/easing.js';
import { cubicBezier } from '../lib/motion.js';

const lerp = (a,b,p) => a+(b-a)*p;
export function approvalsState(time, ease = p => p) {
  const t = Math.max(0,time) % 18;
  const progress = (a,b) => ease(clampProgress((t-a)/(b-a)));
  const amount = progress(2.5,5) * (1-progress(10,12.5));
  const weeks = progress(6.3,8.8) * (1-progress(13.8,16.3));
  const ax=lerp(137,267,amount), tx=lerp(111,231,weeks);
  const points=[{time:0,x:270,y:160},{time:.7,x:270,y:160},{time:1.4,x:314,y:160},{time:2.5,x:137,y:109},{time:5,x:267,y:109},{time:5.6,x:267,y:109},{time:6.3,x:111,y:185},{time:8.8,x:231,y:185},{time:9.3,x:231,y:185},{time:10,x:267,y:109},{time:12.5,x:137,y:109},{time:13.1,x:137,y:109},{time:13.8,x:231,y:185},{time:16.3,x:111,y:185},{time:17,x:314,y:160},{time:17.7,x:270,y:160},{time:18,x:270,y:160}];
  return {amount:Math.round(lerp(12000,95000,amount)),weeks:lerp(3,14,weeks),ax,tx,...sampleCursor(points,t,ease),pressed:(t>=2.5&&t<5)||(t>=6.3&&t<8.8)||(t>=10&&t<12.5)||(t>=13.8&&t<16.3),behind:t<1||t>=17,opacity:clampProgress((t-.7)/.3)*(1-clampProgress((t-17.7)/.3))};
}

export function connectorGeometry(x,y) {
  return `M0 4C0 6.20914 1.79086 8 4 8C6.20914 8 8 6.20914 8 4C8 1.79086 6.20914 0 4 0C1.79086 0 0 1.79086 0 4ZM${x-4} ${y}C${x-4} ${y+2.2091} ${x-2.209} ${y+4} ${x} ${y+4}C${x+2.209} ${y+4} ${x+4} ${y+2.2091} ${x+4} ${y}C${x+4} ${y-2.2091} ${x+2.209} ${y-4} ${x} ${y-4}C${x-2.209} ${y-4} ${x-4} ${y-2.2091} ${x-4} ${y}ZM4 4H3.25V${y-6}H4H4.75V4H4ZM10 ${y}V${y+.75}H${x}V${y}V${y-.75}H10V${y}ZM4 ${y-6}H3.25C3.25 ${y-2.2721} 6.27208 ${y+.75} 10 ${y+.75}V${y}V${y-.75}C7.10051 ${y-.75} 4.75 ${y-3.1005} 4.75 ${y-6}H4Z`;
}
export const init=stageInitializer('[data-real-time-approvals]',root=>{
  const frame=root.querySelector('.rta-frame'), pointer=root.querySelector('.rta-cursor');
  const card=root.querySelector('.rta-approved'), connector=root.querySelector('.rta-connector');
  const loan=root.querySelector('.rta-loan'), connectorPath=connector?.querySelector('path');
  const amount=root.querySelector('[data-rta-value="amount"]'), weeks=root.querySelector('[data-rta-value="time"]');
  if(!frame||!pointer||!card||!connector||!connectorPath||!loan||!amount||!weeks)return;
  // Keep the static design intact until internally addressable sliders are installed.
  if (!['amount','time'].every(name=>root.querySelector(`svg[data-rta-slider="${name}"] g g`))) return;
  const raw=getPrimaryEase().match(/cubic-bezier\(([^)]+)\)/)?.[1].split(',').map(Number);
  if(!raw)return;
  const ease=cubicBezier(...raw), duration=getDefaultDurationMs()/1000, unit=duration/.77;
  const cursor=createDemoCursor(pointer,{designWidth:540,frame});
  const reveals=[...root.querySelectorAll('[data-rta-reveal]')];
  const original=reveals.map(n=>n.style.cssText);
  const originalPath=connectorPath.getAttribute('d');
  root.dataset.rtaReady='';
  let width=frame.getBoundingClientRect().width;
  function renderSlider(name,x,start){
    const svg=root.querySelector(`[data-rta-slider="${name}"]`);
    const fill=svg?.querySelector('rect:nth-child(2)'), thumb=svg?.querySelector('g g');
    if(fill)fill.setAttribute('width',String(x-58));
    if(thumb)thumb.setAttribute('transform',`translate(${x-start} 0)`);
  }
  const dispose=animateStage(root,{nodes:[card],update({time,reduced,dirty}){
    if(dirty)width=frame.getBoundingClientRect().width;
    root.style.setProperty('--rta-scale',width/540);
    reveals.forEach(n=>{const p=reduced?1:clampProgress((time-Number(n.dataset.rtaReveal)*unit)/duration);n.style.opacity=clampProgress(p/.34);n.style.transform=n.classList.contains('rta-avatar')?`translateX(${(1-ease(p))*12*width/540}px)`:`translateY(${(1-ease(p))*12*width/540}px)`;});
    const s=approvalsState(Math.max(0,(time-3.5*unit)/unit),ease);
    if(reduced){s.amount=12000;s.weeks=3;s.ax=137;s.tx=111;}
    amount.textContent=`${s.amount.toLocaleString('en-US')} USD`;
    weeks.textContent=`${Number(s.weeks.toFixed(1))} weeks`;
    renderSlider('amount',s.ax,137);renderSlider('time',s.tx,111);
    const bounds=frame.getBoundingClientRect(), box=card.getBoundingClientRect(), loanBox=loan.getBoundingClientRect();
    const scale=width/540;
    const slot=name=>root.querySelector(`[data-rta-slider="${name}"]`).getBoundingClientRect();
    const amountBox=slot('amount'), timeBox=slot('time');
    const target=(box,x)=>({x:(box.left-bounds.left)/scale+x,y:(box.top-bounds.top)/scale+5});
    const a0=target(amountBox,79),a1=target(amountBox,209),t0=target(timeBox,53),t1=target(timeBox,173);
    const hidden={x:(loanBox.right-bounds.left)/scale-30,y:(loanBox.top-bounds.top)/scale+130};
    const outside={x:(loanBox.right-bounds.left)/scale+16,y:hidden.y};
    const locations=[hidden,hidden,outside,a0,a1,a1,t0,t1,t1,a1,a0,a0,t1,t0,outside,hidden,hidden];
    const times=[0,.7,1.4,2.5,5,5.6,6.3,8.8,9.3,10,12.5,13.1,13.8,16.3,17,17.7,18];
    const position=sampleCursor(times.map((time,i)=>({time,...locations[i]})),Math.max(0,(time-3.5*unit)/unit)%18,ease);
    if(time<3.5*unit||reduced)cursor.hide();else cursor.render({...s,...position});
    const startX=(loanBox.left-bounds.left)/scale+127;
    const startY=(loanBox.bottom-bounds.top)/scale;
    const button=root.querySelector('.rta-button').getBoundingClientRect();
    const endX=(box.left-bounds.left)/scale-startX+4;
    const endY=(button.top+button.height/2-bounds.top)/scale-startY+4;
    connector.style.left=`${(startX-4)/540*100}%`;
    connector.style.top=`${(startY-4)/324*100}%`;
    connector.style.width=`${(endX+4)/540*100}cqi`;
    connector.style.height=`${(endY+4)/540*100}cqi`;
    const svg=connector.querySelector('svg');
    svg.setAttribute('height',endY+4);svg.setAttribute('width',endX+4);svg.setAttribute('viewBox',`0 0 ${endX+4} ${endY+4}`);
    connectorPath.setAttribute('d',connectorGeometry(endX,endY));
    // Trace the vertical leg before the horizontal leg without changing the source stroke.
    const draw=reduced?1:ease(clampProgress((time-.4*unit)/duration));
    const verticalFraction=Math.max(0,endY-4)/(Math.max(0,endY-4)+Math.max(0,endX-4));
    const revealY=draw<verticalFraction?4+(endY-4)*draw/verticalFraction:endY+4;
    const revealX=draw<verticalFraction?8:8+(endX-4)*clampProgress((draw-verticalFraction)/(1-verticalFraction));
    connector.style.clipPath=`inset(0 ${Math.max(0,endX+4-revealX)*scale}px ${Math.max(0,endY+4-revealY)*scale}px 0)`;
    if(draw===1)connector.style.clipPath='none';

  }});
  return()=>{dispose();cursor.dispose();delete root.dataset.rtaReady;root.style.removeProperty('--rta-scale');connectorPath.setAttribute('d',originalPath);connector.querySelector('svg').setAttribute('width','172');connector.querySelector('svg').setAttribute('height','43.5');connector.querySelector('svg').setAttribute('viewBox','0 0 172 43.5');connector.style.left='';connector.style.top='';connector.style.width='';reveals.forEach((n,i)=>n.style.cssText=original[i]);connector.style.height='';connector.style.clipPath='';amount.textContent='12,000 USD';weeks.textContent='3 weeks';renderSlider('amount',137,137);renderSlider('time',111,111);};
});
if(typeof document!=='undefined'){
  const key=Symbol.for('stitch.real-time-approvals.init');
  const mount=window[key] ||= init;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(),{once:true});else mount();
}
