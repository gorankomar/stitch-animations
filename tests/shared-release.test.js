import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkSharedRelease } from '../scripts/check-shared-release.mjs';

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'stitch-release-test-'));
  t.after(() => rmSync(dir, {recursive:true, force:true}));
  mkdirSync(join(dir, 'chunks'));
  mkdirSync(join(dir, '.vite'));
  writeFileSync(join(dir, '.vite/manifest.json'), '{}');
  const write = (name, content) => writeFileSync(join(dir, name), content);
  for (const name of ['page-all.js', 'page-all-lite.js']) {
    write(name, 'import "./chunks/features.js"; const css = ["./styles.css"];');
    write(`${name}.map`, JSON.stringify({sources:[]}));
  }
  write('chunks/features.js', 'const selectors = ["data-product-variety", "product-variety_blue", "data-country-flags"];');
  write('chunks/features.js.map', JSON.stringify({sources:['../../src/embeds/product-variety.js','../../src/lib/effects/wallet-swap.js','../../src/embeds/country-flags.js']}));
  write('styles.css', '.product-variety {color:blue}');
  return {dir, write};
}
test('both shared loaders include features and complete dependencies', t => {
  const {dir} = fixture(t); assert.match(checkSharedRelease(dir), /verified/);
});
test('a feature file outside the loader graph cannot hide a missing feature', t => {
  const {dir,write} = fixture(t); write('page-all-lite.js', 'const nothing = true;');
  assert.throws(() => checkSharedRelease(dir), /page-all-lite.js: missing compiled/);
});
test('missing dynamic import or preload CSS fails', t => {
  const {dir,write} = fixture(t); write('chunks/features.js', 'import("./missing.js");');
  rmSync(join(dir,'styles.css')); assert.throws(() => checkSharedRelease(dir), /missing dependency/);
});
test('wallet swap must be compiled, not merely registered', t => {
  const {dir,write} = fixture(t); write('chunks/features.js.map', JSON.stringify({sources:['../../src/embeds/product-variety.js','../../src/embeds/country-flags.js']}));
  assert.throws(() => checkSharedRelease(dir), /missing compiled src\/lib\/effects\/wallet-swap.js/);
});
test('CSS local assets must exist', t => {
  const {dir,write} = fixture(t); write('styles.css', '.product-variety{background:url(./missing.svg)}');
  assert.throws(() => checkSharedRelease(dir), /missing dependency missing.svg/);
});

test('manifest supplies eagerly extracted CSS and catches missing styles', t => {
  const {dir,write} = fixture(t);
  for (const name of ['page-all.js','page-all-lite.js']) write(name, 'import "./chunks/features.js";');
  write('.vite/manifest.json', JSON.stringify({feature:{file:'chunks/features.js',css:['styles.css']}}));
  assert.match(checkSharedRelease(dir), /verified/);
  rmSync(join(dir,'styles.css'));
  assert.throws(() => checkSharedRelease(dir), /missing dependency styles.css/);
});
