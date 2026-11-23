import test from 'node:test';
import assert from 'node:assert/strict';
import {getTrustedLogoSize,sizeTrustedLogo} from '../src/embeds/trusted-logos-sizing.js';
test('tight logos preserve their ratio within the strip limits',()=>{
 for(const ratio of [.2,.763,1,1.17,3.1,7.4,30]){
  const {width,height}=getTrustedLogoSize(ratio);
  assert.ok(width<=111+1e-8 && height<=38+1e-8);
  assert.ok(Math.abs(width/height-ratio)<1e-8);
 }
 assert.equal(getTrustedLogoSize(.2).height,38);
 assert.equal(getTrustedLogoSize(30).width,111);
});
test('delayed image loads apply sizing once, with rem values copied to marquee clones',()=>{
 const values=new Map();let listener;
 const image={complete:false,naturalWidth:100,naturalHeight:100,style:{setProperty:(k,v)=>values.set(k,v)},addEventListener:(event,fn,options)=>{assert.equal(event,'load');assert.equal(options.once,true);listener=fn;}};
 sizeTrustedLogo(image);assert.equal(values.size,0);listener();
 assert.equal(values.get('--trusted-logo-width'),'2.125rem');
 assert.equal(values.get('--trusted-logo-height'),'2.125rem');
});
