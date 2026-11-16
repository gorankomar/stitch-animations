import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleDropdownStudy,dropdownChoices} from '../src/embeds/real-ai-product-dropdown-study.js';
const ease=p=>p;
test('each dropdown opens, highlights before commit, closes, and releases its camera hold',()=>{
  dropdownChoices.forEach(({index,at},i)=>{
    const start=at+i*1.6;
    const open=sampleDropdownStudy(start+.5,ease);
    assert.ok(Math.abs(open.time-at)<1e-10);
    assert.equal(open.states[index].opacity,1);
    assert.equal(open.states[index].progress,0);
    const selected=sampleDropdownStudy(start+.8,ease);
    assert.equal(selected.states[index].selected,true);
    assert.equal(selected.states[index].progress,0);
    const closed=sampleDropdownStudy(start+1.61,ease);
    assert.equal(closed.states[index].opacity,0);
    assert.equal(closed.states[index].progress,1);
  });
});
test('extended timeline loops continuously and reduced motion hides all menus',()=>{
  assert.ok(sampleDropdownStudy(23.34999,ease).time>16.949);
  assert.ok(Math.abs(sampleDropdownStudy(23.35,ease).time)<1e-10);
  const state=sampleDropdownStudy(9,ease,true);
  assert.equal(state.lift,0);
  Object.values(state.states).forEach(s=>{assert.equal(s.opacity,0);assert.equal(s.progress,1);});
});


test('native menus preserve localized selected text and incomplete markup keeps legacy values',async()=>{
  const {bindNativeDropdownMenus}=await import('../src/lib/effects/product-dropdowns.js');
  const fields=Array.from({length:7},()=>({final:'original'}));
  const menus=[1,2,3,5].map(index=>({dataset:{cameraDropdown:String(index)},querySelector:()=>({textContent:`Localized ${index}`})}));
  const screen={querySelectorAll:()=>menus};
  assert.equal(bindNativeDropdownMenus(screen,fields).length,4);
  [1,2,3,5].forEach(index=>assert.equal(fields[index].final,`Localized ${index}`));
  fields.forEach(field=>field.final='original');
  screen.querySelectorAll=()=>menus.slice(0,3);
  assert.deepEqual(bindNativeDropdownMenus(screen,fields),[]);
  assert.ok(fields.every(field=>field.final==='original'));
  screen.querySelectorAll=()=>[menus[0],menus[0],menus[2],menus[3]];
  assert.deepEqual(bindNativeDropdownMenus(screen,fields),[]);
});


test('faster dropdown beats shorten only holds and preserve camera path and sparkle entrance',()=>{
  for(const speed of [1.5,2]){
    for(const {index,at} of dropdownChoices){
      const order=dropdownChoices.findIndex(item=>item.index===index);
      const start=at+order*1.6/speed;
      const selected=sampleDropdownStudy(start+.8/speed,ease,false,{speed});
      assert.ok(Math.abs(selected.time-at)<1e-10);
      assert.equal(selected.states[index].selected,true);
      assert.equal(selected.states[index].progress,0);
      const closing=sampleDropdownStudy(start+1.4/speed,ease,false,{speed});
      assert.equal(closing.states[index].progress,1);
      assert.ok(closing.states[index].opacity>0&&closing.states[index].opacity<1);
      const icon=sampleDropdownStudy(start+1.35/speed+.425,ease,false,{speed});
      assert.ok(Math.abs(icon.states[index].iconProgress-.5)<1e-10);
      const after=sampleDropdownStudy(start+1.6/speed+.1,ease,false,{speed});
      assert.ok(Math.abs(after.time-(at+.1))<1e-10);
    }
    const loop=16.95+6.4/speed;
    assert.ok(sampleDropdownStudy(loop-.00001,ease,false,{speed}).time>16.949);
    assert.ok(Math.abs(sampleDropdownStudy(loop,ease,false,{speed}).time)<1e-10);
  }
});


test('top selector pans speed up without shortening any other camera travel',()=>{
  const options={speed:2,topPanSpeed:1.5};
  const hold=.8,saving=.3;
  for(let i=0;i<2;i++){
    const start=dropdownChoices[i].at+hold*(i+1)-saving*i;
    const middle=sampleDropdownStudy(start+.3,ease,false,options);
    assert.ok(Math.abs(middle.time-(dropdownChoices[i].at+.45))<1e-10);
    const arrival=sampleDropdownStudy(start+.6,ease,false,options);
    assert.ok(Math.abs(arrival.time-dropdownChoices[i+1].at)<1e-10);
  }
  const afterTop=9.35+3*hold-2*saving;
  assert.ok(Math.abs(sampleDropdownStudy(afterTop+.2,ease,false,options).time-9.55)<1e-10);
  const loop=16.95+4*hold-2*saving;
  assert.ok(Math.abs(sampleDropdownStudy(loop,ease,false,options).time)<1e-10);
});


test('approved 2x menus and 2.5x pans arrive and loop continuously',()=>{
  const options={speed:2,topPanSpeed:2.5};
  const hold=.8,saving=.54;
  dropdownChoices.forEach(({at,index},i)=>{
    const start=at+i*hold-Math.min(i,2)*saving;
    const state=sampleDropdownStudy(start+.4,ease,false,options);
    assert.ok(Math.abs(state.time-at)<1e-10);
    assert.equal(state.states[index].selected,true);
    assert.equal(state.states[index].progress,0);
    assert.equal(sampleDropdownStudy(start+.7,ease,false,options).states[index].progress,1);
  });
  const loop=19.07;
  assert.ok(sampleDropdownStudy(loop-.000001,ease,false,options).time>16.949);
  assert.ok(Math.abs(sampleDropdownStudy(loop,ease,false,options).time)<1e-10);
});
