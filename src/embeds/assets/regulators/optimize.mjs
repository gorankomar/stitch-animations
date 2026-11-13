// Run from repository root with SVGO 4.1.0 available.
import {optimize} from 'svgo';
import {readFileSync,writeFileSync} from 'node:fs';
const base='src/embeds/assets/regulators';
const config=JSON.parse(readFileSync(`${base}/svgo.config.json`,'utf8'));
for(const name of ['pci','iso-27001','saudi']) {
  const original=readFileSync(`${base}/originals/${name}.svg`,'utf8');
  const optimized=optimize(original,config).data;
  writeFileSync(`${base}/${name}.svg`,optimized);
  console.log(`${name}: ${original.length} → ${optimized.length} bytes`);
}
