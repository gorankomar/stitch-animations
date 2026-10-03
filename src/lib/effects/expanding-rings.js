export function createExpandingRings({rings, duration, diameters=[310,238,170], minimum=170, range=216, animations}) {
   // Shared monotonic radial mapping keeps phase-separated rings from overtaking.
   // The minimum diameter extends beyond the card, so births stay visible.
   const cycle=duration*24;
   rings.forEach((ring,i)=>{
    const base=diameters[i];
    const radii=Array.from({length:25},(_,step)=>{
     const p=step/24;
     return {offset:p,transform:`scale(${(minimum+range*(.8*p+.2*p*p))/base})`};
    });
    const movement=ring.animate(radii,{duration:cycle,iterations:Infinity,easing:'linear'});
    const fade=ring.animate([{opacity:0,offset:0},{opacity:.8,offset:.025},{opacity:.8,offset:.92},{opacity:0,offset:1}],{duration:cycle,iterations:Infinity,easing:'linear'});
    movement.pause();fade.pause();
    const phase=(2-i)/3+.03;
    movement.currentTime=cycle*phase;fade.currentTime=cycle*phase;
    animations.push(movement,fade);
   });
}
