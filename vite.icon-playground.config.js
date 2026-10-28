import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

// Isolated public presentation: do not ship other playgrounds, docs or public assets.
export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    outDir: 'dist-icon-playground',
    sourcemap: false,
    rollupOptions: { input: resolve(process.cwd(), 'icon-playground.html') }
  },
  plugins: [{
    name: 'icon-playground-home',
    async closeBundle() {
      await copyFile('dist-icon-playground/icon-playground.html','dist-icon-playground/index.html');
      const page=await readFile('dist-icon-playground/icon-playground.html','utf8');
      await mkdir('dist-icon-playground/icons-playground',{recursive:true});
      await writeFile('dist-icon-playground/icons-playground/index.html',page.replaceAll('./assets/','../assets/'));
    }
  }]
});
