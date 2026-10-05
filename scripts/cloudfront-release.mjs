import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { releaseId, channelName, loaderSource, makeManifest, validateManifest, cdnBase, assetUrl, verifyRelease, filePath } from './lib/cloudfront-release.mjs';

const [command, releaseArg, channelArg] = process.argv.slice(2);
const aws = args => execFileSync('aws', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const required = name => { const value = process.env[name]; if (!value) throw new Error(`Missing ${name}`); return value; };
let temporary;
let changedChannel;
try {
  const release = releaseId(releaseArg);
  if (!['prepare', 'upload', 'activate', 'verify'].includes(command)) throw new Error('Usage: cloudfront-release.mjs prepare|upload|activate|verify FULL_SHA [staging|production]');
  if (command === 'prepare') {
    const manifest = await makeManifest('dist', release);
    await writeFile('dist/release.json', `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`Prepared ${manifest.files.length} files for ${release}`);
  } else {
    const base = cdnBase(required('STITCH_CDN_BASE'));
    const origins = required('STITCH_VERIFY_ORIGINS').split(',').map(s => new URL(s.trim()).origin);
    let manifest;
    if (command === 'upload') {
      const bucket = required('STITCH_S3_BUCKET');
      const prefix = filePath(required('STITCH_S3_PREFIX').replace(/\/$/, ''));
      const key = `${prefix}/releases/${release}/release.json`;
      manifest = validateManifest(JSON.parse(await readFile('dist/release.json', 'utf8')), release);
      const local = await makeManifest('dist', release);
      if (JSON.stringify(local) !== JSON.stringify(manifest)) throw new Error('Dist changed after manifest preparation.');
      // A completed release is never overwritten. Unexpected AWS errors fail closed.
      let existing;
      try { existing = aws(['s3', 'cp', `s3://${bucket}/${key}`, '-']); }
      catch (error) { if (!/NoSuchKey|\(404\)|Not Found|does not exist/.test(String(error.stderr))) throw error; }
      if (existing) {
        if (JSON.stringify(validateManifest(JSON.parse(existing), release)) !== JSON.stringify(manifest)) throw new Error('Immutable release already exists with different content.');
      } else {
        // Upload dependencies first, entry second, completion manifest last. Never --delete.
        aws(['s3', 'sync', 'dist/', `s3://${bucket}/${prefix}/releases/${release}/`, '--exclude', 'release.json', '--exclude', 'page-all-lite.js', '--cache-control', 'public,max-age=31536000,immutable']);
        aws(['s3', 'cp', 'dist/page-all-lite.js', `s3://${bucket}/${prefix}/releases/${release}/page-all-lite.js`, '--content-type', 'text/javascript', '--cache-control', 'public,max-age=31536000,immutable']);
        aws(['s3', 'cp', 'dist/release.json', `s3://${bucket}/${key}`, '--content-type', 'application/json', '--cache-control', 'public,max-age=31536000,immutable']);
      }
    } else {
      const response = await fetch(assetUrl(base, `releases/${release}/release.json`), { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
      manifest = validateManifest(await response.json(), release);
    }
    console.log(await verifyRelease(manifest, base, origins));
    if (command === 'activate') {
      const channel = channelName(channelArg);
      const bucket = required('STITCH_S3_BUCKET');
      const prefix = filePath(required('STITCH_S3_PREFIX').replace(/\/$/, ''));
      const distribution = required('STITCH_CLOUDFRONT_DISTRIBUTION_ID');
      const key = `${prefix}/channels/${channel}/page-all-lite.js`;
      const invalidationPath = `${new URL(base).pathname.replace(/\/$/, '')}/channels/${channel}/page-all-lite.js`;
      if (channel === 'production' && process.env.STITCH_ROLLBACK !== 'true') {
        const staging = await fetch(assetUrl(base, 'channels/staging/page-all-lite.js'), { signal: AbortSignal.timeout(30000) });
        if (!staging.ok || await staging.text() !== loaderSource(release)) throw new Error('Production promotion requires this exact release to be active on staging.');
      }
      // Check distribution read access before changing the channel pointer.
      // CreateInvalidation permission must also be provisioned by the admin.
      aws(['cloudfront', 'get-distribution', '--id', distribution]);
      temporary = await mkdtemp(path.join(tmpdir(), 'stitch-channel-'));
      const filename = path.join(temporary, 'page-all-lite.js');
      const content = loaderSource(release);
      await writeFile(filename, content);
      const previous = await fetch(assetUrl(base, `channels/${channel}/page-all-lite.js`), { signal: AbortSignal.timeout(30000) });
      if (previous.ok) {
        const oldContent = await previous.text();
        const match = oldContent.match(/^\/\/ Stitch release ([a-f0-9]{40})\n/);
        if (!match || oldContent !== loaderSource(match[1])) throw new Error('Existing channel is not a recognized Stitch release loader.');
        if (oldContent !== content) {
          const oldFile = path.join(temporary, 'previous.js');
          await writeFile(oldFile, oldContent);
          aws(['s3', 'cp', oldFile, `s3://${bucket}/${prefix}/channel-history/${channel}/${Date.now()}-${match[1]}.js`, '--content-type', 'text/javascript', '--cache-control', 'public,max-age=31536000,immutable']);
          console.log(`Previous ${channel} release: ${match[1]}`);
        }
      } else if (previous.status !== 404) throw new Error(`Existing channel HTTP ${previous.status}`);
      changedChannel = channel;
      aws(['s3', 'cp', filename, `s3://${bucket}/${key}`, '--content-type', 'text/javascript', '--cache-control', 'no-cache,max-age=0,must-revalidate']);
      const result = JSON.parse(aws(['cloudfront', 'create-invalidation', '--distribution-id', distribution, '--paths', invalidationPath]));
      aws(['cloudfront', 'wait', 'invalidation-completed', '--distribution-id', distribution, '--id', result.Invalidation.Id]);
      for (const origin of origins) {
        const response = await fetch(assetUrl(base, `channels/${channel}/page-all-lite.js`), { headers: { Origin: origin }, signal: AbortSignal.timeout(30000) });
        const cors = response.headers.get('access-control-allow-origin');
        if (!response.ok || (cors !== '*' && cors !== origin) || !/(?:java|ecma)script/i.test(response.headers.get('content-type') || '') || !/no-cache/.test(response.headers.get('cache-control') || '') || await response.text() !== content) throw new Error(`Channel ${channel} failed served verification for ${origin}; pointer may have changed. Restore the previous verified release.`);
      }
      console.log(`Activated ${channel}: ${release}; invalidation completed and served loader verified.`);
    }
  }
} catch (error) {
  console.error(error.message);
  if (changedChannel) console.error(`The ${changedChannel} pointer may have changed. Restore its previous verified SHA using the rollback workflow and verify served content.`);
  process.exitCode = 1;
}
finally { if (temporary) await rm(temporary, { recursive: true, force: true }); }
