import test from 'node:test';
import assert from 'node:assert/strict';
import { init, sampleWalletLabel, walletTiming } from '../src/embeds/digital-wallet.js';

test('original three amounts start above, centered, and below; spare rows are concealed',()=>{
  const poses = [0,1,2,3,4].map(i=>sampleWalletLabel(0,i,770,t=>t));
  assert.deepEqual(poses.map(p=>p.y),[-57,0,57,114,-114]);
  assert.deepEqual(poses.map(p=>p.opacity),[1,1,1,0,0]);
});
test('every amount advances upward into the center and the five-item seam repeats exactly',()=>{
  for(let turn=0;turn<10;turn++) {
    const active=(turn+1)%5;
    assert.equal(sampleWalletLabel(turn*3850,active,770,t=>t).y,0);
    assert.equal(sampleWalletLabel((turn+1)*3850,active,770,t=>t).y,-57);
  }
  for(let i=0;i<5;i++)assert.deepEqual(sampleWalletLabel(0,i,770,t=>t),sampleWalletLabel(19250,i,770,t=>t));
});
test('invisible recycling stays invisible and easing does not affect the opacity clock',()=>{
  for(let t=0;t<=3850;t+=77) {
    const p=sampleWalletLabel(t,3,770,x=>x);
    assert.ok(p.y>=0 || p.opacity===0);
  }
  const outgoing=sampleWalletLabel(770*4,0,770,()=>.8);
  assert.equal(outgoing.y,-102.6);assert.equal(outgoing.opacity,.5);
});
test('carousel starts only after all three staggered hard entrances finish',()=>{
  const timing=walletTiming(770,200);
  assert.equal(timing.labelsStart,600);
  assert.equal(timing.loopStart,2050);
});

function fixture({missingTokens=false,failObserver=false,reduced=false}={}) {
  const keys=['window','document','getComputedStyle','matchMedia','IntersectionObserver','ResizeObserver','requestAnimationFrame','cancelAnimationFrame'];
  const saved=keys.map(k=>[k,globalThis[k]]),frames=new Map(),events=new Map(),observers=[];let next=0;
  const node=()=>({nodeType:1,dataset:{},style:{cssText:'',transform:'',opacity:''},textContent:'',clientWidth:540,isConnected:true,
    getBoundingClientRect:()=>({left:0,top:0,right:540,bottom:278,width:540,height:278})});
  const root=node(),frame=node(),rows=[node(),node(),node()],labels=Array.from({length:5},node),entrances=Array.from({length:5},node),value=node(),follower=node();
  value.dataset.dwValue='10820.41';value.textContent='$10,820.41';follower.dataset.maxOffset='6';
  root.matches=s=>s==='[data-digital-wallet]';
  root.querySelector=s=>({'.dw-frame':frame,'[data-dw-value]':value,'.dw-card-follow':follower})[s];
  root.querySelectorAll=s=>({'[data-dw-reveal]':rows,'[data-dw-label]':labels,'[data-dw-label-reveal]':entrances})[s]||[];
  const media={matches:reduced,addEventListener(k,fn){events.set('motion',fn)},removeEventListener(){events.delete('motion')}};
  globalThis.document={hidden:false,addEventListener(k,fn){events.set(k,fn)},removeEventListener(k){events.delete(k)}};
  globalThis.matchMedia=s=>s.includes('reduce')?media:{matches:false};
  const tokens={'--motion-ease-primary':'cubic-bezier(.11,.61,.27,.99)','--motion-duration-default':'770ms','--reveal-stagger-default':'200ms','--reveal-opacity-ratio':'.34'};
  globalThis.getComputedStyle=()=>({getPropertyValue:k=>missingTokens?'':tokens[k]||''});globalThis.window={getComputedStyle:globalThis.getComputedStyle};
  globalThis.requestAnimationFrame=fn=>{frames.set(++next,fn);return next};globalThis.cancelAnimationFrame=id=>frames.delete(id);
  globalThis.IntersectionObserver=class{constructor(fn){if(failObserver)throw Error('observer unavailable');this.fn=fn;observers.push(this)}observe(){}disconnect(){this.disconnected=true}};
  globalThis.ResizeObserver=class{observe(){}disconnect(){}};
  return {root,value,frames,events,observers,media,visible(v=true){observers.at(-1).fn([{isIntersecting:v,intersectionRatio:v?1:0}])},
    tick(now){const [id,fn]=frames.entries().next().value;frames.delete(id);fn(now)},
    restore(){for(const[k,v]of saved)v===undefined?delete globalThis[k]:globalThis[k]=v}};
}
test('duplicate mounting owns one stage; disposal restores balance and all listeners',()=>{
  const f=fixture();try{const dispose=init(f.root);init(f.root);assert.equal(f.observers.length,2);f.visible();f.tick(100);
    assert.equal(f.value.textContent,'$0.00');assert.equal(f.root.dataset.dwReady,'');
    dispose();assert.equal(f.value.textContent,'$10,820.41');assert.equal(f.frames.size,0);assert.equal(f.events.size,0);
    assert.equal(f.root.dataset.dwReady,undefined);const remount=init(f.root);assert.equal(f.observers.length,4);remount();
  }finally{f.restore()}
});
test('reduced motion restores the static balance and offscreen/hidden clocks pause',()=>{
  const f=fixture();try{const dispose=init(f.root);f.visible();f.tick(100);f.visible(false);assert.equal(f.frames.size,0);
    f.visible();document.hidden=true;f.events.get('visibilitychange')();assert.equal(f.frames.size,0);
    document.hidden=false;f.media.matches=true;f.events.get('motion')();f.tick(200);
    assert.equal(f.value.textContent,'$10,820.41');assert.equal(f.root.dataset.dwReady,undefined);assert.equal(f.frames.size,0);dispose();
  }finally{f.restore()}
});
for(const option of ['missingTokens','failObserver'])test(`${option} preserves the complete static fallback`,()=>{
  const f=fixture({[option]:true});const error=console.error;console.error=()=>{};
  try{const dispose=init(f.root);assert.equal(f.value.textContent,'$10,820.41');assert.equal(f.frames.size,0);assert.equal(f.root.dataset.dwReady,undefined);dispose()}
  finally{console.error=error;f.restore()}
});
