import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
// Draft-only portable runtime. Shared releases mount through page-all-lite and
// must remove this HtmlEmbed runtime before middle/publication.
const result = await build({ entryPoints: ['src/embeds/instant-virtual-cards.js'], bundle: true, format: 'iife', minify: true, write: false, target: 'es2020' });
await mkdir('dist/embeds', { recursive: true });
await writeFile('dist/embeds/instant-virtual-cards-motion.html', `<script data-ivc-draft-runtime>\n${result.outputFiles[0].text}\n</script>\n`);
