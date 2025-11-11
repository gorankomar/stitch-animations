import { defineConfig } from 'vite';
import path, { resolve } from 'node:path';

const entry = (name) => resolve(process.cwd(), `src/entry/${name}.js`);

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        'page-all': entry('page-all'),
        'page-all-lite': entry('page-all-lite'),
        'feature-hero': entry('feature-hero')
      },
      output: {
        entryFileNames: `[name].[hash].js`,
        chunkFileNames: `chunks/[name].[hash].js`,
        assetFileNames: (assetInfo) => {
          const originalName = assetInfo?.name ?? 'asset';
          const ext = path.extname(originalName);
          const base = path.basename(originalName, ext);
          const folder = ext === '.css' ? 'styles' : 'assets';
          return `${folder}/${base}.[hash]${ext}`;
        }
      }
    }
  }
});
