// Back-to-front slots in the 540 × 395 Figma composition.
export const WORKFLOW_SLOTS = Object.freeze([
  {width:277, top:127, height:273}, {width:331, top:160, height:273},
  {width:389, top:196, height:273}, {width:448, top:232, height:273},
  {width:502, top:272, height:311}
]);
const clamp = n => Math.max(0, Math.min(1, n));
const mix = (a,b,p) => a + (b-a)*p;
function interpolate(a,b,p) {
  return {width:mix(a.width,b.width,p),top:mix(a.top,b.top,p),height:mix(a.height,b.height,p)};
}
// Hold, advance every window down one slot, then recycle the fully clipped front
// window behind the stack. No DOM reordering or generated essential content.
export function sampleWorkflowStack(time, index, duration, ease = p=>p, hold = 2.5) {
  const cycle = hold + duration * 2;
  const turn = Math.floor(Math.max(0,time)/cycle);
  const local = Math.max(0,time) - turn*cycle;
  const slot = (index+turn)%5;
  const from = WORKFLOW_SLOTS[slot];
  if (local <= hold) return {...from,z:slot+1,raised:slot===0?1:0};
  const p = ease(clamp((local-hold)/duration));
  if (local < hold+duration) {
    if (slot===4) return {...from,top:mix(from.top,425,p),z:5,raised:0};
    return {...interpolate(from,WORKFLOW_SLOTS[slot+1],p),z:slot+1,raised:slot===0?1-p:0};
  }
  if (slot!==4) return {...WORKFLOW_SLOTS[slot+1],z:slot+2,raised:0};
  const back=WORKFLOW_SLOTS[0];
  const raw=clamp((local-hold-duration)/duration);
  return {...back,top:mix(425,back.top,ease(raw)),z:1,raised:ease(clamp((raw-.55)/.45))};
}

export function renderWorkflowWindow(node, label, state) {
  const q = n => `${n/5.4}cqi`;
  node.style.width=q(state.width);node.style.top=q(state.top);node.style.height=q(state.height);node.style.zIndex=state.z;
  const r=state.raised;
  const icon=label.querySelector('[data-wfx-icon]');
  if(icon){icon.style.width=q(mix(12,16,r));icon.style.height=q(mix(12,16,r));icon.style.padding=q(2*r);icon.style.backgroundColor=`rgba(255,255,255,${r})`;icon.style.borderRadius='100%';icon.style.boxSizing='border-box';}
  label.style.top=q(mix(6,-18,r));label.style.padding=q(mix(5,10,r));label.style.gap=q(mix(6,10,r));
  label.style.fontSize=q(mix(10,12,r));label.style.borderRadius=q(mix(4,8,r));
  label.style.backgroundColor=`rgba(61,61,61,${r})`;
  label.style.borderColor=`rgba(239,239,239,${r})`;
  const gray=Math.round(mix(69,255,r));label.style.color=`rgb(${gray},${gray},${gray})`;
}
