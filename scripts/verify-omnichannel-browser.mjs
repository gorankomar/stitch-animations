const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1000,height:850}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto((process.env.OMNICHANNEL_PREVIEW_URL || 'http://127.0.0.1:5173/omnichannel-origination.html'));
await page.waitForFunction(()=>document.querySelector('[data-oo-ready]'));
const root=page.locator('[data-omnichannel-origination]').first();
const card=root.locator('.oo-reveal');
assert.equal(await card.evaluate(n=>getComputedStyle(n).opacity),'1');
assert.ok(await root.locator('[data-oo-ring]').evaluateAll(ns=>ns.every(n=>n.getBoundingClientRect().width>=340&&Number(getComputedStyle(n).opacity)>.7)));
await page.waitForTimeout(1000);
const positions=()=>root.locator('.oo-track').evaluateAll(ns=>ns.map(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).m41));
const first=await positions();await page.waitForTimeout(250);const later=await positions();
assert.ok(later[0]<first[0]&&later[1]>first[1]&&later[2]<first[2]);
assert.equal(await root.locator('[data-oo-ring]').count(),3);
// Sample a complete ring cycle, including wrap boundaries: radii never collide.
const ringCheck=await root.evaluate(n=>{
 const rings=[...n.querySelectorAll('[data-oo-ring]')];
 const animations=rings.map(r=>r.getAnimations());
 const movement=animations.map(as=>as.find(a=>a.effect.getKeyframes().some(k=>k.transform || k.width)));
 const fading=animations.map(as=>as.find(a=>a.effect.getKeyframes().some(k=>k.opacity!==undefined)));
 const cycle=movement[0].effect.getTiming().duration;
 const start=movement.map(a=>a.currentTime);
 const initial=rings.map(r=>({width:r.getBoundingClientRect().width,opacity:Number(getComputedStyle(r).opacity)}));
 [...movement,...fading].forEach(a=>a.pause());
 let gap=Infinity,visible=3;
 for(let step=0;step<=360;step++){
  movement.forEach((a,i)=>{a.currentTime=start[i]+cycle*step/360;fading[i].currentTime=a.currentTime;});
  const widths=rings.map(r=>r.getBoundingClientRect().width).sort((a,b)=>a-b);
  gap=Math.min(gap,widths[1]-widths[0],widths[2]-widths[1]);
  visible=Math.min(visible,rings.filter(r=>Number(getComputedStyle(r).opacity)>.01).length);
 }
 [...movement,...fading].forEach(a=>a.play());
 return {gap,visible,initial,linear:[...movement,...n.querySelectorAll('.oo-track')].every(x=>x.effect?x.effect.getTiming().easing==='linear':x.getAnimations().every(a=>a.effect.getTiming().easing==='linear'))};
});
assert.ok(ringCheck.initial.every(r=>r.width>=340&&r.opacity>.7));assert.ok(ringCheck.gap>110);assert.ok(ringCheck.visible>=2);assert.ok(ringCheck.linear);
assert.equal(await root.locator('.oo-title').innerText(),'Verification\nof income &\nemployment');
await page.mouse.move(720,330);await page.waitForTimeout(200);
assert.notEqual(await root.locator('.oo-follow').evaluate(n=>getComputedStyle(n).transform),'none');
// Every lap must replace its content without exposing a blank viewport.
await root.evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.effect.target.matches('.oo-track')).forEach(a=>a.currentTime=a.effect.getTiming().duration-1));
assert.ok(await root.locator('.oo-track').evaluateAll(ns=>ns.every(n=>n.getBoundingClientRect().right>n.closest('.oo-frame').getBoundingClientRect().right)));
// Mount twice, clean up once, then remount: no duplicate generated sequences.
const registry='stitch.omnichannel-origination.init';
await page.evaluate(key=>{window.ooDispose=window[Symbol.for(key)]();window[Symbol.for(key)]();},registry);
const count=await root.locator('[data-oo-generated]').count();
await page.evaluate(()=>window.ooDispose());assert.equal(await root.locator('[data-oo-generated]').count(),0);
assert.equal(await card.evaluate(n=>getComputedStyle(n).transform),'none');
await page.evaluate(key=>window[Symbol.for(key)](),registry);await page.waitForFunction(()=>document.querySelector('[data-oo-ready]'));assert.equal(await root.locator('[data-oo-generated]').count(),count);
// Offscreen clocks freeze.
await page.evaluate(()=>{document.querySelector('main').style.marginTop='2000px';});await page.waitForTimeout(100);
const paused=await positions();await page.waitForTimeout(120);assert.deepEqual(await positions(),paused);
await page.evaluate(()=>{document.querySelector('main').style.marginTop='0';});
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(50);
assert.equal(await root.locator('[data-oo-generated]').count(),0);assert.equal(await card.evaluate(n=>getComputedStyle(n).transform),'none');
assert.equal(await root.locator('.oo-follow').evaluate(n=>getComputedStyle(n).transform),'none');
// Two instances in different-width parents at the same viewport.
await page.evaluate(()=>{const main=document.querySelector('main'),copy=main.cloneNode(true);copy.style.width='258px';document.body.append(copy);});
const sizes=await page.locator('.oo-frame').evaluateAll(ns=>ns.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height,font:parseFloat(getComputedStyle(n.querySelector('.oo-title')).fontSize)})));
assert.ok(Math.abs(sizes[0].w/sizes[0].h-258/232)<.002);assert.ok(Math.abs(sizes[1].font/sizes[0].font-.5)<.01);
await page.setViewportSize({width:320,height:800});assert.ok(await root.locator('.oo-frame').evaluate(n=>Math.abs(n.getBoundingClientRect().width/n.getBoundingClientRect().height-258/232)<.002));
await root.screenshot({path:'/tmp/omnichannel-mobile.png'});
// JS-disabled fallback remains complete.
const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1000,height:850}});const fallback=await context.newPage();await fallback.goto((process.env.OMNICHANNEL_PREVIEW_URL || 'http://127.0.0.1:5173/omnichannel-origination.html'));
assert.equal(await fallback.locator('.oo-item').count(),10);assert.equal(await fallback.locator('.oo-svg').count(),14);await fallback.locator('.oo-frame').screenshot({path:'/tmp/omnichannel-fallback.png'});
// Setup failure must roll back all temporary content and leave the card visible.
const failing=await browser.newPage();await failing.addInitScript(()=>{Element.prototype.animate=function(){throw new Error('intentional animation setup failure')};});await failing.goto((process.env.OMNICHANNEL_PREVIEW_URL || 'http://127.0.0.1:5173/omnichannel-origination.html'));await failing.waitForTimeout(100);
assert.equal(await failing.locator('[data-oo-generated]').count(),0);assert.equal(await failing.locator('[data-oo-ready]').count(),0);assert.equal(await failing.locator('.oo-reveal').evaluate(n=>getComputedStyle(n).opacity),'1');
assert.deepEqual(errors,[]);
console.log(JSON.stringify({passed:true,directions:true,seamCoverage:true,pointerFollow:true,duplicateMountCleanup:true,offscreenPause:true,reducedMotion:true,twoParents:sizes,mobile:true,jsDisabled:true,partialFailureRollback:true}));
await browser.close();
