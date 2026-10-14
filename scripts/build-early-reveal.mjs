import { mkdir, writeFile } from 'node:fs/promises';
import { earlyRevealHead } from '../src/lib/effects/early-reveal.js';
await mkdir('dist/embeds', { recursive: true });
await writeFile('dist/embeds/reveal-early-head.html', earlyRevealHead());
