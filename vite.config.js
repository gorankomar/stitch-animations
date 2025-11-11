import { defineConfig } from 'vite';
import path, { resolve } from 'node:path';

const entry = (name) => resolve(process.cwd(), `src/entry/${name}.js`);
const isSingleHeroBuild = process.env.SINGLE_ENTRY === 'hero';

const sharedOutput = {
  entryFileNames: `[name].[hash].js`,
  chunkFileNames: `chunks/[name].[hash].js`,
  assetFileNames: (assetInfo) => {
    const originalName = assetInfo?.name ?? 'asset';
    const ext = path.extname(originalName);
    const base = path.basename(originalName, ext);
    const folder = ext === '.css' ? 'styles' : 'assets';
    return `${folder}/${base}.[hash]${ext}`;
  }
};

const singleHeroOutput = {
  entryFileNames: `feature-hero.js`,
  assetFileNames: (assetInfo) => {
    const originalName = assetInfo?.name ?? 'asset';
    const ext = path.extname(originalName);
    if (ext === '.css') {
      return `feature-hero.css`;
    }
    const base = path.basename(originalName, ext) || 'asset';
    return `assets/${base}.[hash]${ext}`;
  }
};

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    inlineDynamicImports: isSingleHeroBuild,
    rollupOptions: {
      input: isSingleHeroBuild
        ? { 'feature-hero': entry('feature-hero') }
        : {
            'page-all': entry('page-all'),
            'page-all-lite': entry('page-all-lite'),
            'feature-hero': entry('feature-hero')
          },
      output: isSingleHeroBuild ? singleHeroOutput : sharedOutput
    }
  }
});
