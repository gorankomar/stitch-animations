/** Proportional optical sizing in a 150 × 48 slot, independent of company names. */
export function getTrustedLogoSize(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return {width:72,height:24};
  const height=Math.min(38,Math.max(15,34/Math.sqrt(ratio)));
  const scale=Math.min(1,111/(ratio*height));
  return {width:ratio*height*scale,height:height*scale};
}

export function sizeTrustedLogo(image) {
  const apply=()=>{
    if(!image.naturalWidth || !image.naturalHeight) return;
    const ratio=image.naturalWidth/image.naturalHeight;
    let {width,height}=getTrustedLogoSize(ratio);
    // Viva and Peko have comparable wordmarks; give them the same optical height.
    if ((image.src || '').endsWith('viva-finance.svg')) {
      height=getTrustedLogoSize(50/16).height;
      width=height*ratio;
    }
    image.style.setProperty('--trusted-logo-width',`${width/16}rem`);
    image.style.setProperty('--trusted-logo-height',`${height/16}rem`);
  };
  if(image.complete) apply();
  else image.addEventListener('load',apply,{once:true});
}
