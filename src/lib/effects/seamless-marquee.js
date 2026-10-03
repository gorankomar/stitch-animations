export function createSeamlessMarquee({tracks, frame, duration, sequenceSelector, directions=['left','right','left'], multipliers=[36,44,40], animations, generated, generatedAttribute='data-marquee-generated'}) {
   tracks.forEach((track,i)=>{
    const sequence=track.querySelector(sequenceSelector);
    const gap=parseFloat(getComputedStyle(track).columnGap)||0;
    const lap=sequence.getBoundingClientRect().width+gap;
    if(!lap)throw new Error('Unmeasurable marquee row');
    const count=Math.ceil(frame.getBoundingClientRect().width/lap)+3;
    for(let j=0;j<count;j++){
     const copy=sequence.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.setAttribute(generatedAttribute,'');
     track.append(copy);generated.push(copy);
    }
    const left=directions[i] === 'left';
    const a=track.animate([{transform:`translateX(${left?-lap:-2*lap}px)`},{transform:`translateX(${left?-2*lap:-lap}px)`}],{duration:duration*multipliers[i],iterations:Infinity,easing:'linear'});
    a.pause();animations.push(a);
   });
}
