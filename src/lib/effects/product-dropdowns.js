// Shared camera dropdown timing; callers own native markup and visibility clocks. Extend the existing camera clock with readable menu holds.
const clamp=x=>Math.max(0,Math.min(1,x));
export const dropdownChoices = [
  {index:1,at:7.55,values:['SAR','USD','EUR','INR','CAD','AED','GBP']},
  {index:2,at:8.45,values:['Individual','Business']},
  {index:3,at:9.35,values:['Secured','Unsecured','Automotive','Property']},
  {index:5,at:12.75,values:['Keep accruing interest','Freeze interest']},
];
const hold=1.6;
export function sampleDropdownStudy(time,ease,reduced=false) {
  const clock=time%(16.95+hold*4);
  let mapped=clock,added=0;
  const states={};
  for(const item of dropdownChoices){
    const start=item.at+added,local=clock-start;
    states[item.index]={progress:reduced||local>=1.35?1:0,
      iconProgress:reduced?1:clamp((local-1.35)/.85),
      selected:local>=.65,opacity:reduced?0:clamp(local/.22)*(1-clamp((local-1.35)/.25)),
      reveal:ease(clamp(local/.22))};
    mapped-=clamp(local/hold)*hold;
    added+=hold;
  }
  // Raise the form through all three top menus and again for accrual.
  const lift=1.3*ease(clamp((mapped-7.05)/.5))*(1-ease(clamp((mapped-9.35)/.6)))+
    ease(clamp((mapped-12)/.75))*(1-ease(clamp((mapped-12.75)/.85)));
  return {time:mapped,states,lift:reduced?0:lift};
}
export function createDropdownMenus(fields){
  return dropdownChoices.map(({index,values})=>{
    const {field}=fields[index];
    const final={1:'USD',2:'Individual',3:'Unsecured',5:'Keep accruing interest'}[index];
    fields[index].final=final;
    const menu=document.createElement('div');menu.className='study-select-menu';
    menu.setAttribute('aria-hidden','true');
    for(const text of values){
      const row=document.createElement('div');row.className='study-select-option';row.textContent=text;
      row.dataset.selected=String(text===final);menu.append(row);
    }
    field.append(menu);
    return {index,menu};
  });
}
export function renderDropdownMenus(menus,{states}){
  for(const {index,menu} of menus){
    const state=states[index];
    menu.style.opacity=String(state.opacity);
    menu.style.visibility=state.opacity>0?'visible':'hidden';
    menu.style.transform=`translateY(${-.5*(1-state.reveal)}cqi)`;
    menu.dataset.highlight=String(state.selected);
    menu.parentElement.style.zIndex=state.opacity>0?'10':'';
  }
}

// Bind authored menu text without replacing it with English runtime strings.
export function bindNativeDropdownMenus(screen,fields){
  const menus=[...screen.querySelectorAll('[data-camera-dropdown]')].map(menu=>({menu,index:Number(menu.dataset.cameraDropdown)}));
  if(menus.length!==4||![1,2,3,5].every(index=>menus.some(item=>item.index===index))) return [];
  const selected=menus.map(({menu,index})=>({index,row:menu.querySelector('[data-selected="true"]')}));
  if(selected.some(({row,index})=>!row||!fields[index])) return [];
  selected.forEach(({row,index})=>{fields[index].final=row.textContent;});
  return menus;
}
