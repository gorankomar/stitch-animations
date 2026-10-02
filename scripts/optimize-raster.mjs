import { readFile, stat, open, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const usage = 'Usage: node scripts/optimize-raster.mjs input.png output.webp --profile large|standard|tiny|lossless [--width pixels] [--quality 0-100]';

async function main() {
  const [source, destination, ...args] = process.argv.slice(2);
  if (!source || !destination || args.length % 2) throw new Error(usage);
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--profile', '--width', '--quality'].includes(args[i]) || args[i] in options) throw new Error(usage);
    options[args[i]] = args[i + 1];
  }
  const profile = options['--profile'];
  const defaults = { large: 90, standard: 80, tiny: 65, lossless: null };
  if (!Object.hasOwn(defaults, profile)) throw new Error(usage);
  const input = resolve(source);
  const output = resolve(destination);
  if (!/\.webp$/i.test(output) || input === output) throw new Error('Use a distinct .webp output path.');
  // Opening with wx reserves the output without overwriting any existing asset.
  const png = await readFile(input);
  if (png.length < 24 || png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || png.toString('ascii', 12, 16) !== 'IHDR') throw new Error('Input must be a PNG master.');
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const target = options['--width'] === undefined ? width : Number(options['--width']);
  if (!Number.isInteger(target) || target < 1 || target > width) throw new Error('Width must be a positive integer no larger than the PNG width.');
  const quality = options['--quality'] === undefined ? defaults[profile] : Number(options['--quality']);
  if (profile === 'lossless' && options['--quality'] !== undefined) throw new Error('Omit --quality for lossless.');
  if (profile !== 'lossless' && (!Number.isFinite(quality) || quality < 0 || quality > 100)) throw new Error('Quality must be between 0 and 100.');
  const version = spawnSync('cwebp', ['-version'], { encoding: 'utf8' });
  if (version.error || version.status !== 0) throw new Error('cwebp is required on PATH (macOS: brew install webp).');
  const flags = profile === 'lossless' ? ['-lossless', '-q', '100', '-m', '6', '-exact'] : ['-q', String(quality), '-m', '6', '-sharp_yuv', '-alpha_q', '100'];
  flags.push('-metadata', 'icc');
  if (target !== width) flags.push('-resize', String(target), '0');
  const reserved = await open(output, 'wx');
  await reserved.close();
  try {
    const result = spawnSync('cwebp', [...flags, input, '-o', output], { encoding: 'utf8' });
    if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr || 'Encoding failed.');
    const bytes = (await stat(output)).size;
    console.log(JSON.stringify({ input, output, encoder: `cwebp ${version.stdout.trim()}`, profile, quality, sourceDimensions: [width, height], outputDimensions: [target, Math.max(1, Math.round(height * target / width))], sourceBytes: png.length, outputBytes: bytes, flags, visualVerification: 'Required before delivery' }, null, 2));
  } catch (error) {
    await rm(output, { force: true });
    throw error;
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
