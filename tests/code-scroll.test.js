import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCodeScrollEffect} from '../src/lib/effects/code-scroll.js';

function fixture() {
  const track={children:[],style:{transform:''},append(row){this.children.push(row);row.parent=this;}};
  const row=()=>({nodes:[{textContent:'const '},{textContent:'today = new Date();'}],offsetHeight:10,
    cloneNode(){return row();},setAttribute(){},removeAttribute(){},querySelectorAll(){return [];},
    querySelector(){return this;},remove(){this.parent.children.splice(this.parent.children.indexOf(this),1);}});
  for(let i=0;i<36;i++)track.append(row());
  return track;
}
globalThis.NodeFilter={SHOW_TEXT:4};
globalThis.document={createTreeWalker(target){let i=-1;return {nextNode(){return target.nodes[++i];},get currentNode(){return target.nodes[i];}};}};
globalThis.getComputedStyle=()=>({height:'10px'});
globalThis.ResizeObserver=class{observe(){} disconnect(){}};

test('typing and upward scroll start together without flattening syntax nodes',()=>{
  const track=fixture(),effect=createCodeScrollEffect(track);
  assert.equal(track.children.length,72);
  effect.render(0);assert.equal(track.children[0].nodes[0].textContent,'');
  effect.render(70);assert.ok(parseFloat(track.style.transform.slice(11))<0);
  assert.equal(track.children[0].nodes[0].textContent,'const ');
  assert.equal(track.children[0].nodes[1].textContent,'toda');
  effect.dispose();
});
test('loop boundary swaps identical rows and retains a single controller',()=>{
  const track=fixture(),effect=createCodeScrollEffect(track);
  assert.equal(createCodeScrollEffect(track),effect);
  effect.render(36/1.05*1000-1);
  const outgoing=track.children.slice(36,51).map(r=>r.nodes.map(n=>n.textContent));
  effect.render(36/1.05*1000+1);
  assert.deepEqual(track.children.slice(0,15).map(r=>r.nodes.map(n=>n.textContent)),outgoing);
  effect.dispose();
});
test('static view and disposal restore original content and allow reinitialization',()=>{
  const track=fixture(),effect=createCodeScrollEffect(track,{typingSelector:'[data-type]'});
  effect.render(0);effect.showAll();
  assert.equal(track.children[0].nodes[1].textContent,'today = new Date();');
  assert.equal(track.style.transform,'');effect.dispose();effect.dispose();
  assert.equal(track.children.length,36);
  const next=createCodeScrollEffect(track);assert.notEqual(next,effect);next.dispose();
});
