import { readFile, writeFile } from 'node:fs/promises';
const directory = 'src/embeds/real-ai-film/';
const cdn = 'https://d280qq257tic0i.cloudfront.net/Stitch+Animations/releases/97b491b074b0c5a08d9674a14b6d212bb669e5a7/assets/real-ai-film/';
const filmMedia = 'https://d280qq257tic0i.cloudfront.net/Stitch+Animations/releases/97b491b074b0c5a08d9674a14b6d212bb669e5a7/assets/real-ai-film-v2-bff954c70e2b/';
const icon = (name, hidden = false) => `<img class="film-icon" data-film-icon="${name}" src="${cdn}${name}.svg" width="24" height="24" alt=""${hidden ? ' hidden="true"' : ''}>`;
const html = `<video class="film-full-video" data-film-video="true" src="${filmMedia}film.mp4" poster="${filmMedia}poster.webp" playsinline="true" preload="none" aria-label="Stitch AI full film" aria-hidden="true" disablepictureinpicture="true" disableremoteplayback="true"></video>
<button class="film-start" data-film-start="true" type="button" aria-label="Play the full Stitch AI film"></button>
<div class="film-controls" data-film-controls="true" aria-hidden="true"><div class="film-toolbar">
<div class="film-timeline"><input class="film-range" data-film-seek="true" type="range" min="0" max="100" step="0.1" value="0" aria-label="Seek film"></div>
<div class="film-row" role="group" aria-label="Film playback controls"><div class="film-left">
<button class="film-control" data-film-toggle="true" type="button" aria-label="Play film">${icon('play')}${icon('pause', true)}</button>
<div class="film-volume-group"><button class="film-control" data-film-mute="true" type="button" aria-label="Mute film" aria-pressed="false">${icon('sound')}${icon('mute', true)}</button><div class="film-volume"><input class="film-range" data-film-volume="true" type="range" min="0" max="100" step="1" value="100" aria-label="Volume"></div></div>
<p class="film-time" data-film-time="true">0:00 // 1:42</p></div>
<button class="film-control" data-film-fullscreen="true" type="button" aria-label="Enter fullscreen">${icon('fullscreen')}${icon('exitfullscreen', true)}</button>
</div></div><p class="film-status" data-film-status="true" role="status" aria-live="polite"></p></div>`;
const css = await readFile(directory + 'player.css', 'utf8');
const states = await readFile(directory + 'states.css', 'utf8');
const js = (await readFile(directory + 'player.js', 'utf8')).replaceAll('export function ', 'function ');
const embed = `<style>\n${states}\n</style>\n<script>\n(() => {\n${js}\nwindow.Webflow = window.Webflow || [];\nwindow.Webflow.push(() => init());\n})();\n</script>`;
await writeFile(directory + 'player.html', html + '\n');
await writeFile(directory + 'runtime.html', embed + '\n');
await writeFile('/private/tmp/real-ai-film-webflow.json', JSON.stringify({html, css, embed, cdn}));
await writeFile('real-ai-film.html', `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>@font-face{font-family:Diatype;src:url('/src/embeds/assets/real-time-approvals/body-regular.woff2')}body{margin:40px;background:#ddd;font-family:Diatype,sans-serif}.lp-film-poster{position:relative;aspect-ratio:16/9;max-width:1024px;margin:auto;overflow:hidden;border-radius:12px}.real-ai-background-video{position:absolute;width:100%;height:100%;object-fit:cover}.lp-film-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:white;border-radius:50%;width:72px;height:72px;display:grid;place-items:center;pointer-events:none}${css}${states}</style></head><body><section class="lp-film-poster" data-film-player="true"><video class="real-ai-background-video" data-real-ai-background-video="film" src="https://d280qq257tic0i.cloudfront.net/Stitch+Animations/releases/97b491b074b0c5a08d9674a14b6d212bb669e5a7/assets/real-ai-loop/stitch-ai-cut-2448fc24eac8.mp4" poster="https://cdn.prod.website-files.com/6823036cd77b3093eaf9154d/6afc35ea5a5862d31e2897ae_stitch-ai-cut-2448fc24eac8-poster.webp" autoplay muted loop playsinline></video><div class="lp-film-play">${icon('play')}</div>${html}</section><script type="module">import {init} from '/src/embeds/real-ai-film/player.js';init();</script></body></html>`);
console.log('Built native player markup and draft runtime.');

// Both destinations are generated from the same player markup, styles and runtime.
const cmsCode = (await readFile(directory + 'cms.js', 'utf8')).replace(/^import .*;\n/m, '').replaceAll('export function ', 'function ');
const cmsLayout = await readFile(directory + 'cms.css', 'utf8');
const cmsBase = css.replace(/(^|\n)(\.film-[\w-]+)(?=\s*\{)/g, '$1.stitch-cms-video $2');
const cmsStates = states.replaceAll('[data-film-player]', '.stitch-cms-video[data-film-player]').replace(/(^|\n)(\.film-control[^\n]*|\.film-start[^\n]*|\.film-range[^\n]*)(?=\s*\{)/g, '$1.stitch-cms-video $2').replaceAll(', .film-', ', .stitch-cms-video .film-');
const backgroundURL = 'https://d280qq257tic0i.cloudfront.net/Stitch+Animations/releases/97b491b074b0c5a08d9674a14b6d212bb669e5a7/assets/real-ai-loop/stitch-ai-cut-2448fc24eac8.mp4';
const backgroundPoster = 'https://cdn.prod.website-files.com/6823036cd77b3093eaf9154d/6afc35ea5a5862d31e2897ae_stitch-ai-cut-2448fc24eac8-poster.webp';
const cmsMarkup = `<video class="real-ai-background-video" data-real-ai-background-video="film" src="${backgroundURL}" poster="${backgroundPoster}" autoplay="true" muted="true" loop="true" playsinline="true" preload="metadata" aria-hidden="true" tabindex="-1" disablepictureinpicture="true" disableremoteplayback="true"></video><div class="lp-film-play"><img class="stitch-cms-play-icon" src="${cdn}play.svg" width="24" height="24" alt=""></div>${html}`;
const cmsEmbed = `<style>\n${cmsBase}\n${cmsStates}\n${cmsLayout}\n</style>\n<script>\n(() => {\n${js}\n${cmsCode}\nwindow.Webflow = window.Webflow || [];\nwindow.Webflow.push(() => {\n  if (window.stitchCMSVideoDispose) window.stitchCMSVideoDispose();\n  window.stitchCMSVideoDispose = initCMSVideos({ markup: ${JSON.stringify(cmsMarkup)} });\n});\n})();\n</script>`;
await writeFile(directory + 'cms-runtime.html', cmsEmbed + '\n');
await writeFile('real-ai-film-cms.html', `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>@font-face{font-family:Diatype;src:url('/src/embeds/assets/real-time-approvals/body-regular.woff2')}body{font-family:Diatype,Arial,sans-serif;margin:40px auto;max-width:800px;padding:0 20px;line-height:1.5}</style></head><body><article><p>Article text before the player.</p><div data-stitch-video="real-ai"></div><p>Article text after the player.</p><div data-stitch-video="real-ai"></div></article>${cmsEmbed}<script>window.Webflow.forEach(fn=>fn());</script></body></html>`);
