const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Include virtual neighbors after the final field: the focus never extrapolates
// a shrinking final pair, which could reverse the remaining fields' motion.
export function verticalFieldPoses(heights, focus, width, settings, height = width * 650 / 1200) {
  const count = heights.length;
  if (!count) return [];
  const first = Math.min(-6, Math.floor(focus) - 6);
  const last = Math.max(count + 6, Math.ceil(focus) + 6);
  const poses = [];
  for (let i = first; i <= last; i++) {
    const position = i - focus;
    const distance = clamp(Math.abs(position) / 3, 0, 1);
    const scale = settings.edgeScale / 100 + (settings.centerScale - settings.edgeScale) / 100 * Math.cos(distance * Math.PI / 2);
    const baseRotation = -clamp(position / 3, -1, 1) * settings.tilt;
    const rotation = baseRotation;
    const radians = rotation * Math.PI / 180;
    const half = heights[((i % count) + count) % count] / 2;
    const depth = width * .9;
    const top = half * Math.cos(radians) / (1 + half * Math.sin(radians) / depth) * scale;
    const bottom = half * Math.cos(radians) / (1 - half * Math.sin(radians) / depth) * scale;
    const previous = poses.at(-1);
    const center = previous ? previous.center + previous.bottom + width * settings.gap / 100 + top : 0;
    poses.push({index:i, position, scale, rotation, top, bottom, center});
  }
  const anchorIndex = Math.floor(focus) - first;
  const a = poses[anchorIndex], b = poses[anchorIndex + 1];
  let anchor = a.center + (b.center - a.center) * (focus - Math.floor(focus));
  if (focus > count - 1) {
    // Carry the final field out at its center-pass velocity. Never derive the
    // tail's travel distance from edge-sized, nearly flat neighboring fields.
    const lastReal = poses[count - 1 - first];
    const stride = heights.at(-1) * settings.centerScale / 100 + width * settings.gap / 100;
    anchor = lastReal.center + (focus - (count - 1)) * stride;
  }
  return poses.filter(pose => pose.index >= 0 && pose.index < count)
    .map(pose => {
      const y = pose.center - anchor;
      // One continuous spatial curve: no late switch into a faster exit turn.
      const travel = clamp(-y / (height / 2), -1, 1);
      const strength = Math.abs(settings.tilt) / 60;
      const power = 2 - Math.min(1, strength);
      const signedTravel = Math.sign(travel) * Math.pow(Math.abs(travel), power);
      const turnLimit = y < 0 ? 65 + 25*Math.min(1,strength) : 90;
      const rotation = settings.tilt === 0 ? 0 : Math.sign(settings.tilt) * turnLimit * Math.sin(signedTravel * Math.PI / 2);
      return {...pose, rotation:rotation || 0, y};
    });
}

export function verticalExitFocus(heights, width, height, settings) {
  for (let focus = heights.length - 1; focus < heights.length + 160; focus += .25) {
    const last = verticalFieldPoses(heights, focus, width, settings, height).at(-1);
    if (Math.abs(last.rotation) >= 90 || last.y + last.bottom < -height / 2 - width * .04) return focus;
  }
  return heights.length + 160;
}

// The returning bar leaves the shared clock just short of center, then arrives
// with zero velocity. Incoming velocity is matched to the continuing roll.
export function settlePromptPose(from, progress, durationInSteps = 1.1) {
  const p = clamp(progress, 0, 1);
  const h00 = 2*p*p*p - 3*p*p + 1;
  const h10 = p*p*p - 2*p*p + p;
  const tangent = Math.min(from.y * 2.5, from.velocity * durationInSteps);
  return {
    y: Math.max(0, h00 * from.y - h10 * tangent),
    rotation: h00 * from.rotation + h10 * Math.sign(-from.rotation) * Math.min(Math.abs(from.rotation)*2.5,Math.abs(from.rotationVelocity || 0)*durationInSteps) || 0,
    scale: from.targetScale + h00 * (from.scale-from.targetScale) + h10 * Math.min((from.targetScale-from.scale)*2.5,(from.scaleVelocity || 0)*durationInSteps)
  };
}

export function continuousRollFocus(time,step,startFocus) {
  return startFocus+Math.max(0,time)/step;
}

export function verticalEntryFocus(heights,width,height,settings,originShift=0) {
  // Find the starting angle of the actual wheel, rather than translating a
  // pre-arranged set of cards into view. Index 0 is the stationary status bar.
  for(let focus=0;focus>=-24;focus-=.1) {
    const first=verticalFieldPoses(heights,focus,width,settings,height)[1];
    // The first item is edge-on here. Start it just beneath the lower edge,
    // rather than a whole unrotated card-height plus padding below the frame.
    if(first.y+originShift>=height/2+width*.005) return focus;
  }
  return -24;
}

export function createEntranceClock(heights,width,height,settings,startFocus,endFocus=1.5) {
  const points=[];
  const sample=f=>verticalFieldPoses(heights,f,width,settings,height)[1].y;
  const initial=sample(startFocus);
  const stride=Math.max(1,(sample(endFocus-.001)-sample(endFocus+.001))/.002);
  const samples=new Set([startFocus,endFocus]);
  for(let i=1;i<240;i++)samples.add(startFocus+(endFocus-startFocus)*i/240);
  // Preserve the layout's integer-slot boundaries exactly when inverting its
  // path; interpolating across a boundary would leave a small speed bump.
  for(let i=Math.ceil(startFocus);i<endFocus;i++)samples.add(i);
  for(const focus of [...samples].sort((a,b)=>a-b))points.push({focus,time:(initial-sample(focus))/stride});
  const end=points.at(-1);
  function interpolate(value,key,target) {
    let low=0,high=points.length-1;
    while(high-low>1){const mid=(low+high)>>1;if(points[mid][key]<value)low=mid;else high=mid;}
    const a=points[low],b=points[high];
    const p=(value-a[key])/(b[key]-a[key]);
    return a[target]+(b[target]-a[target])*p;
  }
  return {
    focus(time){return time>=end.time?endFocus+time-end.time:interpolate(Math.max(0,time),'time','focus');},
    timeAtFocus(focus){return focus>=endFocus?end.time+focus-endFocus:interpolate(focus,'focus','time');}
  };
}

export function verticalPickupFocus(heights,width,height,settings,targetY) {
  let low=0,high=2;
  for(let i=0;i<32;i++){
    const mid=(low+high)/2;
    if(verticalFieldPoses(heights,mid,width,settings,height)[0].y>targetY)low=mid;else high=mid;
  }
  return (low+high)/2;
}

export function engagePromptPose(from,to,progress,duration) {
  const p=clamp(progress,0,1);
  const h00=2*p*p*p-3*p*p+1,h01=-2*p*p*p+3*p*p,h11=p*p*p-p*p;
  const track=(key,velocity)=>h00*from[key]+h01*to[key]+h11*(to[velocity]||0)*duration;
  return {y:track('y','velocity'),rotation:track('rotation','rotationVelocity')||0,scale:track('scale','scaleVelocity')};
}
