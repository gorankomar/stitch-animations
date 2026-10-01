import { mkdir, readFile, writeFile } from 'node:fs/promises';
const css = await readFile(new URL('../src/embeds/transaction-history.css', import.meta.url), 'utf8');
await mkdir(new URL('../dist/embeds/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/embeds/transaction-history-styles.html', import.meta.url), `<style>${css}</style>`);
console.log('Built Transaction history static styles; motion comes from Report Graphic');
