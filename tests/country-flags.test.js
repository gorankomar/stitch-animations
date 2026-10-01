import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// Import the pure function without the browser-only CSS import.
const source=fs.readFileSync(new URL('../src/embeds/country-flags.js',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('export function loopPosition'),source.indexOf('export const init'));
const {loopPosition}=await import(`data:text/javascript,${encodeURIComponent(fn)}`);
test('both directions and staggered phases repeat exactly after a nine-flag cycle',()=>{
  for(const direction of [-1,1])for(const phase of [10,0,-25])for(const time of [0,1,38.999,39,1000]){
    const position=loopPosition(468,phase,time,12,direction);
    assert.ok(position>=-468&&position<0);
    assert.ok(Math.abs(position-loopPosition(468,phase,time+39,12,direction))<1e-8);
  }
});
test('wrap preserves the same visible flags on either side of the seam',()=>{
  for(const direction of [-1,1]){
    const before=loopPosition(468,0,39-0.001,12,direction);
    const after=loopPosition(468,0,39+0.001,12,direction);
    const delta=((after-before+468/2+468)%468)-468/2;
    assert.ok(Math.abs(delta-direction*0.024)<1e-8);
  }
});
