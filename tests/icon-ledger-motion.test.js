import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {interpolateLedgerPoints,ledgerVisibility,normalizeLedgerPath,ledgerPaperGeometry,TUCKED_PAPER_PATH} from '../src/animations/icon-playground/ledger-motion.js';
test('sketch morph preserves exact point endpoints and interpolates continuously',()=>{
 const closed=[[2,3],[13,2],[13,14]],opened=[[2,3],[13,-.5],[13,9]];
 assert.deepEqual(interpolateLedgerPoints(closed,opened,0),closed);
 assert.deepEqual(interpolateLedgerPoints(closed,opened,1),opened);
 assert.deepEqual(interpolateLedgerPoints(closed,opened,.5),[[2,3],[13,.75],[13,11.5]]);
});
test('paper has no extra opacity animation in any state',()=>{
 for(const p of [0,.1,.5,1])assert.equal(ledgerVisibility(1,p),1);
});
test('redrawn closed bounds match original icon bounds and open keeps the same baseline',()=>{
 const normalized=normalizeLedgerPath('M3 1L14 15').match(/-?\d*\.?\d+/g).map(Number);
 assert.deepEqual(normalized,[2.66667,1.33333,13.3333,14.6667]);
 const open=normalizeLedgerPath('M3 15.5102',.5102).match(/-?\d*\.?\d+/g).map(Number);
 assert.ok(Math.abs(open[1]-14.6667)<1e-9);
});

test('paper upper endpoint stays tucked against its next corner before extending left',()=>{
 const svg=readFileSync(new URL('../src/embeds/icon-playground/assets/ledgers-redrawn-opened-master.svg',import.meta.url),'utf8');
 const end=normalizeLedgerPath(svg.match(/id="paper" d="([^"]+)"/)[1],.5102);
 const start=normalizeLedgerPath(TUCKED_PAPER_PATH);
 for(const p of [.01,.1,.25]){
  const coords=ledgerPaperGeometry(start,end,p).match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/g).map(Number);
  assert.ok(coords.every(Number.isFinite));assert.ok(Math.abs(coords[0]-coords[2])<1e-8);
 }
 const coords=ledgerPaperGeometry(start,end,.8).match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/g).map(Number);
 assert.ok(coords[0]<coords[2]);
});
