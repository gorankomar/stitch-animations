import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const result = await build({
  absWorkingDir: root,
  entryPoints: ['src/embeds/report-graphic.js'],
  bundle: true,
  write: false,
  minify: true,
  format: 'iife',
  target: 'es2020'
});
const css = await readFile(new URL('../src/embeds/report-graphic.css', import.meta.url), 'utf8');
const output = new URL('../dist/embeds/report-graphic.html', import.meta.url);
await mkdir(new URL('../dist/embeds/', import.meta.url), { recursive: true });
await writeFile(output, `<style>${css}</style>\n<script>${result.outputFiles[0].text}</script>`);
console.log(`Built ${fileURLToPath(output)}`);
