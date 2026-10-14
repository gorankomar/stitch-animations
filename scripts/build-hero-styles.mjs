import { readFile, writeFile, mkdir } from 'node:fs/promises';
const css = await readFile('src/animations/hero/styles.css', 'utf8');
await mkdir('dist/embeds', { recursive: true });
await writeFile('dist/embeds/hero-stack-styles.html', `<style>\n${css}\n</style>\n`);
