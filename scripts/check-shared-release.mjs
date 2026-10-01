import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

// Vite emits literal relative import/preload paths. Inspect the emitted graph,
// not source entry registrations: an unbuilt source change must not pass.
export function checkSharedRelease(directory = 'dist') {
  const root = resolve(directory);
  const failures = [];
  let manifest;
  try { manifest = JSON.parse(readFileSync(resolve(root, '.vite/manifest.json'), 'utf8')); }
  catch { throw new Error('Shared release check failed: missing or invalid .vite/manifest.json; run the full build.'); }
  const outputs = new Map(Object.values(manifest).map(item => [item.file, item]));
  const requiredSources = ['src/embeds/product-variety.js', 'src/lib/effects/wallet-swap.js', 'src/embeds/country-flags.js'];
  for (const entry of ['page-all.js', 'page-all-lite.js']) {
    const visited = new Set(), sources = new Set(), css = new Set();
    let emitted = '';
    function visit(file) {
      if (visited.has(file)) return;
      visited.add(file);
      const name = relative(root, file);
      if (name.startsWith('..') || name.startsWith('/')) {
        failures.push(`${entry}: dependency outside dist: ${name}`); return;
      }
      if (!existsSync(file)) { failures.push(`${entry}: missing dependency ${name}`); return; }
      const content = readFileSync(file, 'utf8');
      if (extname(file) === '.css') css.add(content);
      if (extname(file) === '.js') {
        emitted += content;
        const record = outputs.get(name.replaceAll('\\', '/'));
        for (const style of record?.css || []) visit(resolve(root, style));
        for (const key of [...(record?.imports || []), ...(record?.dynamicImports || [])]) {
          if (!manifest[key]?.file) failures.push(`${entry}: missing manifest dependency ${key}`);
          else visit(resolve(root, manifest[key].file));
        }
        // Source maps are enabled for every shared build in vite.config.js.
        const mapPath = `${file}.map`;
        if (!existsSync(mapPath)) failures.push(`${entry}: missing source map ${name}.map`);
        else {
          try {
            const map = JSON.parse(readFileSync(mapPath, 'utf8'));
            for (const source of map.sources || []) sources.add(source.replaceAll('\\', '/'));
          } catch { failures.push(`${entry}: invalid source map ${name}.map`); }
        }
        // Includes static/dynamic imports and Vite's CSS/module preload arrays.
        for (const match of content.matchAll(/["']((?:\.\.?\/)[^"'\s]+\.(?:js|css)(?:\?[^"'\s]*)?)["']/g)) {
          visit(resolve(dirname(file), match[1].split('?')[0]));
        }
      } else if (extname(file) === '.css') {
        for (const match of content.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
          const url = match[1];
          if (/^(?:data:|https?:|\/\/|#)/.test(url)) continue;
          const asset = url.split(/[?#]/)[0];
          if (asset.startsWith('/')) failures.push(`${entry}: non-portable CSS asset ${asset}`);
          else visit(resolve(dirname(file), decodeURIComponent(asset)));
        }
        for (const match of content.matchAll(/@import\s+["']([^"']+)["']/g)) {
          if (!/^(?:https?:|\/\/)/.test(match[1])) visit(resolve(dirname(file), match[1]));
        }
      }
    }
    visit(resolve(root, entry));
    for (const source of requiredSources) {
      if (![...sources].some(item => item.endsWith(`/${source}`) || item === source)) failures.push(`${entry}: missing compiled ${source}`);
    }
    for (const marker of ['data-product-variety', 'product-variety_blue', 'data-country-flags']) {
      if (!emitted.includes(marker)) failures.push(`${entry}: missing runtime marker ${marker}`);
    }
    if (![...css].some(content => /\.product-variety|\[data-product-variety\]/.test(content))) failures.push(`${entry}: missing Product Variety CSS`);
  }
  if (failures.length) throw new Error(`Shared release check failed:\n${[...new Set(failures)].join('\n')}`);
  return 'Shared release verified: both loaders include Product Variety/wallet swap and Country Flags; local module/CSS dependencies exist.';
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(checkSharedRelease(process.argv[2])); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
