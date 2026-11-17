import { sampleDropdownStudy, createDropdownMenus, renderDropdownMenus } from './real-ai-product-dropdown-study.js';
import { renderProductCamera } from '../lib/effects/product-camera.js';
import { verticalFieldPoses, settlePromptPose, engagePromptPose, verticalEntryFocus, createEntranceClock, verticalPickupFocus } from './real-ai-product-layout-geometry.js';
import markup from './real-ai-product-markup.html?raw';
import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createSeamlessMarquee } from '../lib/effects/seamless-marquee.js';
import { getDefaultDurationMs } from '../lib/easing.js';
import { readMotionEasingCurve } from '../lib/motion.js';
import { renderProductWorking, clearProductWorking } from '../lib/effects/product-working.js';

// Local-only composition: native component markup/styles remain unchanged.
const source = document.createElement('template');
const productAssets = import.meta.glob('./assets/real-ai-product/*.svg', {eager:true, query:'?url', import:'default'});
const arrowAsset = new URL('./assets/real-ai-copilot/arrowup.svg', import.meta.url).href;
source.innerHTML = markup.replace(/src="(\.\/assets\/[^"]+)"/g, (_, path) => `src="${productAssets[path] || (path.endsWith('/arrowup.svg') ? arrowAsset : path)}"`);
const originals = [...source.content.querySelectorAll('.lp-product-field')];
const extraValues = ['3', '2', '6', '6', '2', '4'];
originals.filter(field => field.querySelector('.lp-product-placeholder')).forEach((field, i) => {
  field.querySelector('.lp-product-placeholder').dataset.studyValue = extraValues[i];
});
const toggleGroup = document.createElement('div');
toggleGroup.className = 'study-toggle-group';
[...source.content.querySelectorAll('.lp-product-toggle-row')].slice(0, 3).forEach(row => toggleGroup.append(row.cloneNode(true)));
originals.splice(7, 0, toggleGroup);
// Art-directed row spans widen independently of field count.
const crawlRows = [[32], [36,39], [28,88], [40,48,39], [44,51,47], [57,48,55]];
const promptText = 'Create a personal loan for salaried customers with direct deposit.';
const clamp = v => Math.max(0, Math.min(1, v));
let paused = false;
const studies = new Set();

const controlSpecs = [
  ['speed', 'Rolodex speed', .35, 2.5, .05, 1.4, '×'],
  ['tilt', 'Tilt strength / direction', -60, 60, 1, 8, 'signed strength'],
  ['promptHoldMs', 'Hold after typing', 0, 2000, 25, 600, 'ms'],
  ['engage', 'Prompt engage distance', 0, 1.5, .05, .7, 'items around pickup'],
  ['maskMs', 'Bottom-to-top mask', 80, 650, 1, 198, 'ms'],
  ['fieldWidth', 'Shared item width', 40, 110, 1, 70, '% of original'],
  ['gap', 'Gap between fields', 1, 6, .1, 1, '% of stage width'],
  ['edgeScale', 'Smallest field size', 25, 95, 1, 74, '%'],
  ['centerScale', 'Center field size', 95, 150, 1, 150, '%'],
  ['fade', 'Top and bottom fade', 0, 28, 1, 18, '% of frame height'],
  ['settleMs', 'Prompt settling duration', 350, 1500, 10, 680, 'ms'],
  ['detach', 'Prompt disengage distance', .3, 1.4, .05, .7, 'items before center'],
  ['typingMs', 'Prompt typing duration', 1000, 5000, 1, 2146, 'ms'],
  ['fieldDelayMs', 'Roll delay after click', 0, 2000, 50, 0, 'ms'],
];
const defaults = Object.fromEntries(controlSpecs.map(([key,,,,,value]) => [key,value]));
const settings = {...defaults};
try {
  const current = localStorage.getItem('product-vertical-study-v5');
  const previous = localStorage.getItem('product-vertical-study-v4');
  const saved = JSON.parse(current || previous || localStorage.getItem('product-vertical-study-v3') || '{}');
  if (!current) saved.speed = 1.4;
  if (!current && !previous) saved.fieldDelayMs = 0;
  for (const [key,,min,max] of controlSpecs) if (Number.isFinite(saved[key])) settings[key] = Math.max(min, Math.min(max, saved[key]));
} catch { /* Storage is optional; the controls still work. */ }

function makeTile(field, rows) {
  const tile = document.createElement('div');
  tile.className = 'study-tile';
  const size = document.createElement('div');
  size.className = 'study-tile-size';
  const copy = field.cloneNode(true);
  // Authorized layout difference: the horizontal description uses a standard-height input.
  if (rows) copy.querySelector('.lp-product-area')?.classList.remove('lp-product-area');
  copy.querySelectorAll('.lp-product-updated').forEach(node => node.remove());
  copy.querySelectorAll('.lp-product-toggle').forEach((img, i) => {
    const toggle = document.createElement('span');
    toggle.className = 'study-toggle'; toggle.dataset.toggleIndex = i;
    toggle.setAttribute('aria-hidden', 'true'); img.replaceWith(toggle);
  });
  const label = copy.querySelector('.lp-product-label');
  if (label && !label.querySelector('.lp-product-marker')) {
    const marker = document.createElement('img'); marker.className = 'lp-product-marker';
    marker.src = productAssets['./assets/real-ai-product/marker.svg']; marker.alt = ''; label.append(marker);
  }
  copy.querySelector('.lp-product-control')?.classList.remove('lp-product-ai');
  size.append(copy); tile.append(size);
  const value = copy.querySelector('[data-product-value], [data-product-lock], .lp-product-placeholder');
  if (value) {
    value.dataset.studyFinal = value.hasAttribute('data-product-lock') ? '6' : value.dataset.studyValue || value.textContent;
    tile.dataset.kind = value.dataset.productValue === 'select' ? 'select' : /^\d+$/.test(value.dataset.studyFinal) ? 'number' : 'type';
    if (value.classList.contains('lp-product-placeholder')) value.classList.remove('lp-product-placeholder');
    value.dataset.studyPlaceholder = value.dataset.productPlaceholder || value.textContent;
  }
  return tile;
}

export const init = stageInitializer('[data-product-study]', stage => {
  const rows = stage.dataset.productStudy === 'rows';
  const crawl = stage.dataset.productStudy === 'crawl';
  const camera = stage.dataset.productStudy === 'camera';
  const flatCamera = camera && stage.dataset.cameraFlat === 'true';
  let screen, cameraPlane, cameraFields = [];
  const ease = readMotionEasingCurve();
  const duration = getDefaultDurationMs() / 1000;
  const layer = document.createElement('div'); layer.className = 'study-fields';
  const prompt = document.createElement('div'); prompt.className = 'study-prompt';
  const promptSize = document.createElement('div'); promptSize.className = 'study-prompt-size';
  const bar = source.content.querySelector('.lp-product-bar').cloneNode(true);
  bar.querySelector('.lp-product-copy')?.remove();
  promptSize.append(bar); prompt.append(promptSize);
  const title = bar.querySelector('.lp-product-change-title');
  const policy = bar.querySelector('.lp-product-policy'); policy.textContent = '';
  const ask = bar.querySelector('.lp-product-prompt');
  const askRow = bar.querySelector('.lp-product-ask');
  const fade = document.createElement('div'); fade.className = 'study-fade';
  stage.append(layer, prompt, fade);
  const animations = [], generated = [];
  let tiles = [], tracks = [], elapsed = 0;
  let height = 0, width = 0;
  let dropdownMenus=[];
  let entryKey='', entryFocus=0, pickupFocus=0, entranceClock;
  function rebuild() {
    animations.forEach(a => a.cancel()); animations.length = 0;
    generated.length = 0; layer.replaceChildren();
    width = stage.clientWidth; height = stage.clientHeight;
    if (camera) {
      screen = source.content.querySelector('.lp-product-content').cloneNode(true);
      screen.classList.add('study-camera-screen');
      cameraFields = [...screen.querySelectorAll('[data-product-value], [data-product-lock]')].map(value => ({
        value, final:value.hasAttribute('data-product-lock') ? '3' : value.textContent,
        placeholder:value.dataset.productPlaceholder || 'Enter months',
        field:value.closest('.lp-product-field'),
      }));
      cameraPlane = document.createElement('div');
      cameraPlane.className = 'study-camera-plane';
      screen.style.width = `${width}px`;
      screen.style.minHeight = `${height}px`;
      cameraPlane.append(screen); layer.append(cameraPlane);
      // Measure once before high-resolution zoom; never remeasure rounded,
      // zoomed offsets while the camera is moving.
      cameraFields.forEach(item=>{
        item.geometry={x:item.field.offsetLeft+item.field.offsetWidth/2,
          y:item.field.offsetTop+item.field.offsetHeight/2,width:item.field.offsetWidth};
      });
      dropdownMenus=createDropdownMenus(cameraFields);
      screen.style.zoom='3.2';
    } else if (rows) {
      tracks = Array.from({length:3}, (_, row) => {
        const track = document.createElement('div'); track.className = 'study-row';
        track.style.top = `${height / 2 + (row - 1) * width * .145 - width * .045}px`;
        const sequence = document.createElement('div'); sequence.className = 'study-sequence';
        // Required AI fields plus lock and rescheduling controls, spread across three rows.
        const fields = originals.filter((_, i) => i % 3 === row);
        fields.forEach((field, i) => {
          const tile = makeTile(field, true);
          tile.style.setProperty('--tile-width', field === toggleGroup ? '29cqi' : field.querySelector('.lp-product-area') ? '83cqi' : `${[34,26,30,36,28][(i + row) % 5]}cqi`);
          sequence.append(tile);
        });
        track.append(sequence); layer.append(track); return track;
      });
      createSeamlessMarquee({ tracks, frame:stage, duration:duration * 1000, sequenceSelector:'.study-sequence', animations, generated });
      tiles = [...layer.querySelectorAll('.study-tile')];
    } else if (crawl) {
      tiles = originals.map(field => makeTile(field, true));
      layer.append(...tiles);
    } else {
      const removed = new Set(['Maximum deferrals per year', 'Maximum reschedules']);
      tiles = originals.filter(field => !removed.has(field.querySelector('.lp-product-label')?.textContent.trim())).map(field => makeTile(field, false));
      layer.append(...tiles);
    }
  }
  rebuild();
  function fill(tile, progress, cycle = 0) {
    const p = clamp(progress);
    const value = tile.querySelector('[data-study-final]');
    if (value) {
      const final = value.dataset.studyFinal;
      const next = tile.dataset.kind === 'select'
        ? p > .22 ? final : value.dataset.studyPlaceholder
        : tile.dataset.kind === 'number'
          ? String(Math.round((Number(final) - cycle % 2) * ease(p) + cycle % 2))
          : p <= 0 ? value.dataset.studyPlaceholder : final.slice(0, Math.ceil(final.length * p));
      if (value.textContent !== next) value.textContent = next;
      value.classList.toggle('study-value-empty', p <= 0 || tile.dataset.kind === 'select' && p <= .22);
    }
    const changed = tile.dataset.kind === 'select' ? p > .22 : p > .08;
    const pulse = p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0;
    const control = tile.querySelector('.lp-product-control');
    if (control) {
      control.style.borderColor = changed ? '#ffa38e' : '#d1d1d1';
      control.style.boxShadow = `0 0 0 ${pulse * .23}cqi rgb(255 127 98 / ${pulse * .13})`;
    }
    const marker = tile.querySelector('.lp-product-marker');
    if (marker) {
      const iconProgress = clamp((p - (tile.dataset.kind === 'select' ? .22 : .08)) * 4);
      marker.style.opacity = iconProgress;
      marker.style.transform = `scale(${.35 + .65 * ease(iconProgress)}) rotate(${-65 * (1 - ease(iconProgress))}deg)`;
    }
    tile.querySelectorAll('.study-toggle').forEach((toggle, i) => {
      // Stable per pass, but a different subset turns on each time through the loop.
      const on = (cycle + i) % 3 !== 1;
      const amount = on ? ease(clamp((p - i * .17) * 2)) : 0;
      toggle.style.setProperty('--toggle-progress', amount);
      toggle.style.backgroundColor = amount > .5 ? '#ff7f62' : '#e7e7e7';
    });
  }
  function verticalGeometry(config) {
    const fieldWidth=46*config.fieldWidth/100;
    tiles.forEach(tile=>{tile.style.width=`${fieldWidth}cqi`;tile.style.left=`${(100-fieldWidth)/2}cqi`;});
    const layoutHeights=[width*.0483333,...tiles.map(tile=>tile.offsetHeight),width*.1083333];
    const originShift=-.06*width/2*config.centerScale/100;
    const geometryKey=JSON.stringify([layoutHeights,width,height,config]);
    if(geometryKey!==entryKey){entryKey=geometryKey;entryFocus=verticalEntryFocus(layoutHeights,width,height,config,0);
      pickupFocus=verticalPickupFocus(layoutHeights,width,height,config,originShift);
      entranceClock=createEntranceClock(layoutHeights,width,height,config,entryFocus);}
    return {layoutHeights,originShift,entryFocus,pickupFocus,entranceClock};
  }
  function verticalTiming(config) {
    const step=duration*.84/config.speed;
    const collapseAt=(config.typingMs+config.promptHoldMs)/1000;
    const start=collapseAt+config.fieldDelayMs/1000;
    const {entryFocus,pickupFocus,entranceClock}=verticalGeometry(config);
    const detachFocus=tiles.length+1-config.detach;
    const settleStart=entranceClock.timeAtFocus(detachFocus)*step;
    return {step,start,collapseAt,entryFocus,pickupFocus,entranceClock,detachFocus,settleStart,total:start+settleStart+config.settleMs/1000};
  }
  function renderVertical(reduced) {
    const {step, start, collapseAt, pickupFocus, entranceClock, settleStart, detachFocus, total} = verticalTiming(settings);
    const pass = Math.floor(elapsed / total), t = elapsed % total;
    const typedAt = settings.typingMs / 1000;
    const mask = clamp((t - collapseAt) / (settings.maskMs / 1000));
    const rolling=t>=start;
    const rollTime=Math.max(0,t-start);
    const focus=entranceClock.focus(rollTime/step);
    const settling = rolling && focus >= detachFocus;
    const returning = rolling && focus > 3;
    const scaleAtCenter = settings.centerScale / 100;
    const fieldWidth = 46 * settings.fieldWidth / 100;
    stage.style.setProperty('--study-fade-size', `${settings.fade}%`);
    prompt.style.width = `${fieldWidth}cqi`;
    prompt.style.left = `${(100 - fieldWidth) / 2}cqi`;
    tiles.forEach(tile => { tile.style.width = `${fieldWidth}cqi`; tile.style.left = `${(100 - fieldWidth) / 2}cqi`; });
    const fullBarHeight = 10.83333;
    const statusHeight = 4.83333;
    const currentMask = returning ? 0 : mask;
    bar.style.height = `${fullBarHeight - (fullBarHeight - statusHeight) * currentMask}cqi`;
    bar.style.overflow = 'hidden';
    askRow.style.height = '6cqi';
    askRow.style.paddingBlock = '.83333cqi';
    askRow.style.opacity = '1';
    promptSize.style.height = bar.style.height;
    promptSize.style.transform = 'none';
    prompt.style.height = `${width * fullBarHeight / 100}px`;
    prompt.style.top = '50%';
    // Both bars are measured list items, sharing the fields' width and scale.
    const {layoutHeights,originShift}=verticalGeometry(settings);
    const carry=pass>0&&t<start;
    // The wheel runs at one speed from its hidden starting angle through pickup.
    // Index zero is a virtual copy of the status bar until it aligns with the
    // stationary real bar. Switching transform ownership there is invisible.
    const fieldFocus=reduced?3:carry?detachFocus+(settings.settleMs/1000+t)/step:focus;
    const poses = verticalFieldPoses(layoutHeights,fieldFocus,width,settings,height);
    layer.style.opacity = reduced || rolling || carry ? '1' : '0';
        poses.slice(1,-1).forEach(({index,position,scale,rotation,y}) => {
      const tile = tiles[index-1];
      tile.style.transform = `translateY(${height / 2 + y - tile.offsetHeight / 2}px) scale(${scale})`;
      tile.querySelector('.study-tile-size').style.transform = `perspective(${width*.9}px) rotateX(${rotation}deg)`;
      tile.style.opacity = '1';
      fill(tile,reduced ? 1 : (.75-position)/.9,pass);
    });
    const shellHeight=fullBarHeight-(fullBarHeight-statusHeight)*currentMask;
    let pose={y:-(fullBarHeight-shellHeight)*width/200*scaleAtCenter,rotation:0,scale:scaleAtCenter};
    if(rolling&&!returning) {
      const engageStart=Math.max((collapseAt+settings.maskMs/1000)-start,entranceClock.timeAtFocus(pickupFocus-settings.engage)*step);
      const engageEnd=Math.max(engageStart+.001,entranceClock.timeAtFocus(pickupFocus+settings.engage)*step);
      if(rollTime>=engageEnd)pose=poses[0];
      else if(rollTime>engageStart) {
        const targetFocus=entranceClock.focus(engageEnd/step);
        const target=verticalFieldPoses(layoutHeights,targetFocus,width,settings,height)[0];
        const next=verticalFieldPoses(layoutHeights,entranceClock.focus((engageEnd+.001)/step),width,settings,height)[0];
        pose=engagePromptPose({y:originShift,rotation:0,scale:scaleAtCenter},
          {...target,velocity:(next.y-target.y)/.001,rotationVelocity:(next.rotation-target.rotation)/.001,scaleVelocity:(next.scale-target.scale)/.001},
          (rollTime-engageStart)/(engageEnd-engageStart),engageEnd-engageStart);
      }
    }
    if(returning)pose=poses.at(-1);
    if (settling) {
      const origin = verticalFieldPoses(layoutHeights,detachFocus,width,settings,height).at(-1);
      const next = verticalFieldPoses(layoutHeights,detachFocus+.001,width,settings,height).at(-1);
      pose = settlePromptPose({...origin,velocity:(origin.y-next.y)/.001,rotationVelocity:(next.rotation-origin.rotation)/.001,scaleVelocity:(next.scale-origin.scale)/.001,targetScale:scaleAtCenter},
        (rollTime-settleStart)/(settings.settleMs/1000),settings.settleMs/1000/step);
    }
    // The shell follows the masked height continuously, so engagement never
    // swaps a full-height wrapper for a shorter one in a single frame.
    prompt.style.height=`${width*shellHeight/100}px`;
    prompt.style.transform=`translateY(calc(-50% + ${pose.y}px)) perspective(${width*.9}px) rotateX(${pose.rotation}deg) scale(${pose.scale})`;
    prompt.style.opacity = reduced ? '0' : '1';
    bar.dataset.productState=returning?'idle':t<collapseAt?'typing':'working';
    title.textContent = returning || t < collapseAt ? 'Ask Stitch AI' : 'Creating personal loan...';
    ask.textContent = returning ? 'Ask for a change…' : promptText.slice(0,Math.ceil(promptText.length*clamp(t/typedAt)));
    renderProductWorking(bar,t,t>=collapseAt&&!returning?1:0);
    if (t>=collapseAt&&!returning) renderProductWorking(promptSize,t,1); else clearProductWorking(promptSize);
  }
  function renderRows(reduced) {
    const typedAt=duration*3.8, start=typedAt, body=5, total=start+body+duration;
    const t=elapsed%total;
    const collapse=clamp((t-typedAt)/duration), enter=clamp((t-start)/duration), exit=clamp((t-start-body)/duration);
    const collapsed=ease(collapse);
    bar.style.height=`${9.25-4.41667*collapsed}cqi`;
    askRow.style.height=`${4.33333*(1-collapsed)}cqi`;
    askRow.style.opacity=1-collapse; askRow.style.overflow='hidden';
    askRow.style.paddingBlock=`${.83333*(1-collapsed)}cqi`;
    askRow.style.borderTopWidth=`${.08333*(1-collapsed)}cqi`;
    prompt.style.top='50%';prompt.style.opacity=reduced?0:1-exit;
    prompt.style.transform=`translateY(-50%) scale(${1+ease(exit)*.06})`;
    bar.dataset.productState=t<duration*.6?'idle':t<typedAt?'typing':'working';
    title.textContent=t<typedAt?'Ask Stitch AI':'Creating personal loan...';
    ask.textContent=t<duration*.6?'Ask for a change…':promptText.slice(0,Math.ceil(promptText.length*clamp((t-duration*.6)/(typedAt-duration*.6))));
    renderProductWorking(bar,t,t>=typedAt?1:0);
    layer.style.opacity=reduced?1:enter*(1-exit);layer.style.transform='none';
    const clock=Math.max(0,t-start)+duration*.6;
    animations.forEach(a=>{a.currentTime=reduced?0:clock*1800;});
    tiles.forEach((tile,i)=>{const phase=(clock+(i%7)*.39)%2.2;fill(tile,reduced?1:(phase-.15)/.85,Math.floor(elapsed/total)+Math.floor((clock+(i%7)*.39)/2.2));});
  }
  function renderCrawl(reduced) {
    const typingStart=duration*.65, typedAt=typingStart+duration*2.8;
    const collapseAt=typedAt+duration*.85, launch=collapseAt+duration*.65;
    const stride=width*.1;
    const rowCount=crawlRows.length;
    const speed=(height*1.35+Math.ceil(tiles.length/2)*width*.155)/(duration*18)*1.18;
    // Solve the tilted/scaled plane's projection for screen center. Fade
    // when the last row's bottom reaches it, rather than after a distant exit.
    const tilt=48*Math.PI/180, planeScale=1.1, perspective=width*.65;
    const centerOnPlane=height+(height*.5-height)/(planeScale*(Math.cos(tilt)+height*.4*Math.sin(tilt)/perspective));
    const travel=(height*1.12+(rowCount-1)*stride+width*.09-centerOnPlane)/speed;
    const fadeDuration=duration*1.4;
    const total=launch+travel+fadeDuration+duration*.25;
    const t=elapsed%total, pass=Math.floor(elapsed/total);
    const mask=ease(clamp((t-collapseAt)/(duration*.65)));
    const exit=clamp((t-launch-travel)/fadeDuration);
    // The native bar stays flat and centered; only its outer mask collapses.
    bar.style.height=`${9.16666-4.33333*mask}cqi`;
    bar.style.overflow='hidden';
    askRow.style.height='4.33333cqi'; askRow.style.paddingBlock='.83333cqi';
    promptSize.style.transform='none';
    prompt.style.transform=`translateY(-50%) scale(${1.3+.035*ease(exit)})`;
    prompt.style.opacity=reduced?'0':String(clamp(t/(duration*.5))*(1-exit));
    title.textContent=t<collapseAt?'Ask Stitch AI':'Creating personal loan...';
    bar.dataset.productState=t<typingStart?'idle':t<collapseAt?'typing':'working';
    ask.textContent=t<typingStart?'Ask for a change…':promptText.slice(0,Math.ceil(promptText.length*clamp((t-typingStart)/(typedAt-typingStart))));
    renderProductWorking(bar,t,t>=collapseAt?1:0);
    renderProductWorking(promptSize,t,t>=collapseAt?1:0);
    const clock=Math.max(0,t-launch);
    layer.style.opacity=reduced?'1':String(clamp(clock/duration)*(1-exit));
    // One perspective plane: constant upward travel naturally shrinks fields
    // toward the vanishing point. Tiles retain their native internal artwork.
    tiles.forEach((tile,i)=>{
      let row=0, first=0;
      while (i>=first+crawlRows[row].length) first+=crawlRows[row++].length;
      const widths=crawlRows[row], count=widths.length, column=i-first;
      const gap=.8, span=widths.reduce((sum,value)=>sum+value,0)+gap*(count-1);
      const left=(100-span)/2+widths.slice(0,column).reduce((sum,value)=>sum+value+gap,0);
      const y=reduced?height*.08+row*stride:height*1.12+row*stride-clock*speed;
      tile.style.left=`${left}cqi`;
      tile.style.width=`${widths[column]}cqi`;
      tile.style.transform=`translateY(${y}px)`;
      tile.style.opacity='1';
      // Trigger changes by visible position, rather than completing them
      // while later rows are still below the viewport.
      const progress=(height*.91-y)/(speed*duration*.95)-column*.12;
      fill(tile,reduced?1:progress,pass);
    });
  }
  function renderCamera(reduced) {
    const dropdown=sampleDropdownStudy(elapsed/duration,ease,reduced,flatCamera?{speed:2,topPanSpeed:2.5}:{});
    renderProductCamera({elapsed:dropdown?dropdown.time*duration:elapsed,duration,ease,reduced,stage,screen,cameraPlane,cameraFields,prompt,promptSize,bar,title,policy,ask,askRow,layer,width,height,flatCamera,rtl:stage.matches(':dir(rtl)'),selectorStates:dropdown?.states,cameraLift:dropdown?.lift||0});
    if(dropdown) renderDropdownMenus(dropdownMenus,dropdown);
  }
  function render(reduced=false) {
    if(camera) renderCamera(reduced); else if(crawl) renderCrawl(reduced); else if(rows) renderRows(reduced); else renderVertical(reduced);
    if(matchMedia('(max-width:600px)').matches) {
      // Mobile prompt uses readable screen-space sizing, independently of the
      // tiny form canvas. Preserve each renderer's collapse and transform clock.
      const full=(!rows&&!crawl&&!camera)?10.83333:rows?9.25:9.16666;
      const collapsed=4.83333;
      const open=clamp((parseFloat(bar.style.height)-collapsed)/(full-collapsed));
      const scale=(!rows&&!crawl&&!camera)?settings.centerScale/100:rows?1:1.3;
      const promptWidth=width*.88/scale;
      prompt.style.width=`${promptWidth}px`;
      prompt.style.left=`${(width-promptWidth)/2}px`;
      promptSize.style.transform='none';
      const shell=34+64*open;
      bar.style.height=`${shell}px`;
      askRow.style.height=`${64*open}px`;
      askRow.style.paddingBlock=`${6*open}px`;
      if(!rows&&!crawl&&!camera){promptSize.style.height=`${shell}px`;prompt.style.height=`${shell}px`;}
    } else if(rows||crawl||camera) {
      prompt.style.width=''; prompt.style.left='';
      if(rows) promptSize.style.transform='';
    }
  }
  render(matchMedia('(prefers-reduced-motion: reduce)').matches);
  const controller = {
    vertical: !rows && !crawl && !camera,
    camera,
    flatCamera,
    crawl,
    restart() { elapsed = 0; render(); },
    adjust(previous) {
      if (rows || crawl || camera) return;
      // Keep the same field under focus when speed or intro timing changes.
      const timing = verticalTiming;
      const old = timing(previous), next = timing(settings);
      const pass = Math.floor(elapsed / old.total), t = elapsed % old.total;
      elapsed = pass * next.total + (t < old.start ? t / old.start * next.start : next.start + (t - old.start) / (old.total - old.start) * (next.total - next.start));
      render(matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  };
  studies.add(controller);
  const stop = animateStage(stage, {update({dt, reduced, dirty}) {
    if (dirty && (width !== stage.clientWidth || height !== stage.clientHeight)) rebuild();
    if (!paused && !reduced) elapsed += dt;
    render(reduced);
  }});
  return () => { stop(); animations.forEach(a => a.cancel()); clearProductWorking(bar); clearProductWorking(promptSize); studies.delete(controller); layer.remove(); prompt.remove(); fade.remove(); };
});
const dispose = init();
document.querySelector('#pause')?.addEventListener('click', event => {
  paused = !paused; event.currentTarget.textContent = paused ? 'Resume' : 'Pause';
  event.currentTarget.setAttribute('aria-pressed', String(paused));
});
document.querySelector('#flat-camera-replay')?.addEventListener('click', () => studies.forEach(study => { if (study.flatCamera) study.restart(); }));
document.querySelector('#camera-replay')?.addEventListener('click', () => studies.forEach(study => { if (study.camera && !study.flatCamera) study.restart(); }));
document.querySelector('#crawl-replay')?.addEventListener('click', () => studies.forEach(study => { if (study.crawl) study.restart(); }));
document.querySelector('#restart')?.addEventListener('click', () => studies.forEach(study => study.restart()));
window.addEventListener('pagehide', dispose, {once:true});

const controls = document.querySelector('#vertical-controls');
if (controls) {
  const summary = document.querySelector('#vertical-values');
  const status = document.querySelector('#vertical-control-status');
  function sync() {
    for (const [key] of controlSpecs) {
      controls.querySelectorAll(`[data-setting="${key}"]`).forEach(input => { input.value = settings[key]; });
    }
    summary.value = 'Vertical product study settings\n' + controlSpecs.map(([key,label,,,,,unit]) => `${label}: ${settings[key]} ${unit}`).join('\n');
    try { localStorage.setItem('product-vertical-study-v5', JSON.stringify(settings)); } catch {}
  }
  for (const [key,label,min,max,step,,unit] of controlSpecs) {
    const group = document.createElement('div'); group.className = 'study-setting';
    group.innerHTML = `<label for="vertical-${key}">${label}</label><div class="study-setting-inputs"><input id="vertical-${key}" aria-label="${label}" type="range" data-setting="${key}" min="${min}" max="${max}" step="${step}"><input aria-label="${label} value" type="number" data-setting="${key}" min="${min}" max="${max}" step="${step}"><span>${unit}</span></div>`;
    controls.append(group);
  }
  function applyControl(event) {
    const key = event.target.dataset.setting;
    if (!key || event.target.value === '') return;
    const spec = controlSpecs.find(item => item[0] === key);
    const value = Number(event.target.value);
    if (!Number.isFinite(value)) return;
    const previous = {...settings};
    settings[key] = Math.max(spec[2], Math.min(spec[3], value));
    studies.forEach(study => study.adjust(previous)); sync(); status.textContent = 'Updated · saved in this browser';
  }
  controls.addEventListener('input', event => { if (event.target.type === 'range') applyControl(event); });
  controls.addEventListener('change', event => { if (event.target.type === 'number') applyControl(event); });
  document.querySelector('#vertical-reset').addEventListener('click', () => {
    const previous = {...settings}; Object.assign(settings, defaults);
    studies.forEach(study => study.adjust(previous)); sync(); status.textContent = 'Defaults restored';
  });
  document.querySelector('#vertical-replay').addEventListener('click', () => {
    studies.forEach(study => { if (study.vertical) study.restart(); });
  });
  document.querySelector('#vertical-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(summary.value); status.textContent = 'Settings copied — paste them into this chat'; }
    catch { summary.focus(); summary.select(); status.textContent = 'Select and copy the settings below'; }
  });
  sync();
}
