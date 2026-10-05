import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { releaseId, channelName, loaderSource, makeManifest, validateManifest, verifyRelease, sha256, assetUrl } from '../scripts/lib/cloudfront-release.mjs';
const release = 'a'.repeat(40);

test('loader resolves every release dependency inside an immutable directory', () => {
  const base = 'https://example.com/Stitch+Animations/';
  for (const channel of ['staging', 'production']) {
    const loader = assetUrl(base, `channels/${channel}/page-all-lite.js`);
    const imported = loaderSource(release).match(/import '([^']+)'/)[1];
    assert.equal(new URL(imported, loader).href, `${base}releases/${release}/page-all-lite.js`);
  }
  assert.throws(() => releaseId('main'));
  assert.throws(() => channelName('prod'));
  assert.throws(() => assetUrl(base, '../outside.js'));
});

test('manifest covers hidden dependencies and can be regenerated without including itself', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'stitch-release-test-'));
  try {
    await writeFile(path.join(dir, 'page-all-lite.js'), 'import "./feature.js";');
    await writeFile(path.join(dir, '.hidden'), 'asset');
    const manifest = await makeManifest(dir, release);
    await writeFile(path.join(dir, 'release.json'), JSON.stringify(manifest));
    assert.deepEqual(await makeManifest(dir, release), manifest);
    assert.equal(manifest.files.length, 2);
    assert.throws(() => validateManifest({ ...manifest, files: [...manifest.files, manifest.files[0]] }));
    assert.throws(() => validateManifest(manifest, 'b'.repeat(40)));
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('CDN verification rejects stale bytes, missing files, MIME errors and origin-specific CORS failures', async () => {
  const bytes = Buffer.from('export {};');
  const manifest = { schema: 1, release, files: [{ path: 'page-all-lite.js', bytes: bytes.length, sha256: sha256(bytes) }] };
  const response = (body, status = 200, cors = '*', type = 'text/javascript') => new Response(body, { status, headers: { 'access-control-allow-origin': cors, 'content-type': type } });
  const origins = ['https://staging.example', 'https://production.example'];
  await verifyRelease(manifest, 'https://cdn.example/', origins, async () => response(bytes));
  await assert.rejects(verifyRelease(manifest, 'https://cdn.example/', origins, async () => response('old')), /bytes differ/);
  await assert.rejects(verifyRelease(manifest, 'https://cdn.example/', origins, async () => response('missing', 404)), /HTTP 404/);
  await assert.rejects(verifyRelease(manifest, 'https://cdn.example/', origins, async () => response(bytes, 200, origins[0])), /CORS missing/);
  await assert.rejects(verifyRelease(manifest, 'https://cdn.example/', origins, async () => response(bytes, 200, '*', 'text/html')), /MIME/);
});

// Exercise the real CLI with a fake AWS executable and read-only HTTP fixtures.
// This verifies mutation ordering and the production guard without contacting AWS.
test('activation verifies dependencies before writing and waits for invalidation', async () => {
  const { execFileSync } = await import('node:child_process');
  const { chmod, readFile } = await import('node:fs/promises');
  const dir = await mkdtemp(path.join(tmpdir(), 'stitch-activation-test-'));
  const cli = path.resolve('scripts/cloudfront-release.mjs');
  const bytes = 'export {};';
  const manifest = { schema: 1, release, files: [{ path: 'page-all-lite.js', bytes: bytes.length, sha256: sha256(bytes) }] };
  try {
    const log = path.join(dir, 'calls.jsonl');
    const awsFile = path.join(dir, 'aws');
    await writeFile(awsFile, `#!${process.execPath}\nconst fs=require('node:fs');const args=process.argv.slice(2);fs.appendFileSync(process.env.MOCK_LOG,JSON.stringify(args)+'\\n');console.log(JSON.stringify({Invalidation:{Id:'mock'}}));\n`);
    await chmod(awsFile, 0o755);
    const preload = path.join(dir, 'http.mjs');
    await writeFile(preload, `const manifest=${JSON.stringify(manifest)};const expected=${JSON.stringify(loaderSource(release))};globalThis.fetch=async url=>{const value=String(url);const headers={'access-control-allow-origin':'*','content-type':'text/javascript','cache-control':'no-cache,max-age=0,must-revalidate'};if(value.endsWith('release.json'))return new Response(JSON.stringify(manifest),{headers});if(value.includes('/releases/'))return new Response(process.env.MOCK_STALE?'old':${JSON.stringify(bytes)},{headers});if(value.includes('/channels/staging/')&&process.env.MOCK_UNSTAGED)return new Response('old',{headers});return new Response(expected,{headers});};`);
    const env = { ...process.env, PATH: `${dir}:${process.env.PATH}`, MOCK_LOG: log, STITCH_CDN_BASE: 'https://cdn.example/Stitch+Animations/', STITCH_S3_BUCKET: 'test-bucket', STITCH_S3_PREFIX: 'Stitch Animations', STITCH_CLOUDFRONT_DISTRIBUTION_ID: 'test-dist', STITCH_VERIFY_ORIGINS: 'https://staging.example', STITCH_ROLLBACK: 'false' };
    const run = extra => execFileSync(process.execPath, ['--import', preload, cli, 'activate', release, 'production'], { env: { ...env, ...extra }, encoding: 'utf8', stdio: 'pipe' });
    assert.throws(() => run({ MOCK_STALE: 'true' }), /bytes differ/);
    assert.throws(() => run({ MOCK_UNSTAGED: 'true' }), /requires this exact release/);
    await assert.rejects(readFile(log), /ENOENT/);
    assert.match(run({}), /Activated production/);
    const calls = (await readFile(log, 'utf8')).trim().split('\n').map(s => JSON.parse(s));
    assert.deepEqual(calls.map(a => a.slice(0, 2)), [['cloudfront', 'get-distribution'], ['s3', 'cp'], ['cloudfront', 'create-invalidation'], ['cloudfront', 'wait']]);
    assert(calls[1].includes('no-cache,max-age=0,must-revalidate'));
    assert.equal(calls[2].at(-1), '/Stitch+Animations/channels/production/page-all-lite.js');
    await writeFile(log, '');
    assert.match(run({ MOCK_UNSTAGED: 'true', STITCH_ROLLBACK: 'true' }), /Activated production/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
