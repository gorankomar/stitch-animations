// Use a commit-pinned CDN base for releases; /dist supports local previews.
export function moduleScript(entry) {
  const base = (process.env.STITCH_ASSET_BASE || '/dist').replace(/\/$/, '');
  return `<script type="module" src="${base}/${entry}.js"></script>`;
}
