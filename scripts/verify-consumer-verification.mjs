import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true});
const url=process.env.CONSUMER_PREVIEW_URL || 'http://127.0.0.1:5173/consumer-verification.html';
const page=await browser.newPage({viewport:{width:1000,height:850}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForFunction(()=>document.querySelector('[data-cv-ready]'));
assert.equal(await page.locator('[data-cv-pulse]').count(),24);assert.equal(await page.locator('[data-cv-pale]').count(),24);
const fades=await page.locator('[data-cv-pulse]').evaluateAll(ns=>ns.map(p=>{
 const id=p.style.stroke.match(/#([^"')]+)/)[1],gradient=p.ownerSVGElement.querySelector(`[id="${id}"]`);
 const sourceId=p.getAttribute('stroke').match(/#([^"')]+)/)[1],source=p.ownerSVGElement.querySelector(`[id="${sourceId}"]`);
 return {span:parseFloat(p.style.strokeDasharray),cloneStops:[...gradient.querySelectorAll('stop')].map(s=>[s.getAttribute('offset'),s.getAttribute('stop-opacity')]),sourceStops:[...source.querySelectorAll('stop')].map(s=>[s.getAttribute('offset'),s.getAttribute('stop-opacity')]),colors:[...gradient.querySelectorAll('stop')].map(s=>s.getAttribute('stop-color'))};
}));
assert.ok(fades.every(f=>Math.abs(f.span-7.8)<.001));fades.forEach(f=>{assert.deepEqual(f.cloneStops,f.sourceStops);assert.ok(f.colors.every(c=>c.includes('primary-blue')))});

const dark=()=>page.locator('[data-cv-lines] path:not([data-cv-pale]):not([data-cv-pulse])').evaluateAll(ns=>ns.map(n=>n.outerHTML));
const before=await dark();assert.equal(before.length,4);
const hub=page.locator('.cv-consumer');const hubY=await hub.evaluate(n=>n.getBoundingClientRect().y);
await hub.hover();await page.waitForTimeout(500);assert.equal(await hub.evaluate(n=>n.getBoundingClientRect().y),hubY);
for(const name of ['documents','income','identity','employment']){
 const label=page.locator(`.cv-position-${name} .cv-label`),initial=await label.evaluate(n=>n.getBoundingClientRect().y);
 await label.hover();await page.waitForTimeout(500);const lifted=await label.evaluate(n=>n.getBoundingClientRect().y);assert.ok(Math.abs(initial-lifted-6.192)<.1);
}
assert.deepEqual(await dark(),before);
await page.mouse.move(0,0);await page.waitForTimeout(500);
await page.locator('.cv-frame').screenshot({path:'/tmp/consumer-motion.png'});
// Mount twice, cleanup, then remount without duplicates.
await page.evaluate(()=>{window.cvDispose=window[Symbol.for('stitch.consumer-verification.init')]();window[Symbol.for('stitch.consumer-verification.init')]();});assert.equal(await page.locator('[data-cv-pulse]').count(),24);
await page.evaluate(()=>window.cvDispose());assert.equal(await page.locator('[data-cv-pulse]').count(),0);assert.deepEqual(await dark(),before);
await page.evaluate(()=>window[Symbol.for('stitch.consumer-verification.init')]());assert.equal(await page.locator('[data-cv-pulse]').count(),24);
await page.evaluate(()=>document.querySelector('main').style.marginTop='2000px');await page.waitForTimeout(100);
const offsets=()=>page.locator('[data-cv-pulse]').evaluateAll(ns=>ns.map(n=>n.style.strokeDashoffset));const paused=await offsets();await page.waitForTimeout(100);assert.deepEqual(await offsets(),paused);
await page.evaluate(()=>document.querySelector('main').style.marginTop='0');await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);assert.ok(await page.locator('[data-cv-pulse]').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).opacity==='0')));
// Parent-relative scaling at one viewport.
await page.evaluate(()=>{const main=document.querySelector('main'),copy=main.cloneNode(true);copy.style.width='258px';document.body.append(copy)});
const sizes=await page.locator('.cv-frame').evaluateAll(ns=>ns.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height,font:parseFloat(getComputedStyle(n.querySelector('.cv-label-text')).fontSize)})));
assert.ok(sizes.every(s=>Math.abs(s.w/s.h-258/232)<.002));assert.ok(Math.abs(sizes[1].font/sizes[0].font-.5)<.01);
for(const width of [320,600,1200]){await page.setViewportSize({width,height:900});assert.ok(await page.locator('.cv-frame').first().evaluate(n=>Math.abs(n.getBoundingClientRect().width/n.getBoundingClientRect().height-258/232)<.002));}
const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1000,height:850}});const fallback=await context.newPage();await fallback.goto(url);assert.equal(await fallback.locator('.cv-label').count(),4);assert.equal(await fallback.locator('.cv-icon svg').count(),5);await fallback.locator('.cv-frame').screenshot({path:'/tmp/consumer-fallback.png'});
const failed=await browser.newPage();await failed.addInitScript(()=>{SVGPathElement.prototype.getTotalLength=()=>{throw new Error('intentional geometry failure')}});await failed.goto(url);await failed.waitForTimeout(100);assert.equal(await failed.locator('[data-cv-pulse]').count(),0);assert.equal(await failed.locator('[data-cv-ready]').count(),0);assert.equal(await failed.locator('.cv-label').count(),4);
const blocked=await browser.newPage();await blocked.route('**/src/embeds/consumer-verification.js*',r=>r.abort());await blocked.goto(url);assert.equal(await blocked.locator('.cv-icon svg').count(),5);assert.equal(await blocked.locator('[data-cv-pulse]').count(),0);
assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,pulses:24,darkUnchanged:true,consumerStill:true,hover:true,cleanup:true,offscreenPause:true,reducedMotion:true,twoParents:sizes,mobile:true,jsDisabled:true,blockedModule:true,partialFailureRollback:true}));await browser.close();
