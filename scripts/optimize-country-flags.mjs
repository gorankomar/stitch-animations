// Run with SVGO available via SVGO_MODULE (or a local installation).
import fs from 'node:fs/promises';
import path from 'node:path';
const { optimize } = await import(process.env.SVGO_MODULE || 'svgo');
const source = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
const dir = 'src/embeds/assets/country-flags';
await fs.mkdir(dir, { recursive: true });
const manifest = [];
for (const flag of source) {
  const slug = flag.country.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  // The source's Radius=Off variants contain baked rounded background paths.
  let svg = flag.svg.replace(/<path d="M19 0H2C0\.89543[^"\n]+" fill="([^"]+)"\/>/g,
    '<rect width="21" height="15" fill="$1"/>');
  // Qatar also contains a baked rounded outline; use a square outline.
  svg = svg.replace(/<path d="M19 0\.5H2C1\.17157[^"\n]+" ([^>]+)\/>/g,
    '<rect x="0.5" y="0.5" width="20" height="14" $1/>');
  svg = svg.replace('width="21" height="15" viewBox=', 'width="42" height="30" viewBox=');
  const result = optimize(svg, { multipass: true, plugins: ['preset-default'] });
  await fs.writeFile(path.join(dir, `${slug}.svg`), result.data + '\n');
  manifest.push({ country: flag.country, nodeId: flag.nodeId, file: `${slug}.svg`, originalBytes: Buffer.byteLength(flag.svg), optimizedBytes: Buffer.byteLength(result.data) });
}
await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ flags: manifest.length, originalBytes: manifest.reduce((s,f)=>s+f.originalBytes,0), optimizedBytes: manifest.reduce((s,f)=>s+f.optimizedBytes,0) }));
