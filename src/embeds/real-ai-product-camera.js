import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { renderProductCamera } from '../lib/effects/product-camera.js';
import { getDefaultDurationMs } from '../lib/easing.js';
import { readMotionEasingCurve } from '../lib/motion.js';

// Native Webflow content is the static fallback. This runtime owns motion only.
export const init = stageInitializer('[data-real-ai-product-camera]', stage => {
  const screen=stage.querySelector('.lp-product-content');
  const cameraPlane=stage.querySelector('.real-ai-product-camera-plane');
  const layer=stage.querySelector('.real-ai-product-camera-fields');
  const prompt=stage.querySelector('.real-ai-product-camera-prompt');
  const promptSize=stage.querySelector('.real-ai-product-camera-shell');
  const bar=stage.querySelector('.lp-product-bar');
  if(!screen||!cameraPlane||!layer||!prompt||!promptSize||!bar)return;
  const title=bar.querySelector('.lp-product-change-title');
  const policy=bar.querySelector('.lp-product-policy');
  const ask=bar.querySelector('.lp-product-prompt');
  const askRow=bar.querySelector('.lp-product-ask');
  if(!title||!policy||!ask||!askRow)return;
  const styles=[stage,...stage.querySelectorAll('*')].map(node=>[node,node.getAttribute('style')]);
  const readCopy=(key,fallback)=>stage.querySelector(`[data-product-copy="${key}"]`)?.textContent||fallback;
  const copy={idleTitle:readCopy('idle-title','Ask Stitch AI'),workingTitle:readCopy('working-title','Creating personal loan...'),request:readCopy('request','Create a personal loan for salaried customers with direct deposit.'),completeTitle:title.textContent,policy:policy.textContent,ask:ask.textContent};
  const cameraFields=[...screen.querySelectorAll('[data-product-value], [data-product-lock]')].map((value,index)=>({
    value,final:value.hasAttribute('data-product-lock')?'3':value.textContent,
    placeholder:value.dataset.productPlaceholder||readCopy(value.hasAttribute('data-product-lock')?'lock-placeholder':`placeholder-${index}`,'Enter months'),field:value.closest('.lp-product-field')
  }));
  const text=[title,policy,ask,...cameraFields.map(item=>item.value)].map(node=>[node,node.textContent]);
  const initialState=bar.getAttribute('data-product-state');
  const ease=readMotionEasingCurve(),duration=getDefaultDurationMs()/1000;
  let width=0,height=0,elapsed=0;
  function measure(){
    width=stage.clientWidth;height=stage.clientHeight;
    screen.style.zoom='1';screen.style.width=`${width}px`;screen.style.minHeight=`${height}px`;
    cameraFields.forEach(item=>{const f=item.field;item.geometry={x:f.offsetLeft+f.offsetWidth/2,y:f.offsetTop+f.offsetHeight/2,width:f.offsetWidth};});
    screen.style.zoom='3.2';
  }
  function render(reduced){
    renderProductCamera({elapsed,duration,ease,reduced,stage,screen,cameraPlane,cameraFields,prompt,promptSize,bar,title,policy,ask,askRow,layer,width,height,flatCamera:true,copy});
    if(matchMedia('(max-width:600px)').matches){
      const open=Math.max(0,Math.min(1,(parseFloat(bar.style.height)-4.83333)/4.33333));
      const promptWidth=width*.88/1.3;
      prompt.style.width=`${promptWidth}px`;prompt.style.left=`${(width-promptWidth)/2}px`;
      bar.style.height=`${34+64*open}px`;askRow.style.height=`${64*open}px`;askRow.style.paddingBlock=`${6*open}px`;
    }else{prompt.style.width='';prompt.style.left='';}
  }
  function restore(){
    styles.forEach(([node,value])=>value===null?node.removeAttribute('style'):node.setAttribute('style',value));
    text.forEach(([node,value])=>{node.textContent=value;});
    cameraFields.forEach(({value})=>value.classList.remove('study-value-empty'));
    if(initialState===null)bar.removeAttribute('data-product-state');else bar.setAttribute('data-product-state',initialState);
  }
  let stop;
  try{
    measure();render(matchMedia('(prefers-reduced-motion: reduce)').matches);
    stop=animateStage(stage,{update({dt,reduced,dirty}){
      if(dirty&&(width!==stage.clientWidth||height!==stage.clientHeight))measure();
      if(!reduced)elapsed+=dt;
      render(reduced);
    }});
  }catch(error){restore();throw error;}
  return()=>{stop?.();restore();};
});
