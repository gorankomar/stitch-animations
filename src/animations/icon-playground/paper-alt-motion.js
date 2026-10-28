const ns='http://www.w3.org/2000/svg';
export const PAPER_ORIGINAL=["M9.33333 1.33333H5.86667C4.74656 1.33333 4.18651 1.33333 3.75869 1.55132C3.38236 1.74307 3.0764 2.04903 2.88465 2.42535C2.66667 2.85318 2.66667 3.41323 2.66667 4.53333V11.4667C2.66667 12.5868 2.66667 13.1468 2.88465 13.5746C3.0764 13.951 3.38236 14.2569 3.75869 14.4487C4.18651 14.6667 4.74656 14.6667 5.86667 14.6667H10.1333C11.2534 14.6667 11.8135 14.6667 12.2413 14.4487C12.6176 14.2569 12.9236 13.951 13.1153 13.5746C13.3333 13.1468 13.3333 12.5868 13.3333 11.4667V5.33333L9.33333 1.33333Z", "M9.33333 1.51302V4.26671C9.33333 4.64008 9.33333 4.82677 9.406 4.96937C9.46991 5.09482 9.5719 5.1968 9.69734 5.26072C9.83995 5.33338 10.0266 5.33338 10.4 5.33338H13.1537", "M6.66667 6H5.33333", "M10.6667 8.66667H5.33333", "M10.6667 11.3333H5.33333"];
const clamp=x=>Math.max(0,Math.min(1,x));
const leg=(p,a,b,ease)=>ease(clamp((p-a)/(b-a)));
export function paperAltState(p,ease=x=>x){
 const split=leg(p,.25,.5,ease),swap=leg(p,.52,.78,ease),hide=leg(p,.7,.94,ease);
 return {
  a:{x:-2.3*split+2.3*swap,y:1.5*hide,scale:1-.4*split-.4*hide,fold:1-leg(p,0,.2,ease),text:1-hide,visible:p<.96},
  b:{x:3*split*(1-swap),y:2*leg(p,.16,.3,ease)*(1-swap),scale:.78+.22*swap,fold:leg(p,.84,1,ease),text:leg(p,.7,.9,ease),visible:p>.16},
  swapped:p>=.54
 };
}
export function paperOutline(fold){
 if(fold===1)return PAPER_ORIGINAL[0];
 // Mirror the authored lower-right cubic corner into the unfolded upper-right.
 // Its radius grows as the folded diagonal closes, with no endpoint shape jump.
 const radius=3.2*(1-fold),x=13.3333-3.99997*fold,y=1.33333+4*fold;
 const right=13.3333,top=1.33333;
 const corner=`V${y+radius}C${right} ${y+radius*.649825} ${right} ${y+radius*.474497} ${right-radius*.068125} ${y+radius*.340803}C${right-radius*.128031} ${y+radius*.2232} ${right-radius*.223219} ${y+radius*.128012} ${right-radius*.340813} ${y+radius*.068109}C${right-radius*.4745} ${y} ${right-radius*.649812} ${y} ${right-radius} ${y}L${x-radius} ${top}Z`;
 return PAPER_ORIGINAL[0].replace(/^M9.33333/,`M${x-radius}`).replace(/V5\.33333L9\.33333 1\.33333Z$/,corner);
}
function corner(fold){
 if(fold===1)return PAPER_ORIGINAL[1];
 let command='',coordinate=0;
 return PAPER_ORIGINAL[1].replace(/[A-Za-z]|-?\d*\.?\d+/g,token=>{
  if(/[A-Za-z]/.test(token)){command=token;coordinate=0;return token;}
  const origin=command==='H'?13.3333:command==='V'?1.33333:coordinate++%2===0?13.3333:1.33333;
  return String(origin+(Number(token)-origin)*fold-(origin===13.3333?3.2*(1-fold):0));
 });
}
export function paperPart(index,state){
 const part=index%5,sheet=index<5?state.a:state.b;
 if(part===0)return paperOutline(sheet.fold);
 if(part===1)return corner(sheet.fold);
 if(sheet.text===1)return PAPER_ORIGINAL[part];
 const y=[6,8.66667,11.3333][part-2],length=(part===2?1.33334:5.33337)*sheet.text;
 return `M${5.33333+Math.max(.001,length)} ${y}H5.33333`;
}
export function preparePaperAlt(svg){
 for(const child of [...svg.children])child.remove();
 for(const sheet of [1,0]){
  const group=document.createElementNS(ns,'g');group.classList.add(`alt-sheet-${sheet}`);
  const backing=document.createElementNS(ns,'polygon');backing.setAttribute('fill','#efefef');backing.classList.add('alt-paper-backing');group.append(backing);
  for(let part=0;part<5;part++){
   const path=document.createElementNS(ns,'path');path.classList.add(`motion-piece-${sheet*5+part}`,`alt-paper-part-${sheet}`);path.setAttribute('d',paperPart(sheet*5+part,paperAltState(0)));path.setAttribute('fill','none');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');path.setAttribute('vector-effect','non-scaling-stroke');group.append(path);
  }
  svg.append(group);
 }
}
export function renderPaperAlt(svg,p,ease){
 const state=paperAltState(p,ease);
 for(const sheet of [0,1]){
  const group=svg.querySelector(`.alt-sheet-${sheet}`),s=sheet?state.b:state.a;
  group.setAttribute('transform',`translate(${s.x} ${s.y}) translate(8 8) scale(${s.scale} ${s.scale}) translate(-8 -8)`);
  group.style.display=s.visible?'':'none';
  const f=s.fold;group.querySelector('polygon').setAttribute('points',`2.66667,1.33333 ${13.3333-3.99997*f},1.33333 13.3333,${1.33333+4*f} 13.3333,14.6667 2.66667,14.6667`);
 }
 const foreground=svg.querySelector(`.alt-sheet-${state.swapped?1:0}`);if(svg.lastElementChild!==foreground)svg.append(foreground);
 for(const path of svg.querySelectorAll('path')){
  const cls=[...path.classList].find(c=>c.startsWith('motion-piece-'));if(!cls)continue;
  const index=Number(cls.slice(13));path.setAttribute('d',paperPart(index,state));
  const part=index%5,s=index<5?state.a:state.b;
  path.style.visibility=(part===1&&s.fold<.001)||(part>=2&&s.text<.001)?'hidden':'visible';
 }
}
