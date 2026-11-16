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
