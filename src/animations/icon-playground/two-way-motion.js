const tracks={
 'digital-loans':{dip:[0,.7],end:[0,-.45]},
 'digital-wallets':{dip:[-.6,0],end:[1.1,0]},
 'developers-guide':{dip:[-.5,0],end:[.2,0]},
 transactions:{dip:[-.65,0],end:[1.4,0]},
 'card-upload':{dip:[0,.85],end:[0,-.6]},
 onboarding:{dip:[1,.8],end:[-.8,-.65]}
};
const mix=(a,b,p)=>a.map((value,i)=>value+(b[i]-value)*p);
export function createTwoWayMotion(key,ease){
 const track=tracks[key];if(!track)return null;
 let position=[0,0],from=[0,0],hovered=false,phase=1;
 function render(){
  if(!hovered){position=mix(from,[0,0],ease(phase));return;}
  if(phase<.34){const t=phase/.34;const symmetric=t<.5?(1-ease(1-2*t))*.5:.5+ease(2*t-1)*.5;position=mix(from,track.dip,symmetric);}
  else if(phase<.44)position=[...track.dip];
  else position=mix(track.dip,track.end,ease((phase-.44)/.56));
 }
 return {
  setHovered(next){if(next===hovered)return;from=[...position];hovered=next;phase=0;},
  advance(dt,duration){phase=Math.min(1,phase+dt/duration);if(phase>1-1e-9)phase=1;render();},
  finish(){phase=1;render();},
  get position(){return position;},get active(){return phase<1;}
 };
}
