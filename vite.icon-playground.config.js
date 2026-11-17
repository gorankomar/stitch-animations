import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

// Public client presentations only; do not ship other playgrounds or docs.
export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    outDir: 'dist-icon-playground',
    sourcemap: false,
    rollupOptions: { input: {icons:resolve(process.cwd(), 'icon-playground.html'), productLab:resolve(process.cwd(), 'real-ai-product-layout-lab.html')} }
  },
  plugins: [{
    name: 'icon-playground-home',
    async closeBundle() {
      await copyFile('dist-icon-playground/icon-playground.html','dist-icon-playground/index.html');
      const page=await readFile('dist-icon-playground/icon-playground.html','utf8');
      await mkdir('dist-icon-playground/icons-playground',{recursive:true});
      await writeFile('dist-icon-playground/icons-playground/index.html',page.replaceAll('./assets/','../assets/'));
      const lab=await readFile('dist-icon-playground/real-ai-product-layout-lab.html','utf8');
      await mkdir('dist-icon-playground/relayer/product-layout-lab',{recursive:true});
      await writeFile('dist-icon-playground/relayer/product-layout-lab/index.html',lab.replaceAll('./assets/','../../assets/'));
    }
  }]
});
