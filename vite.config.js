import { defineConfig } from 'vite';
import path, { resolve } from 'node:path';

const entry = (name) => resolve(process.cwd(), `src/entry/${name}.js`);

const SINGLE_ENTRIES = {
  hero: { input: entry('feature-hero'), fileBase: 'feature-hero', globalName: 'FeatureHero' },
  api: { input: entry('feature-api'), fileBase: 'feature-api', globalName: 'FeatureApi' },
  chart: { input: entry('feature-chart'), fileBase: 'feature-chart', globalName: 'FeatureChart' },
  dots: { input: entry('feature-dots'), fileBase: 'feature-dots', globalName: 'FeatureDots' },
  'dots-bulge': { input: entry('feature-dots-bulge'), fileBase: 'feature-dots-bulge', globalName: 'FeatureDotsBulge' },
  radial: { input: entry('feature-radial'), fileBase: 'feature-radial', globalName: 'FeatureRadial' },
  cards: { input: entry('feature-cards'), fileBase: 'feature-cards', globalName: 'FeatureCards' },
  deposits: { input: entry('feature-deposits'), fileBase: 'feature-deposits', globalName: 'FeatureDeposits' },
  orbit: { input: entry('feature-orbit'), fileBase: 'feature-orbit', globalName: 'FeatureOrbit' },
  'small-cards': { input: entry('feature-small-cards'), fileBase: 'feature-small-cards', globalName: 'FeatureSmallCards' },
  'window-graphic': {
    input: entry('feature-window-graphic'),
    fileBase: 'feature-window-graphic',
    globalName: 'FeatureWindowGraphic'
  }
};

const singleKey = process.env.SINGLE_ENTRY;
const singleTarget = singleKey && SINGLE_ENTRIES[singleKey];
const isSingleBuild = Boolean(singleTarget);

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

const singleOutput = (fileBase) => ({
  assetFileNames: (assetInfo) => {
    const originalName = assetInfo?.name ?? 'asset';
    const ext = path.extname(originalName);
    if (ext === '.css') {
      return `${fileBase}.css`;
    }
    const base = path.basename(originalName, ext) || 'asset';
    return `assets/${base}.[hash]${ext}`;
  }
});

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    inlineDynamicImports: isSingleBuild,
    lib: isSingleBuild
      ? {
          entry: singleTarget.input,
          name: singleTarget.globalName,
          fileName: () => singleTarget.fileBase,
          formats: ['iife']
        }
      : undefined,
    rollupOptions: isSingleBuild
      ? {
          output: {
            format: 'iife',
            inlineDynamicImports: true,
            entryFileNames: `${singleTarget.fileBase}.js`,
            ...singleOutput(singleTarget.fileBase)
          }
        }
      : {
          input: {
            'page-all': entry('page-all'),
            'page-all-lite': entry('page-all-lite'),
            'feature-hero': entry('feature-hero'),
            'feature-api': entry('feature-api'),
            'feature-chart': entry('feature-chart'),
            'feature-dots': entry('feature-dots'),
            'feature-dots-bulge': entry('feature-dots-bulge'),
            'feature-radial': entry('feature-radial'),
            'feature-cards': entry('feature-cards'),
            'feature-deposits': entry('feature-deposits'),
            'feature-orbit': entry('feature-orbit'),
            'feature-small-cards': entry('feature-small-cards'),
            'feature-window-graphic': entry('feature-window-graphic')
          },
          output: sharedOutput
        }
  }
});
