// Transform ownership belongs to the holder; SVG artwork keeps its own motion.
export function holderTiltTarget(box, x, y, reach = 80) {
  const dx=x-(box.left+box.width/2), dy=y-(box.top+box.height/2);
  const distance=Math.hypot(Math.max(0,Math.abs(dx)-box.width/2),Math.max(0,Math.abs(dy)-box.height/2));
  const strength=Math.max(0,1-distance/reach);
  const clamp=value=>Math.max(-1,Math.min(1,value));
  return {rx:-clamp(dy/(box.height/2))*17*strength,ry:clamp(dx/(box.width/2))*17*strength,
    lightX:50+clamp(dx/(box.width/2))*50,lightY:50+clamp(dy/(box.height/2))*50,strength};
}

export function createHolderTilt({root,selector='.icon-button'}) {
  const holders=[...root.querySelectorAll(selector)];
  // Measure the resting plane once; transformed bounds must not feed back into tilt.
  let boxes=holders.map(holder=>holder.getBoundingClientRect());
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  let enabled=true,point=null,frame=0;
  function reset(){for(const holder of holders){holder.style.removeProperty('transform');holder.style.setProperty('--holder-light-opacity','0');}}
  function render(){frame=0;if(!enabled||reduced.matches||!fine.matches||!point){reset();return;}
    for(const [index,holder] of holders.entries()){const target=holderTiltTarget(boxes[index],point.x,point.y);
      holder.style.transform=`perspective(410px) rotateX(${target.rx}deg) rotateY(${target.ry}deg)`;
      holder.style.setProperty('--holder-light-x',`${target.lightX}%`);holder.style.setProperty('--holder-light-y',`${target.lightY}%`);
      holder.style.setProperty('--holder-light-opacity',String(target.strength));
    }
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(render);}
  function move(event){if(!point)boxes=holders.map(holder=>{const rect=holder.getBoundingClientRect();return {left:rect.left+(rect.width-holder.offsetWidth)/2,top:rect.top+(rect.height-holder.offsetHeight)/2,width:holder.offsetWidth,height:holder.offsetHeight};});if(event.pointerType==='touch')return;point={x:event.clientX,y:event.clientY};schedule();}
  function leave(){point=null;schedule();}
  function visibility(){if(document.hidden)leave();}
  document.addEventListener('pointermove',move,{passive:true});
  document.documentElement.addEventListener('pointerleave',leave);
  window.addEventListener('blur',leave);window.addEventListener('scroll',leave,{passive:true});window.addEventListener('resize',leave);
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',schedule);fine.addEventListener('change',schedule);
  return {setEnabled(value){enabled=Boolean(value);render();},dispose(){cancelAnimationFrame(frame);reset();document.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);window.removeEventListener('blur',leave);window.removeEventListener('scroll',leave);window.removeEventListener('resize',leave);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',schedule);fine.removeEventListener('change',schedule);}};
}
