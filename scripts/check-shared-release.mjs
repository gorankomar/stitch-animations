import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import assert from 'node:assert/strict';

const dist = resolve('dist');
const read = name => readFileSync(resolve(dist, name), 'utf8');
const loader = read('page-all-lite.js');
for (const feature of ['product-variety', 'country-flags']) {
  assert.ok(loader.includes(`feature-${feature}.js`), `Shared loader missing ${feature}`);
}
assert.ok(read('feature-product-variety.js').includes('product-variety_blue'), 'Built Product Variety is missing wallet swap');
assert.ok(read('feature-country-flags.js').includes('data-country-flags-row'), 'Built Country Flags is missing row animation');

function check(directory) {
  for (const entry of readdirSync(directory, {withFileTypes: true})) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) check(path);
    else if (entry.name.endsWith('.js')) {
      for (const [, dependency] of readFileSync(path, 'utf8').matchAll(/["'](\.{1,2}\/[^"']+\.(?:js|css))["']/g)) {
        assert.ok(existsSync(resolve(dirname(path), dependency)), `Missing dependency ${dependency} from ${path}`);
      }
    }
  }
}
check(dist);
console.log('Shared release contains wallet swap, country flags, and all relative dependencies.');
