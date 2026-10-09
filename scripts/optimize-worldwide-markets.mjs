import fs from 'node:fs/promises';
const { optimize } = await import(process.env.SVGO_MODULE || 'svgo');
const dir = 'src/embeds/assets/worldwide-markets';
const config = { multipass: true, floatPrecision: 2, plugins: [
  'removeDoctype', 'removeXMLProcInst', 'removeComments', 'removeMetadata', 'removeEditorsNSData',
  'cleanupAttrs', 'mergeStyles', 'inlineStyles', 'minifyStyles', 'convertStyleToAttrs',
  'cleanupIds', 'removeUselessDefs', 'cleanupNumericValues', 'cleanupListOfValues', 'convertColors',
  'removeUnknownsAndDefaults', 'removeNonInheritableGroupAttrs', 'removeUselessStrokeAndFill',
  'cleanupEnableBackground', 'removeHiddenElems', 'removeEmptyText', 'convertShapeToPath',
  'convertEllipseToCircle', 'moveElemsAttrsToGroup', 'moveGroupAttrsToElems', 'collapseGroups',
  { name: 'convertPathData', params: { floatPrecision: 2, transformPrecision: 8 } },
  { name: 'convertTransform', params: { floatPrecision: 2, transformPrecision: 8 } },
  'removeEmptyAttrs', 'removeEmptyContainers', 'mergePaths', 'removeUnusedNS', 'sortAttrs',
  'sortDefsChildren', 'removeTitle', 'removeDesc'
] };
const source = await fs.readFile(`${dir}/originals/map.svg`, 'utf8');
const result = optimize(source, config).data;
await fs.writeFile(`${dir}/map.svg`, result + '\n');
await fs.writeFile(`${dir}/optimization.json`, JSON.stringify({ version: '4.1.0', config,
  exceptions: ['Keep xmlns, viewBox and root dimensions. Static geometry may merge; motion uses the whole image as an alpha mask.'],
  originalBytes: Buffer.byteLength(source), optimizedBytes: Buffer.byteLength(result)
}, null, 2) + '\n');
console.log(`${Buffer.byteLength(source)} → ${Buffer.byteLength(result)} bytes`);
