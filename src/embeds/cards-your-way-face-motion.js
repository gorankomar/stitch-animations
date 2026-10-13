// Face ID reference: refinedmotion_ / Instagram DQAKER4jGdY.
// The original Figma path remains untouched and is restored on every exit.
const NS = 'http://www.w3.org/2000/svg';
const TAU = Math.PI * 2;
const clamp = x => Math.max(0, Math.min(1, x));
const ramp = (t,a,b) => clamp((t-a)/(b-a));
const mix = (a,b,p) => a+(b-a)*p;
export const FACE_CYCLE = 6;
// Compress only the ring rotation window: 2.45 duration units become .45.
// Everything after it shifts earlier with its original timing intact.
export function faceRecognitionTime(t) {
  if(t<=1.6)return t;
  if(t<2.05)return 1.6+(t-1.6)*2.45/.45;
  return t+2;
}

export function recognitionState(t, active, ease = x => x) {
  if (!active) return {active:false,morph:0,features:1,wire:0,check:0,checkDraw:0,rotation:0,settle:0,pulse:0};
  const clock=t;
  t=faceRecognitionTime(t);
  const enter = ramp(clock,.6,1.6), exit = ramp(t,6.5,7.4);
  const morph = ease(enter)*(1-ease(exit));
  const wire = ramp(clock,1.3,1.6)*(1-ramp(t,4.05,4.75));
  return {active:true,morph,features:1-ramp(clock,.6,1.35)+ramp(t,6.9,7.4),wire,
    check:ramp(t,4.6,4.95)*(1-ramp(t,6.5,6.95)),checkDraw:ease(ramp(t,4.6,5.3)),
    // Constant-rate scanning rotations; ease only into the aligned stop.
    rotation: Math.max(0,Math.min(t-1.1,3))*TAU/.95,
    settle:ease(ramp(t,4.05,4.75)),pulse:ease(ramp(t,4.7,5.05))*(1-ease(ramp(t,5.05,5.5)))};
}

export const FACE_RING_COLORS = ['#009AFF','#56B9FF','#6E7BEF','#43CDB2'];

export const FACE_RING_SPEEDS = [1.6,2.35,3.1,3.85];
export function faceRingOrientation(t,index,ease=x=>x) {
  const state=recognitionState(t,true,ease);
  // The corner-derived ring waits for its morph; colored rings start earlier.
  const start=index===0?1.6:1.3;
  const scanEnd=2.05;
  const progress=Math.max(0,Math.min(t,scanEnd)-start);
  const angle=progress*TAU*FACE_RING_SPEEDS[index];
  const angles={yaw:angle*.83,pitch:angle*.57,roll:angle};
  // Complete each positive rotation into the NEXT aligned revolution. Never
  // multiply accumulated rotation by a shrinking envelope (which rewinds it).
  Object.keys(angles).forEach(axis=>{
    const next=Math.ceil(angles[axis]/TAU)*TAU;
    angles[axis]=mix(angles[axis],next,state.settle);
  });
  return angles;
}

// A complete circle in its own plane, tilted around Y/X and rotated around Z.
// Orthographic projection preserves the footprint while producing skewed ellipses.
export function projectFaceRing(x,y,{yaw=0,pitch=0,roll=0}={}) {
  const a=x*Math.cos(yaw),z=-x*Math.sin(yaw);
  const b=y*Math.cos(pitch)-z*Math.sin(pitch);
  const depth=y*Math.sin(pitch)+z*Math.cos(pitch);
  return {x:36+20*(a*Math.cos(roll)-b*Math.sin(roll)),
    y:36+20*(a*Math.sin(roll)+b*Math.cos(roll)),z:depth};
}

export function faceRingPaths(orientation) {
  const paths=['',''];
  let last,previousSide;
  for(let i=0;i<=96;i++) {
    const angle=i/96*TAU;
    const p=projectFaceRing(Math.cos(angle),Math.sin(angle),orientation);
    const side=p.z>=0?1:0;
    if(side!==previousSide) {
      if(last)paths[previousSide]+=`L${p.x.toFixed(3)},${p.y.toFixed(3)}`;
      paths[side]+=`M${(last||p).x.toFixed(3)},${(last||p).y.toFixed(3)}`;
      previousSide=side;
    }
    paths[side]+=`L${p.x.toFixed(3)},${p.y.toFixed(3)}`;
    last=p;
  }
  return paths;
}

export function createFaceRecognition(svg) {
  const original=svg.querySelector('[data-cyw-face-path]');
  const check=svg.querySelector('[data-cyw-check]');
  const scan=svg.querySelector('[data-cyw-scan]');
  if(!original||!check) throw new Error('Face recognition artwork is incomplete');
  const saved=[original,check,scan].filter(Boolean).map(node=>({node,style:node.style.cssText}));
  const generated=[];
  const element=(tag,attrs,parent=svg)=>{
    const node=document.createElementNS(NS,tag);
    Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));
    parent.appendChild(node);generated.push(node);return node;
  };
  let group;
  try {
    group=element('g',{'data-cyw-recognition':'',opacity:0,'aria-hidden':'true',fill:'none',stroke:'#009AFF','stroke-width':2,'stroke-linecap':'round','stroke-linejoin':'round'});
    const pieces=original.getAttribute('d').match(/M[^M]*/g);
    if(pieces.length<8)throw new Error('Expected four face corners and facial features');
    const angles=[[-Math.PI/2,-Math.PI],[Math.PI/2,Math.PI],[0,-Math.PI/2],[0,Math.PI/2]];
    const corners=pieces.slice(0,4).map((d,i)=>{
      const node=element('path',{d},group);
      const length=node.getTotalLength();
      const points=Array.from({length:33},(_,j)=>{
        const p=node.getPointAtLength(length*j/32);
        const angle=mix(...angles[i],j/32);
        return {x:p.x,y:p.y,cx:36+20*Math.cos(angle),cy:36+20*Math.sin(angle)};
      });
      return {node,points};
    });
    const features=element('g',{},group);
    const eyes=pieces.slice(4,6).map(d=>element('path',{d},features));
    element('path',{d:pieces.slice(6).join('')},features);
    const rings=element('g',{'stroke-width':2,'data-cyw-scan-rings':''},group);
    const curves=FACE_RING_COLORS.slice(1).map((color,i)=>({index:i+1,
      back:element('path',{stroke:color,opacity:.38},rings),
      front:element('path',{stroke:color,opacity:.94},rings)}));
    const halo=element('circle',{cx:36,cy:36,r:20,'stroke-width':1,opacity:0},group);
    // Keep confirmation above the generated rings and corners.
    svg.appendChild(check);
    const checkLength=check.getTotalLength();
    function restore(){saved.forEach(({node,style})=>{node.style.cssText=style;});group.setAttribute('opacity','0');}
    return {
      render(t,active,ease){
        const state=recognitionState(t,active,ease);
        if(!state.active){restore();return;}
        original.style.opacity='0';if(scan)scan.style.opacity='0';group.setAttribute('opacity','1');
        const scale=1+state.pulse*.055;
        group.setAttribute('transform',`translate(36 36) scale(${scale}) translate(-36 -36)`);
        const mainOrientation=faceRingOrientation(t,0,ease);
        corners.forEach(({node,points})=>{
          node.setAttribute('d',points.map((p,i)=>{
            const target=projectFaceRing((p.cx-36)/20,(p.cy-36)/20,mainOrientation);
            return `${i?'L':'M'}${mix(p.x,target.x,state.morph).toFixed(3)},${mix(p.y,target.y,state.morph).toFixed(3)}`;
          }).join(''));
        });
        features.setAttribute('opacity',String(clamp(state.features)));
        const turn=ease(ramp(t,.6,1.05))*(1-ease(ramp(t,1.05,1.6)))*.17;
        features.setAttribute('transform',`translate(${turn*7} 0) translate(36 36) scale(${1-turn*.55} 1) translate(-36 -36)`);
        // One anticipatory blink while the icon acquires the face.
        const blink=1-.75*ease(ramp(t,.12,.23))*(1-ease(ramp(t,.23,.42)));
        eyes.forEach(node=>node.setAttribute('transform',`translate(0 28.8) scale(1 ${blink}) translate(0 -28.8)`));
        rings.setAttribute('opacity',String(state.wire));
        if(state.wire>0)curves.forEach(({index,back,front})=>{
          const [rear,near]=faceRingPaths(faceRingOrientation(t,index,ease));
          back.setAttribute('d',rear);front.setAttribute('d',near);
        });
        halo.setAttribute('r',String(20+state.pulse*4));halo.setAttribute('opacity',String(state.pulse*.2));
        check.style.opacity=String(state.check);check.style.strokeDasharray=String(checkLength);check.style.strokeDashoffset=String(checkLength*(1-state.checkDraw));
        check.style.transform=`translate(36px,36px) scale(${.88+.12*state.checkDraw}) translate(-36px,-36px)`;
      },
      dispose(){restore();group.remove();}
    };
  } catch(error) {
    generated.forEach(node=>node.remove());saved.forEach(({node,style})=>{node.style.cssText=style;});throw error;
  }
}
