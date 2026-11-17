import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/embeds/real-ai-solution-tabs.html', import.meta.url), 'utf8');
const render = source.match(/    function render\(\) \{([\s\S]*?)\n    \}/)[0];
for (const rtl of [false, true]) test(`tab fill follows ${rtl ? 'RTL' : 'LTR'} order with unequal insets`, () => {
  const values = {};
  const widths = [100, 140, 80];
  const links = widths.map((offsetWidth, i) => ({
    offsetWidth,
    offsetLeft: rtl ? 12 + widths.slice(i + 1).reduce((a,b)=>a+b,0) : 12 + widths.slice(0,i).reduce((a,b)=>a+b,0)
  }));
  const context = vm.createContext({rtl, links, insetLeft:12, insetRight:20, position:0, reduced:{matches:false}, menu:{clientWidth:352,style:{setProperty:(k,v)=>values[k]=v}}});
  vm.runInContext(render, context);
  for (const [position, expected] of [[0,0],[0.5,50],[1.25,135],[2.5,280]]) {
    context.position=position;
    vm.runInContext('render()',context);
    assert.equal(values['--tabs-progress'],`${expected}px`);
  }
  context.reduced.matches=true;
  vm.runInContext('render()',context);
  assert.equal(values['--tabs-progress'],'320px');
});
