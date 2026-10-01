# Stitch Animations

Vite animation playground with reusable effects, shared loaders, and Webflow component embeds.

## Start and validate

```sh
npm install
npm run dev
npm test
npm run validate:release
```

Open http://localhost:5173/ for the playground. Component preview routes are in the component index. validate:release runs the full build, tests, and the shared-release checker. Builds regenerate dist and some preview HTML; use an isolated checkout when preserving other chats' work.

## Find the right guide

- [Short prompts and handoffs](docs/prompt-guide.md)
- [Component index](docs/components/index.md) and [component note template](docs/components/TEMPLATE.md)
- [Effect catalog](docs/effects/index.md)
- [Figma to animation](docs/workflows/figma-to-animation.md) and [SVG handling](docs/workflows/svg-handling.md)
- [Animation changes](docs/workflows/animation-changes.md)
- [Webflow integration](docs/workflows/webflow-integration.md) and [shared release](docs/workflows/shared-release.md)
- [Detailed markup and animation recipes](docs/animation-recipes.md), [connector guide](docs/connector-animations.md), [code scroll API](docs/code-scroll.md)
- [Release records](docs/releases/README.md) and [future work](docs/future-builds.md)

## Structure and builds

src/lib/effects contains reusable behavior; src/animations contains animation modules; src/embeds contains component code/assets; src/entry contains loaders. legacy is read-only reference. dist is generated output currently tracked for CDN use.

npm run build:all builds all shared entries and embeds. npm run build:<name>:single builds supported standalone animations; it does not validate a shared release. See package.json for supported names. npm run preview serves the production build.

The page-all-lite loader discovers matching sections and loads their modules; page-all initializes eagerly. Use full commit-pinned URLs for production. The main-branch GitHub workflow currently uploads to a mutable S3 prefix; follow the release guide before changing Webflow loaders.
