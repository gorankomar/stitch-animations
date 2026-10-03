export function createExpandingRings({rings, duration, diameters=[310,238,170], minimum=170, range=216, sizing=null, animations}) {
   // Shared monotonic radial mapping keeps phase-separated rings from overtaking.
   // The minimum diameter extends beyond the card, so births stay visible.
   const cycle=duration*24;
   rings.forEach((ring,i)=>{
    const base=diameters[i];
    const radii=Array.from({length:25},(_,step)=>{
     const p=step/24;
     const diameter=minimum+range*(.8*p+.2*p*p);
     const position=sizing?.center ? {left:`${(sizing.center.x-diameter/2)/sizing.designWidth*100}cqi`,top:`${(sizing.center.y-diameter/2)/sizing.designWidth*100}cqi`} : {};
     return sizing ? {offset:p,...position,width:`${diameter/sizing.designWidth*100}cqi`,height:`${diameter/sizing.designWidth*100}cqi`} : {offset:p,transform:`scale(${diameter/base})`};
    });
    const movement=ring.animate(radii,{duration:cycle,iterations:Infinity,easing:'linear'});
    movement.pause();animations.push(movement);
    const fade=ring.animate([{opacity:0,offset:0},{opacity:.8,offset:.025},{opacity:.8,offset:.92},{opacity:0,offset:1}],{duration:cycle,iterations:Infinity,easing:'linear'});
    fade.pause();animations.push(fade);
    const phase=(2-i)/3+.03;
    movement.currentTime=cycle*phase;fade.currentTime=cycle*phase;

   });
}
