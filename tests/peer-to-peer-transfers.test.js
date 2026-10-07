import test from 'node:test';
import assert from 'node:assert/strict';
import { init, transferTiming } from '../src/embeds/peer-to-peer-transfers.js';
function fixture({missingTokens=false,failObserver=false,reduced=false}={}) {
  const keys=['window','document','getComputedStyle','matchMedia','IntersectionObserver','ResizeObserver','requestAnimationFrame','cancelAnimationFrame'];
  const saved=keys.map(k=>[k,globalThis[k]]),frames=new Map(),events=new Map(),observers=[];let next=0;
  const node=()=>({nodeType:1,dataset:{},style:{cssText:'',transform:'',opacity:''},textContent:'',clientWidth:540,isConnected:true,
    getBoundingClientRect:()=>({left:0,top:0,right:540,bottom:278,width:540,height:278})});
  const root=node(),frame=node(),rows=[node(),node(),node(),node()],labels=Array.from({length:5},node),entrances=Array.from({length:5},node),value=node(),follower=node();
  value.dataset.p2pValue='8500';value.textContent='$8,500';follower.dataset.maxOffset='6';
  root.matches=s=>s==='[data-peer-to-peer-transfers]';
  root.querySelector=s=>({'.p2p-frame':frame,'.rp-screen':frame,'[data-p2p-value]':value,'.dw-card-follow':follower})[s];
  root.querySelectorAll=s=>({'[data-p2p-hard]':rows,'[data-p2p-soft]':rows,'[data-p2p-label]':labels,'[data-p2p-label-reveal]':entrances})[s]||[];
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
  const f=fixture();try{const dispose=init(f.root);init(f.root);assert.equal(f.observers.length,1);f.visible();f.tick(100);
    assert.equal(f.value.textContent,'$0');assert.equal(f.root.dataset.p2pReady,'');
    dispose();assert.equal(f.value.textContent,'$8,500');assert.equal(f.frames.size,0);assert.equal(f.events.size,0);
    assert.equal(f.root.dataset.p2pReady,undefined);const remount=init(f.root);assert.equal(f.observers.length,2);remount();
  }finally{f.restore()}
});
test('reduced motion restores the static balance and offscreen/hidden clocks pause',()=>{
  const f=fixture();try{const dispose=init(f.root);f.visible();f.tick(100);f.visible(false);assert.equal(f.frames.size,0);
    f.visible();document.hidden=true;f.events.get('visibilitychange')();assert.equal(f.frames.size,0);
    document.hidden=false;f.media.matches=true;f.events.get('motion')();f.tick(200);
    assert.equal(f.value.textContent,'$8,500');assert.equal(f.root.dataset.p2pReady,undefined);assert.equal(f.frames.size,0);dispose();
  }finally{f.restore()}
});
for(const option of ['missingTokens','failObserver'])test(`${option} preserves the complete static fallback`,()=>{
  const f=fixture({[option]:true});const error=console.error;console.error=()=>{};
  try{const dispose=init(f.root);assert.equal(f.value.textContent,'$8,500');assert.equal(f.frames.size,0);assert.equal(f.root.dataset.p2pReady,undefined);dispose()}
  finally{console.error=error;f.restore()}
});
