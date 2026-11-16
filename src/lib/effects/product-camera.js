import { renderProductWorking } from './product-working.js';
const clamp=value=>Math.max(0,Math.min(1,value));
const promptText='Create a personal loan for salaried customers with direct deposit.';

export function renderProductCamera({elapsed,duration,ease,reduced=false,stage,screen,cameraPlane,cameraFields,prompt,promptSize,bar,title,policy,ask,askRow,layer,width,height,flatCamera=true,copy={}}) {
    const request=copy.request||promptText;
    // Same flat, masked prompt introduction as study 03; only the form plane moves.
    const u = elapsed / duration % 16.95;
    const typingStart=.65, typedAt=3.45, collapseAt=4.3, launch=5.2;
    const returning=u>=15.5;
    const promptReturn=clamp((u-15.5)/1.1);
    const returnEase=ease(promptReturn);
    const completed=u>=15.1 && promptReturn<1;
    const mask=ease(clamp((u-collapseAt)/.65))*(1-returnEase);
    const introFade=clamp((u-4.95)/.8);
    const exit=clamp((u-15.0)/1.4);
    bar.style.height=`${9.16666-4.33333*mask}cqi`;
    bar.style.overflow='hidden';
    askRow.style.height='4.33333cqi'; askRow.style.paddingBlock='.83333cqi';
    promptSize.style.transform='none';
    // The status stays above the atmosphere, with a 3cqi bottom inset.
    // Recenter using the live shell height while it expands, keeping travel smooth.
    const shellHeight=(matchMedia('(max-width:600px)').matches ? 34+64*(1-mask) : width*(9.16666-4.33333*mask)/100)*1.3;
    const promptTravel=(height*.5-width*.03-shellHeight/2)*ease(introFade)*(1-returnEase);
    prompt.style.transform=`translateY(calc(-50% + ${promptTravel}px)) scale(1.3)`;
    prompt.style.opacity=reduced?'0':'1';
    title.textContent=completed?(copy.completeTitle||'All required details have been completed.'):
      u<collapseAt||promptReturn>=1?(copy.idleTitle||'Ask Stitch AI'):(copy.workingTitle||'Creating personal loan...');
    policy.textContent=completed?(copy.policy||'Click Create loan product to proceed.'):'';
    bar.dataset.productState=completed||returning||u<typingStart?'idle':u<collapseAt?'typing':'working';
    ask.textContent=returning||u<=typingStart?(copy.ask||'Ask for another change…'):request.slice(0,Math.ceil(request.length*clamp((u-typingStart)/(typedAt-typingStart))));
    const workingOpacity=clamp((u-collapseAt)/.3)*(1-clamp((u-15.1)/.3));
    renderProductWorking(bar,u*duration,workingOpacity);
    renderProductWorking(promptSize,u*duration,workingOpacity);
    const sparkle=bar.querySelector('.lp-product-sparkle');
    if(sparkle){
      // Clockwise quarter-turn, primary-eased deceleration, then a brief rest.
      // Sample the completion angle from the same clock so return never snaps.
      const steppedAngle=time=>{
        const clock=Math.max(0,time-collapseAt);
        const turns=Math.floor(clock/1.6);
        return (turns+ease(clamp(clock-turns*1.6)))*90;
      };
      let angle=u<collapseAt?0:steppedAngle(Math.min(u,15.1));
      if(u>=15.1){
        const home=Math.ceil(angle/360)*360;
        angle+=(home-angle)*ease(clamp((u-15.1)/1));
      }
      sparkle.style.transform=`rotate(${reduced?0:angle}deg)`;
    }
    layer.style.opacity=reduced?'1':String(introFade*(1-exit));
    // Field centers are measured in the untransformed native form. Each pose
    // changes camera position, magnification and tilt together, without touching artwork.
    const center=index=>{
      return cameraFields[index].geometry;
    };
    const pose=(at,index,scale,rx,ry,rz)=>({at,...center(index),scale,rx,ry,rz});
    const wide={at:16.4,x:width/2,y:height/2,scale:1,rx:0,ry:0,rz:0};
    const shots=[pose(launch,0,2.85,10,-12,-2.5),pose(7.05,0,3.05,-9,10,2),
      pose(7.55,1,3,-7,14,2),pose(8.45,2,3,7,-12,-1.5),pose(9.35,3,3.05,-9,12,2),
      pose(9.95,4,2.25,11,-12,-2),pose(12.0,4,2.4,-10,12,2.5),
      pose(12.75,5,2.8,10,-12,-2),pose(13.6,6,2.9,-9,13,2),wide];
    let a=shots[0],b=a;
    for(let i=1;i<shots.length;i++){b=shots[i];if(u<b.at)break;a=b;}
    const shotProgress=clamp((u-a.at)/Math.max(.001,b.at-a.at));
    const mix=ease(shotProgress);
    const current=Object.fromEntries(['x','y','scale','rx','ry','rz'].map(key=>[key,a[key]+(b[key]-a[key])*mix]));
    // Pull back as the lock-in shot arrives, before counting begins; zoom
    // accelerates while the focal point stays fixed and tilt flattens late.
    if(b===wide && a!==wide) {
      // A frame-filling pullback: complete the visible rush before the
      // opacity tail hides it. Rotation keeps its own full-length smooth track.
      const zoomProgress=clamp((u-a.at)/2.65);
      current.scale=a.scale+(wide.scale-a.scale)*zoomProgress**2.4;
      // Rotation resolves gradually over the entire pullback, independently of
      // zoom acceleration. Symmetric time remapping spreads the primary curve
      // across the shot rather than holding and correcting in its final moments.
      const tiltIn=ease(shotProgress);
      const tiltOut=ease(1-shotProgress);
      const flatten=tiltIn/(tiltIn+tiltOut || 1);
      for(const key of ['rx','ry','rz']) current[key]=a[key]*(1-flatten);
      // Keep the lock-in field under the same screen-space anchor throughout
      // the pullback. Recentring on the full form here creates a vertical pan.
      current.x=a.x;
      current.y=a.y;
    }
    if(!reduced && u>=wide.at) {
      current.x=shots.at(-2).x;
      current.y=shots.at(-2).y;
      current.scale=wide.scale;
    }
    const c=reduced?wide:current;
    // Fixed high-resolution layout avoids zoom-driven relayout/raster flicker.
    // Camera scales this larger rendering down, never enlarging a small texture.
    const drift=reduced?0:Math.sin(Math.max(0,u-launch)*2.1)*(u>=13.6?1-clamp((u-13.6)/(wide.at-13.6)):1);
    const focusX=c.x*3.2;
    const focusY=c.y*3.2;
    // Protect the first input's left edge, including its projected tilt margin.
    const first=cameraFields[0].geometry;
    const firstWeight=1-ease(clamp((u-7.05)/.5));
    const description=cameraFields[4].geometry;
    const descriptionWeight=ease(clamp((u-9.35)/.6))*(1-ease(clamp((u-12.0)/.75)));
    const anchorFor=field=>width*.09+field.width*c.scale/2;
    const anchorX=width/2+(anchorFor(first)-width/2)*firstWeight+(anchorFor(description)-width/2)*descriptionWeight;
    const tilt=flatCamera?'':`perspective(${width*2}px) rotateX(${c.rx+drift*1.8}deg) rotateY(${c.ry+drift*2}deg) rotateZ(${c.rz}deg)`;
    cameraPlane.style.transform=`translate(${anchorX}px,${height/2}px) ${tilt} scale(${c.scale/3.2}) translate(${-focusX}px,${-focusY}px)`;
    // Selector commits happen while their camera pan is still in flight.
    const starts=[5.45,7.28,8.03,8.93,9.9,12.5,13.85];
    const lengths=[1.15,.16,.16,.16,1.85,.22,1.25];
    cameraFields.forEach(({value,final,placeholder,field},i)=>{
      const p=reduced?1:clamp((u-starts[i])/lengths[i]);
      value.textContent=i===6?(p<=0?placeholder:String(Math.min(3,1+Math.floor(p*3)))):
        p<=0?placeholder:value.dataset.productValue==='select'?(p>.2?final:placeholder):final.slice(0,Math.ceil(final.length*p));
      const changed=value.dataset.productValue==='select'?p>.2:p>.08;
      const control=field.querySelector('.lp-product-control');
      const pulse=p>0&&p<1?Math.sin(p*Math.PI):0;
      control.style.borderColor=changed?'#ffa38e':'#d1d1d1';
      control.style.boxShadow=`0 0 0 ${pulse*.23}cqi rgb(255 127 98 / ${pulse*.13})`;
      value.classList.toggle('study-value-empty',!changed);
      const marker=field.querySelector('.lp-product-marker, .lp-product-updated');
      if(marker){
        const badge=marker.classList.contains('lp-product-updated');
        const iconProgress=clamp((u-starts[i]-(value.dataset.productValue==='select'?.032:.04))/(badge?.38:.85));
        marker.style.opacity=reduced?'1':String(iconProgress);
        marker.style.transform=`scale(${.35+.65*ease(reduced?1:iconProgress)}) rotate(${(badge?0:-1080)*(1-ease(reduced?1:iconProgress))}deg)`;
      }
    });
  }
