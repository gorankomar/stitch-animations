# Workflow validation

Checked 2026-10-01. This records documentation/build validation, not a deployment.

- Figma illustration: root instructions route to Figma procedure, SVG procedure, effect catalog, animation procedure, and local verification. No Figma fetch required to validate routing.
- Existing-effect adjustment: component index identifies source notes; catalog resolves Reveal, Card Hover, and Pointer Follow; change procedure defines composition and verification.
- Shared release: root instructions route to release procedure and validate:release; Webflow procedure supplies stage/domain boundaries and release record format.
- Local Markdown link targets resolve.
- Full validation in a temporary project copy: build succeeded, 26 tests passed, both emitted loader dependency graphs passed the shared-release checker. Includes negative tests for detached features, missing wallet source, module/CSS/asset dependencies, and manifest CSS.

No visual animation behavior was changed or Webflow site published. Routing was reviewed from the documents, not tested through separate fresh chats.
