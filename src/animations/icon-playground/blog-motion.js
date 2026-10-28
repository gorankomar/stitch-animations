export const BLOG_WINDOW={x:2,y:2.66667,width:12,height:10.66663};
export function blogScroll(raw,ease=t=>t){
 if(raw<.42)return 10*ease(raw/.42);
 if(raw<.58)return 10;
 return 10+10*ease((raw-.58)/.42);
}
export function blogPose(index,raw,ease){
 if(index===1||index===3)return '';
 const scroll=blogScroll(raw,ease);
 if(index>=9)return `translate(${index===11?6.66667:-8}px, ${20-scroll}px)`;
 if(index>=5)return `translateY(${10-scroll}px)`;
 return `translateY(${-scroll}px)`;
}
export function blogTextGeometry(index,raw){
 const row=[5,6,8].indexOf(index);if(row<0)return null;
 const p=Math.max(0,Math.min(1,(raw-(.12+row*.06))/.24));
 const length=(row===2?9:12)*p;
 return `M2 ${5.33333+row*2.66667}H${2+Math.max(.001,length)}`;
}
export function prepareBlog(svg){
 const template=svg.querySelector('.motion-piece-0'),host=template.parentNode;
 for(let i=5;i<=11;i++){
  if(i===7)continue;
  const source=svg.querySelector(`.motion-piece-${i===11?4:i===10?2:0}`);
  const path=source.cloneNode();path.removeAttribute('id');path.setAttribute('class',`motion-piece-${i}`);
  if(i<9)path.setAttribute('d',blogTextGeometry(i,.58));
  host.append(path);
 }
}
export function ensureBlogClip(svg){
 if(svg.dataset.blogClip)return svg.dataset.blogClip;
 const ns='http://www.w3.org/2000/svg',clip=document.createElementNS(ns,'clipPath');
 clip.id=svg.querySelector('linearGradient').id+'-blog-window';clip.setAttribute('clipPathUnits','userSpaceOnUse');
 const rect=document.createElementNS(ns,'rect');for(const [key,value]of Object.entries({x:.5,y:3.9,width:15,height:8.2}))rect.setAttribute(key,value);
 clip.append(rect);svg.querySelector('defs').append(clip);svg.dataset.blogClip=clip.id;return clip.id;
}
