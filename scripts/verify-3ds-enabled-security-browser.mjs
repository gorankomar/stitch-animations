const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1200,height:850}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url=process.env.THREEDS_PREVIEW_URL||'http://127.0.0.1:5173/3ds-enabled-security.html';
await page.goto(url);await page.waitForFunction(()=>document.querySelector('[data-tds-ready]'));
const root=page.locator('[data-3ds-enabled-security]').first();
assert.ok(await root.locator('img').evaluateAll(ns=>ns.every(n=>n.complete&&n.naturalWidth>0)));
const cycle=await root.evaluate(n=>{
 const rings=[...n.querySelectorAll('[data-tds-ring]')],tracks=rings.map(r=>r.getAnimations());
 const moves=tracks.map(as=>as.find(a=>a.effect.getKeyframes()[0].width));
 const fades=tracks.map(as=>as.find(a=>a.effect.getKeyframes()[0].opacity!==undefined));
 const start=moves.map(a=>a.currentTime),period=moves[0].effect.getTiming().duration;
 [...moves,...fades].forEach(a=>a.pause());let gap=Infinity,visible=3;
 for(let j=0;j<=360;j++){
  moves.forEach((a,i)=>{a.currentTime=start[i]+period*j/360;fades[i].currentTime=a.currentTime});
  const widths=rings.map(r=>r.getBoundingClientRect().width).sort((a,b)=>a-b);
  gap=Math.min(gap,widths[1]-widths[0],widths[2]-widths[1]);visible=Math.min(visible,rings.filter(r=>+getComputedStyle(r).opacity>.01).length);
 }
 [...moves,...fades].forEach(a=>a.play());
 const beat=n.querySelector('[data-tds-heartbeat]').getAnimations()[0];
 return {gap,visible,linear:moves.every(a=>a.effect.getTiming().easing==='linear'),beatDuration:beat.effect.getTiming().duration,beatEase:beat.effect.getKeyframes()[0].easing,ease:getComputedStyle(n).getPropertyValue('--motion-ease-primary').trim()};
});assert.ok(cycle.gap>60);assert.ok(cycle.visible>=2);assert.ok(cycle.linear);assert.equal(cycle.beatDuration,770*2.4);assert.deepEqual(cycle.beatEase.match(/[.\d]+/g).map(Number),cycle.ease.match(/[.\d]+/g).map(Number));
await page.evaluate(()=>{const mount=window[Symbol.for('stitch.3ds-enabled-security.init')];window.dispose3ds=mount();mount()});assert.equal(await root.evaluate(n=>n.getAnimations({subtree:true}).length),7);
await page.evaluate(()=>window.dispose3ds());assert.equal(await root.evaluate(n=>n.getAnimations({subtree:true}).length),0);
await page.evaluate(()=>window[Symbol.for('stitch.3ds-enabled-security.init')]());await page.waitForFunction(()=>document.querySelector('[data-tds-ready]'));
await page.evaluate(()=>document.querySelector('main').style.marginTop='2000px');await page.waitForTimeout(100);
assert.ok(await root.evaluate(n=>n.getAnimations({subtree:true}).every(a=>a.playState==='paused')));
await page.evaluate(()=>document.querySelector('main').style.marginTop='0');
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);assert.equal(await root.evaluate(n=>n.getAnimations({subtree:true}).length),0);
await page.evaluate(()=>{const main=document.querySelector('main'),copy=main.cloneNode(true);copy.style.width='270px';document.body.append(copy)});
const sizes=await page.locator('.tds-frame').evaluateAll(ns=>ns.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height,font:parseFloat(getComputedStyle(n.querySelector('.tds-title')).fontSize)})));
assert.ok(sizes.every(s=>Math.abs(s.w/s.h-540/278)<.002));assert.ok(Math.abs(sizes[1].font/sizes[0].font-.5)<.01);
await page.setViewportSize({width:320,height:850});assert.ok(await root.evaluate(n=>n.getBoundingClientRect().width<=320));await root.screenshot({path:'/tmp/3ds-mobile.png'});
const context=await browser.newContext({javaScriptEnabled:false});const fallback=await context.newPage();await fallback.goto(url);assert.equal(await fallback.locator('.tds-ring').count(),3);assert.equal(await fallback.locator('.tds-title').innerText(),'3DS');
const failing=await browser.newPage();await failing.addInitScript(()=>{let calls=0;const animate=Element.prototype.animate;Element.prototype.animate=function(...args){if(++calls===7)throw Error('intentional heartbeat setup failure');return animate.apply(this,args)}});await failing.goto(url);await failing.waitForTimeout(200);assert.equal(await failing.evaluate(()=>document.getAnimations().length),0);assert.equal(await failing.locator('[data-tds-ready]').count(),0);
// Render the exact external SVG vector-effect at a 4x viewport ratio.
// Only test colors/fill are normalized to measure anti-aliased stroke coverage.
const asset=await fs.readFile('src/embeds/assets/3ds-enabled-security/badge.svg','utf8');
const probe=asset.replace('fill="#fcfcfc"','fill="none"').replace('stroke="#efefef"','stroke="#000"');
const probePage=await browser.newPage({viewport:{width:900,height:700},deviceScaleFactor:1});
await probePage.setContent(`<body style="margin:0;background:transparent"><img id="small" style="width:152px;height:152px" src="data:image/svg+xml;base64,${Buffer.from(probe).toString('base64')}"><img id="large" style="width:608px;height:608px" src="data:image/svg+xml;base64,${Buffer.from(probe).toString('base64')}"></body>`);
for(const id of ['small','large'])await probePage.locator('#'+id).screenshot({path:`/tmp/3ds-stroke-${id}.png`,omitBackground:true});
assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,cycle,twoParents:sizes,duplicateMountCleanup:true,offscreenPause:true,reducedMotion:true,jsDisabled:true,partialFailureRollback:true}));await browser.close();
