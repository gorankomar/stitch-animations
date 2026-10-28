# Stitch Animations: Next Steps

This is the working roadmap for repository cleanup, documentation and fallback quality, site performance, component flexibility, and the next shared interaction work. Start with audits so implementation is based on current repository and site behavior. No delivery dates are set.

## 1. Classify Root-Level Pages and Clean Up

- The automated JavaScript tests are already in `tests/` (34 test files at the time this roadmap was created).
- Review root-level HTML files that appear to be test or preview pages. Classify each as a local preview entry point, a test fixture, or an obsolete file before moving or removing anything.
- Move only confirmed test-only fixtures into an appropriate test location, and update any references. Keep Vite preview entry points available at their current routes unless their configuration is deliberately updated.
- Acceptance: automated tests and intended local preview routes still resolve after any cleanup.

## 2. Audit Documentation and Animation Fallbacks

- Review project documentation for missing, stale, duplicated, or conflicting guidance. Update the relevant source-of-truth docs and indexes so component behavior and workflows are discoverable.
- Audit animations and illustrations for text baked into raster images. Keep translatable text as live HTML and use SVG for scalable vector artwork where appropriate. The sole exception is a full platform screenshot: keep it as a static image and provide localized image variants when its text changes by language. Record any cases that do not follow this rule and plan conversions where needed.
- Check text-bearing illustrations for fixed widths or heights based only on English copy. Make text areas fluid and verify that longer translations fit without clipping or breaking the composition.
- Inventory animations and identify the four or five known to lack adequate fallbacks. Record the affected animation, its current fallback, and the needed repair before implementation.
- For each repair, verify that static content remains visible when JavaScript is unavailable or setup fails, reduced motion keeps a usable static presentation, and teardown or repeated initialization does not leave stale animated state.
- Acceptance: each audited animation has an accurate component note and a verified fallback contract; translatable content remains live HTML except localized full-platform screenshots, and text-bearing components accommodate longer supported translations; unresolved gaps remain explicitly tracked.

## 3. Investigate Site Dependencies and Scope a Smaller Slider

- Locate every current Swiper use on the site and record the behavior each instance depends on, including navigation, pagination, looping, responsive behavior, touch/drag, and autoplay where present.
- Identify where Finsweet Attributes is loaded and used, then document which site behavior depends on it. Do not remove or replace it until those dependencies are understood.
- Define a minimal custom slider around the current Swiper use cases. Avoid adding speculative features. Place it in the shared animation library using the established source structure and shared release registration.
- Preserve semantic controls and keyboard access, provide a usable static fallback, and define lifecycle/cleanup behavior. Add focused behavior coverage and compare the built shared output against the current dependency cost.
- Acceptance: every in-scope current slider use works with the custom implementation across supported screen sizes, motion preferences, and input methods; bundle changes and any remaining external dependency are documented.

## 4. Improve Component Flexibility

- Inventory components whose markup, configuration, or behavior is too rigid for current Webflow use cases.
- Rank candidate improvements by practical reuse and authoring value. Record the current constraint, the intended variation, and its markup/prop contract in component notes before changing that contract.
- Preserve established component internals and appearance; use supported variants, props, or outer layout and motion wrappers.
- Acceptance: selected variations are documented, usable in the intended Webflow context, and covered by focused behavior checks without breaking existing component use.

## 5. Optimize Site Assets and Delivery

- Establish a baseline for page weight and loading behavior, then inventory the assets and page templates with the largest costs.
- Audit fonts: identify loaded families, weights, styles, formats, and pages that use them. Reduce unnecessary variants, use efficient self-hosted formats and loading behavior where appropriate, and verify typography remains correct across supported languages and breakpoints.
- Audit Open Graph and social-share images: verify every relevant page has the intended image and metadata, then optimize image dimensions, format, and file size while checking the actual share preview and crop.
- Audit images across the site for oversized or duplicated assets, missing responsive sizing, and inefficient delivery. Preserve visual quality and aspect ratio; for raster illustrations, retain a PNG master and prepare an optimized WebP sized for the largest rendered dimensions at 2× by default. Keep vectors as vectors.
- Prioritize fixes by measured impact and check the affected pages visually on desktop and mobile after changes.
- Acceptance: the largest avoidable asset costs are reduced, page typography and imagery remain correct, social previews render as intended, and before/after measurements are recorded.

## 6. Experiment with Navigation Icons

- Create a dedicated local-only preview page to compare navigation icon motion treatments in context.
- Compare a small set of effects against agreed visual criteria, including clarity, consistency with the site, and behavior on desktop and mobile. Keep this work local while exploring.
- After a direction is selected, implement and document the chosen treatment with a static fallback and reduced-motion behavior.
- Acceptance: the selected treatment is reviewed in the local preview, its fallback remains usable, and the Animations Playground remains an unpublished draft.

## Verification and Release Notes

- Run relevant behavior tests for code changes, including JavaScript/setup failure, reduced motion, repeated initialization and cleanup, and responsive layouts where applicable.
- For shared animation releases, follow the current shared-release workflow, run full release validation, and verify affected interactions in staging before any further release step.
- Keep icon experiments local until a direction is selected. Do not publish the Animations Playground.

## Assumptions

- Root-level HTML files are not treated as tests solely because they look like test pages; classify them before moving anything.
- The custom slider targets current site use cases rather than a general-purpose feature set.
- Finsweet Attributes is an investigation item; removal requires evidence that its behavior is unnecessary or replaced.
- Site asset optimization starts with a measured inventory; visual quality and correct page/social previews must be preserved.
- The navigation icon comparison page is local-only during exploration.
- No delivery dates or production publication are implied by this roadmap.
