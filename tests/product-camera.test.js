import test, {before,after} from 'node:test';
const savedMatchMedia=globalThis.matchMedia;
before(()=>{globalThis.matchMedia=()=>({matches:false});});
after(()=>{if(savedMatchMedia===undefined)delete globalThis.matchMedia;else globalThis.matchMedia=savedMatchMedia;});
import assert from 'node:assert/strict';
import { renderProductCamera } from '../src/lib/effects/product-camera.js';

function scene(){
  const node=()=>({style:{setProperty(k,v){this[k]=v;}},dataset:{},classList:{toggle(){}},textContent:''});
  const sparkle=node(),bar=node();bar.querySelector=()=>sparkle;
  const cameraFields=Array.from({length:7},(_,i)=>{
    const value=node(),control=node(),marker=node();marker.classList={contains:()=>i===6};
    value.dataset.productValue=i===1||i===2||i===3||i===5?'select':'type';
    return {value,final:i===6?'3':`Final ${i}`,placeholder:`Placeholder ${i}`,geometry:{x:100+i*100,y:i<4?160:i===4?280:400,width:220},
      field:{querySelector:s=>s==='.lp-product-control'?control:marker},control,marker};
  });
  return {elapsed:0,duration:1,ease:p=>p,flatCamera:true,reduced:false,width:1200,height:650,
    stage:node(),screen:node(),cameraPlane:node(),cameraFields,prompt:node(),promptSize:node(),bar,
    title:node(),policy:node(),ask:node(),askRow:node(),layer:node(),sparkle};
}
const render=(s,t)=>{s.elapsed=t;renderProductCamera(s);};
const angle=s=>Number(s.sparkle.style.transform.match(/rotate\(([^d]+)/)[1]);

test('flat camera preserves field feedback, fixed pullback center and continuous prompt loop',()=>{
  const s=scene();render(s,0);
  assert.equal(s.cameraFields[0].control.style.borderColor,'#d1d1d1');
  render(s,8.3);assert.equal(s.cameraFields[2].value.textContent,'Final 2');
  assert.equal(s.cameraFields[2].control.style.borderColor,'#ffa38e');
  for(const t of [5.5,9.7,13.6,14.5,16]){
    render(s,t);assert.doesNotMatch(s.cameraPlane.style.transform,/rotate|perspective/);
  }
  render(s,13.6);const center=s.cameraPlane.style.transform.match(/translate\((-[\d.]+px),(-[\d.]+px)\)$/)[0];
  render(s,15.9);assert.ok(s.cameraPlane.style.transform.endsWith(center));
  render(s,16.949);const before={height:s.bar.style.height,text:s.ask.textContent,opacity:s.prompt.style.opacity};
  render(s,16.95);assert.equal(s.ask.textContent,before.text);assert.equal(s.prompt.style.opacity,before.opacity);
  assert.ok(Math.abs(parseFloat(s.bar.style.height)-parseFloat(before.height))<.001);
});

test('sparkle pauses between clockwise turns and completes clockwise to its home orientation',()=>{
  const s=scene();render(s,5.4);const paused=angle(s);render(s,5.8);assert.equal(angle(s),paused);
  let previous=0;
  for(let t=4.3;t<=16.2;t+=.01){render(s,t);const next=angle(s);assert.ok(next>=previous-1e-8);previous=next;}
  render(s,16.3);assert.equal(angle(s)%360,0);
  s.reduced=true;render(s,8);assert.equal(angle(s),0);assert.equal(s.prompt.style.opacity,'0');
});

test('camera uses native localized status copy without changing field sequence',()=>{
  const s=scene();s.copy={idleTitle:'Local ask',workingTitle:'Local creating',request:'Local request',completeTitle:'Local complete',policy:'Local policy',ask:'Local next change'};
  render(s,0);assert.equal(s.title.textContent,'Local ask');assert.equal(s.ask.textContent,'Local next change');
  render(s,5);assert.equal(s.title.textContent,'Local creating');
  render(s,15.2);assert.equal(s.title.textContent,'Local complete');assert.equal(s.policy.textContent,'Local policy');
});

test('RTL first shot protects the right starting edge and preserves every later shot',()=>{
  const ltr=scene(),rtl=scene();rtl.rtl=true;
  for(const time of [5.2,5.8,6.5,7.05]){
    render(ltr,time);render(rtl,time);
    const x=s=>Number(s.cameraPlane.style.transform.match(/^translate\(([^p]+)px/)[1]);
    assert.ok(Math.abs(x(ltr)+x(rtl)-ltr.width)<1e-8,'first-shot anchors mirror exactly');
    const scale=Number(rtl.cameraPlane.style.transform.match(/scale\(([^)]+)\)/)[1])*3.2;
    const right=x(rtl)+rtl.cameraFields[0].geometry.width*scale/2;
    assert.ok(Math.abs(right-rtl.width*.91)<1e-8,'RTL input starts 9% inside the right edge');
  }
  for(const time of [7.55,8.45,9.95,12.75,13.6,15.9]){
    render(ltr,time);render(rtl,time);
    assert.equal(rtl.cameraPlane.style.transform,ltr.cameraPlane.style.transform,'later shots are unchanged');
  }
});
