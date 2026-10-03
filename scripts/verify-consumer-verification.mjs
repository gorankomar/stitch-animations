import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true});
const url=process.env.CONSUMER_PREVIEW_URL || 'http://127.0.0.1:5173/consumer-verification.html';
const page=await browser.newPage({viewport:{width:1000,height:850}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForFunction(()=>document.querySelector('[data-cv-ready]'));
assert.equal(await page.locator('[data-cv-pulse]').count(),48);assert.equal(await page.locator('[data-cv-pale]').count(),48);
assert.equal(await page.locator('[data-cv-label-component]').count(),10);
assert.ok(await page.locator('.cv-icon svg').evaluateAll(ns=>ns.every(n=>n.getBoundingClientRect().width>0)));
const fades=await page.locator('[data-cv-pulse]').evaluateAll(ns=>ns.map(p=>{
 const id=p.style.stroke.match(/#([^"')]+)/)[1],gradient=p.ownerSVGElement.querySelector(`[id="${id}"]`);
 const sourceId=p.getAttribute('stroke').match(/#([^"')]+)/)[1],source=p.ownerSVGElement.querySelector(`[id="${sourceId}"]`);
 return {span:parseFloat(p.style.strokeDasharray),cloneStops:[...gradient.querySelectorAll('stop')].map(s=>[s.getAttribute('offset'),s.getAttribute('stop-opacity')]),sourceStops:[...source.querySelectorAll('stop')].map(s=>[s.getAttribute('offset'),s.getAttribute('stop-opacity')]),colors:[...gradient.querySelectorAll('stop')].map(s=>s.getAttribute('stop-color'))};
}));
assert.ok(fades.every(f=>Math.abs(f.span-7.8)<.001));fades.forEach(f=>{assert.deepEqual(f.cloneStops,f.sourceStops);assert.ok(f.colors.every(c=>c.includes('primary-blue')))});

const dark=()=>page.locator('[data-cv-lines] path:not([data-cv-pale]):not([data-cv-pulse])').evaluateAll(ns=>ns.map(n=>n.outerHTML));
const before=await dark();assert.equal(before.length,8);
const hub=page.locator('.cv-consumer').first();const hubY=await hub.evaluate(n=>n.getBoundingClientRect().y);
await hub.hover();await page.waitForTimeout(500);assert.equal(await hub.evaluate(n=>n.getBoundingClientRect().y),hubY);
for(const name of ['documents','income','identity','employment']){
 const label=page.locator(`.cv-position-${name} .cv-label`).first(),initial=await label.evaluate(n=>n.getBoundingClientRect().y);
 await label.hover();await page.waitForTimeout(500);const lifted=await label.evaluate(n=>n.getBoundingClientRect().y);const expected=await label.evaluate(n=>Math.min(n.closest('.cv-graphic').clientWidth*.012,n.closest('.cv-graphic').clientHeight* .013344827586));assert.ok(Math.abs(initial-lifted-expected)<.1);
}
assert.deepEqual(await dark(),before);
await page.mouse.move(0,0);await page.waitForTimeout(500);
await page.locator('.cv-frame').first().screenshot({path:'/tmp/consumer-motion.png'});
// Mount twice, cleanup, then remount without duplicates.
await page.evaluate(()=>{window.cvDispose=window[Symbol.for('stitch.consumer-verification.init')]();window[Symbol.for('stitch.consumer-verification.init')]();});assert.equal(await page.locator('[data-cv-pulse]').count(),48);
await page.evaluate(()=>window.cvDispose());assert.equal(await page.locator('[data-cv-pulse]').count(),0);assert.ok((await dark()).every(d=>d.includes('d="M -2048')));
await page.evaluate(()=>window[Symbol.for('stitch.consumer-verification.init')]());assert.equal(await page.locator('[data-cv-pulse]').count(),48);
await page.evaluate(()=>document.querySelector('main').style.marginTop='2000px');await page.waitForTimeout(100);
const offsets=()=>page.locator('[data-cv-pulse]').evaluateAll(ns=>ns.map(n=>n.style.strokeDashoffset));const paused=await offsets();await page.waitForTimeout(100);assert.deepEqual(await offsets(),paused);
await page.evaluate(()=>document.querySelector('main').style.marginTop='0');await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);assert.ok(await page.locator('[data-cv-pulse]').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).opacity==='0')));
// Equal-width frames with different parent ratios, and height-only resize.
const sizes = await page.locator('.cv-frame').evaluateAll(ns => ns.map(n => ({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height,font:parseFloat(getComputedStyle(n.querySelector('.cv-label-text')).fontSize)})));
assert.ok(Math.abs(sizes[0].w / sizes[0].h - 258/232)<.002);
assert.ok(Math.abs(sizes[1].w / sizes[1].h - 540/324)<.002);
const wide = page.locator('.cv-shell-wide');
await wide.evaluate(n => {n.style.aspectRatio='auto'; n.style.height='250px';});
await page.waitForTimeout(100);
assert.ok(Math.abs(await wide.locator('.cv-frame').evaluate(n=>n.getBoundingClientRect().height)-250)<1);
const alignment = () => wide.locator('[data-cv-lines]').evaluateAll(svgs=>svgs.map(svg=>{
 const path=svg.querySelector('path:not([data-cv-pale]):not([data-cv-pulse])'), outer=path.getPointAtLength(path.getTotalLength()), inner=path.getPointAtLength(0), slot=svg.getBoundingClientRect(), vb=svg.viewBox.baseVal;
 const right=svg.dataset.cvLines.startsWith('right'), top=svg.dataset.cvLines.endsWith('top');
 const name=top?(right?'income':'documents'):(right?'employment':'identity');
 const stage=svg.closest('.cv-graphic'),label=stage.querySelector('.cv-position-'+name).getBoundingClientRect(),hub=stage.querySelector('.cv-consumer').getBoundingClientRect();
 const x=p=>slot.left+(right?p.x:vb.width-p.x)/vb.width*slot.width;
 return {stem:x(outer),center:(label.left+label.right)/2,inner:x(inner),innerY:slot.top+inner.y/vb.height*slot.height,hub:(hub.left+hub.right)/2,hubY:(hub.top+hub.bottom)/2,uniform:Math.abs(slot.width/vb.width-slot.height/vb.height)<.001};
}));
assert.ok((await alignment()).every(a=>Math.abs(a.stem-a.center)<.5 && Math.abs(a.inner-a.hub)<.5 && Math.abs(a.innerY-a.hubY)<.5 && a.uniform));
await page.evaluate(async()=>{
 const {setConsumerVerificationSlots}=await import('/src/embeds/consumer-verification.js');
 const stage=document.querySelector('.cv-shell-wide .cv-graphic');
 const icon=document.querySelector('[data-cv-slot="documents"] .cv-icon svg');
 setConsumerVerificationSlots(stage,{center:{label:'Person',icon},documents:{label:'Financial documents'},employment:{label:'Work'}});
});
await page.waitForTimeout(100);
assert.equal(await wide.locator('[data-cv-slot="center"] [data-cv-label-text]').textContent(),'Person');
assert.equal(await wide.locator('[data-cv-slot="center"] .cv-icon svg').count(),1);
assert.ok((await alignment()).every(a=>Math.abs(a.stem-a.center)<.5 && Math.abs(a.inner-a.hub)<.5 && Math.abs(a.innerY-a.hubY)<.5 && a.uniform));
// The reported regression: ratio-free short parents, then taller parents.
await wide.evaluate(n=>n.style.width='665px');
for (const height of [120,180,240,300,340,420,600]) {
 await wide.evaluate((n,h)=>n.style.height=h+'px',height);await page.waitForTimeout(100);
 assert.ok((await alignment()).every(a=>Math.abs(a.stem-a.center)<.5 && Math.abs(a.inner-a.hub)<.5 && Math.abs(a.innerY-a.hubY)<.5 && a.uniform));
 assert.equal(await wide.locator('[data-cv-pulse]').count(),24);
}
for(const width of [320,600,1200]){await page.setViewportSize({width,height:900});await page.waitForTimeout(100);assert.ok(await page.locator('.cv-frame').first().evaluate(n=>Math.abs(n.getBoundingClientRect().width/n.getBoundingClientRect().height-258/232)<.002));}
const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1000,height:850}});const fallback=await context.newPage();await fallback.goto(url);assert.equal(await fallback.locator('.cv-label').count(),8);assert.equal(await fallback.locator('.cv-icon svg').count(),10);assert.ok(await fallback.locator('.cv-icon svg').evaluateAll(ns=>ns.every(n=>n.getBoundingClientRect().width>0)));await fallback.locator('.cv-frame').first().screenshot({path:'/tmp/consumer-fallback.png'});
const failed=await browser.newPage();await failed.addInitScript(()=>{SVGPathElement.prototype.getTotalLength=()=>{throw new Error('intentional geometry failure')}});await failed.goto(url);await failed.waitForTimeout(100);assert.equal(await failed.locator('[data-cv-pulse]').count(),0);assert.equal(await failed.locator('[data-cv-ready]').count(),0);assert.equal(await failed.locator('.cv-label').count(),8);
const blocked=await browser.newPage();await blocked.route('**/src/embeds/consumer-verification.js*',r=>r.abort());await blocked.goto(url);assert.equal(await blocked.locator('.cv-icon svg').count(),10);assert.equal(await blocked.locator('[data-cv-pulse]').count(),0);
assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,pulses:48,darkEndpointsAtHubCenter:true,uniformCurves:true,shortHeights:true,consumerStill:true,hover:true,cleanup:true,offscreenPause:true,reducedMotion:true,twoParents:sizes,mobile:true,jsDisabled:true,blockedModule:true,partialFailureRollback:true}));await browser.close();
