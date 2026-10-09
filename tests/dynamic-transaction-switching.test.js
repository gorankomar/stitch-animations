import test from 'node:test';
import assert from 'node:assert/strict';
import { transactionPulseSchedule, heartbeatScale } from '../src/embeds/dynamic-transaction-switching.js';
test('all cardinal pulses leave together and branches wait for the hidden side junction',()=>{
 const {starts,period}=transactionPulseSchedule();
 for(const name of ['left','right','top','bottom'])assert.equal(starts[name],0);
 for(const name of ['left-top','left-bottom','right-top','right-bottom'])assert.equal(starts[name]*72,161);
 assert.ok(period>starts['left-top']+(87.5+40)/72);
});
test('heartbeat retains both 3DS peaks and its resting interval',()=>{
 const duration=.77,period=duration*2.4;
 for(const [offset,scale]of [[0,1],[.1,1.055],[.22,1],[.32,1.035],[.48,1],[.9,1],[1,1]])assert.ok(Math.abs(heartbeatScale(offset*period,duration,x=>x)-scale)<1e-10);
});
