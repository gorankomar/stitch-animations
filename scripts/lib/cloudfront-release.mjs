import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export function releaseId(value) {
  if (!/^[a-f0-9]{40}$/.test(value || '')) throw new Error('Release must be a full lowercase Git commit SHA.');
  return value;
}
export function channelName(value) {
  if (!['staging', 'production'].includes(value)) throw new Error('Channel must be staging or production.');
  return value;
}
export function filePath(value) {
  if (typeof value !== 'string' || !value || value.startsWith('/') || value.includes('\\') || value.split('/').some(s => !s || s === '.' || s === '..')) throw new Error(`Unsafe release path: ${value}`);
  return value;
}
export function loaderSource(release) {
  return `// Stitch release ${releaseId(release)}\nimport '../../releases/${release}/page-all-lite.js';\n`;
}
export async function makeManifest(directory, release) {
  const files = [];
  async function walk(relative = '') {
    for (const item of await readdir(path.join(directory, relative), { withFileTypes: true })) {
      const name = relative ? `${relative}/${item.name}` : item.name;
      if (item.isDirectory()) await walk(name);
      else if (item.isFile()) {
        if (name === 'release.json') continue;
        const bytes = await readFile(path.join(directory, name));
        files.push({ path: filePath(name), bytes: bytes.length, sha256: sha256(bytes) });
      } else throw new Error(`Unsupported release entry: ${name}`);
    }
  }
  await walk();
  return validateManifest({ schema: 1, release: releaseId(release), files: files.sort((a, b) => a.path.localeCompare(b.path)) });
}
export function validateManifest(manifest, expectedRelease) {
  if (manifest?.schema !== 1 || !Array.isArray(manifest.files) || !manifest.files.length) throw new Error('Invalid release manifest.');
  releaseId(manifest.release);
  if (expectedRelease && manifest.release !== releaseId(expectedRelease)) throw new Error('Release manifest SHA mismatch.');
  const seen = new Set();
  for (const file of manifest.files) {
    filePath(file.path);
    if (file.path === 'release.json' || seen.has(file.path) || !Number.isSafeInteger(file.bytes) || file.bytes < 0 || !/^[a-f0-9]{64}$/.test(file.sha256 || '')) throw new Error('Invalid manifest file record.');
    seen.add(file.path);
  }
  if (!seen.has('page-all-lite.js')) throw new Error('Release is missing page-all-lite.js.');
  return manifest;
}
export function cdnBase(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.search || url.hash || url.username || url.password) throw new Error('CDN base must be an HTTPS directory URL.');
  return `${url.href.replace(/\/$/, '')}/`;
}
export function assetUrl(base, relative) {
  return new URL(filePath(relative).split('/').map(encodeURIComponent).join('/'), cdnBase(base)).href;
}
export async function verifyRelease(manifest, base, origins, fetcher = fetch) {
  validateManifest(manifest);
  if (!origins.length) throw new Error('At least one verification origin is required.');
  const jobs = origins.flatMap(origin => manifest.files.map(file => ({ origin, file })));
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(8, jobs.length) }, async () => {
    while (cursor < jobs.length) {
      const { origin, file } = jobs[cursor++];
      const response = await fetcher(assetUrl(base, `releases/${manifest.release}/${file.path}`), { headers: { Origin: origin }, signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`${file.path}: HTTP ${response.status}`);
      const cors = response.headers.get('access-control-allow-origin');
      if (cors !== '*' && cors !== origin) throw new Error(`${file.path}: CORS missing for ${origin}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length !== file.bytes || sha256(bytes) !== file.sha256) throw new Error(`${file.path}: CDN bytes differ from release.`);
      const type = response.headers.get('content-type') || '';
      if (file.path.endsWith('.js') && !/(?:java|ecma)script/i.test(type)) throw new Error(`${file.path}: invalid JavaScript MIME type.`);
      if (file.path.endsWith('.css') && !type.includes('text/css')) throw new Error(`${file.path}: invalid CSS MIME type.`);
    }
  }));
  return `${manifest.files.length} release files verified for ${origins.length} origins.`;
}
