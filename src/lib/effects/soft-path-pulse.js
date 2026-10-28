// Canonical Create New Card pulse: a moving blue band with a soft tail along any SVG route.
// Caller owns the clock, visibility, and reduced-motion lifecycle. Time is in seconds.
export function createSoftPathPulse(path, {span=32, speed=48, color='#55bbff', reverse=false, start=0, period, random=Math.random, minDelay=.6, maxDelay=3.2}={}) {
  if (!(span>0 && speed>0 && minDelay>=0 && maxDelay>=minDelay)) throw new Error('Invalid pulse options');
  let length=path.getTotalLength();
  const saved=path.getAttribute('style');
  const segments=[path];
  const count=28;
  let step=span/32*1.15, duration=(length+span)/speed;
  let next=start;
  try {
    for(let i=1;i<count;i++) {
      const node=path.cloneNode(true);node.removeAttribute('id');path.parentNode.append(node);segments.push(node);
    }
    segments.forEach((node,i)=>{
      node.style.stroke=color;node.style.strokeDasharray=`${span/32*1.2} ${length+100}`;
      node.style.opacity='0';
    });
  } catch(error) {segments.slice(1).forEach(node=>node.remove());if(saved===null)path.removeAttribute('style');else path.setAttribute('style',saved);throw error;}
  return {
    refreshGeometry(nextSpan=span,nextSpeed=speed) {
      if(!(nextSpan>0&&nextSpeed>0))throw new Error('Invalid pulse geometry');
      length=path.getTotalLength();span=nextSpan;speed=nextSpeed;
      step=span/32*1.15;duration=(length+span)/speed;
      segments.forEach(node=>node.style.strokeDasharray=`${span/32*1.2} ${length+100}`);
    },
    update(time,reduced=false) {
      let phase=time-next;
      if(period)phase=((phase%period)+period)%period;
      else if(phase>=duration){next=time+minDelay+random()*(maxDelay-minDelay);phase=time-next;}
      const active=!reduced&&time>=start&&phase>=0&&phase<duration;
      const head=phase*speed;
      segments.forEach((node,i)=>{
        const position=reverse?length-head+i*step:head-i*step;
        node.style.strokeDashoffset=String(-position);
        node.style.opacity=active?String(Math.sin((i+.5)/count*Math.PI)**1.5):'0';
      });
    },
    dispose(){segments.slice(1).forEach(node=>node.remove());if(saved===null)path.removeAttribute('style');else path.setAttribute('style',saved);}
  };
}
