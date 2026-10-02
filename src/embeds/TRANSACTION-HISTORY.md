# Transaction history

Figma frame: `PCbd0DyXWAD2cDANtl7bpH`, node `286:1308`.

On the Animations Playground, the new graphic is beside Embedded Connectivity.
It reuses **Window Graphics → Report Graphic**, with its new **Transaction history**
variant and existing visibility-aware sequential reveal controller. No separate
animation runtime is needed.

## Editing in Webflow

- Report Graphic: edit Title; select Transaction history; keep Background Grid and
  Bottom Fade enabled and Action Visibility disabled to match the frame.
- Filters slot: **Transaction Status Labels** exposes Completed label and Pending
  label. These are decorative illustration labels, not functional filter controls.
- Content slot: **Transaction Heading** exposes Date and Total, followed by six
  **Transaction Row** instances matching Figma.
- Each Transaction Row exposes Name, Type, Amount, and Incoming/Outgoing variants
  (green/gray amounts). Duplicate or insert Transaction Row components into the
  Content slot, then reorder them there. Row order sets reveal order automatically;
  the count is not hardcoded. Rows reveal 180ms apart. The Total text is editable,
  not automatically calculated, preserving the source frame's “10 total”.

The fixed 540:402 illustration crops extra content at the bottom, as in Figma.
Designer and script-free output show all content in its static layout. Reduced
motion is handled by the existing Report Graphic controller.

## Source and build

- `transaction-history-native.css`: native component class styles.
- `transaction-history-variant.json`: overrides on the existing Report Graphic.
- `transaction-history.css`: scoped background asset and final-divider rules.
- `assets/transaction-history/`: original Figma dots and divider, optimized with SVGO.
- `dist/embeds/transaction-history-styles.html`: script-free style embed in
  Transaction Status Labels; regenerate with `node scripts/build-transaction-embed.mjs`
  or the normal full build.

IDs:
- Report variant: `3c3669cc-6f12-041c-0f1a-9ad8d7a7bf3c`
- Report instance: `18bfe4c9-8916-4621-8360-67448ebca501`
- Transaction Row: `0da8d879-6afe-1f87-133d-87d16a1082dd`
- Transaction Heading: `2717cacc-2eb1-5e17-19f6-201824b13205`
- Transaction Status Labels: `b1170086-1a58-4e6f-76f7-a3f63e62b1de`
