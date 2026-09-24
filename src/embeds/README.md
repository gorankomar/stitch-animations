# Report Graphic Webflow component

The native Webflow component lives under **Window Graphics → Report Graphic**.
Two examples are on the draft **Animations Playground** page, below Access.

- Variants: Centered (Audit log) and Right aligned (Operational report).
- Properties: Title, Action Visibility, Background Grid Visibility, Bottom Fade Visibility.
- Slots: Filters, Action, Content.
- Report Filter: Label, Down Arrow Visibility, Icon slot.
- Report Action: Label, Icon Visibility, Icon slot.
- Content components: Audit Table and Report Timeline; all content is native HTML.
- New icons live under Icons and expose Stroke Width, default 1.6.

The animation embed reuses `createRevealController` from the existing Window Graphic
animation. Groups reveal their members in sequence; ordinary reveal elements follow
one another. It initializes each instance once, waits for 25% visibility, honors
reduced motion, and handles execution both before and after DOMContentLoaded.
The component carries its own embed and does not depend on Playground page code.
`data-report-graphic` deliberately avoids duplicate initialization by the site's
`[data-anim]` automatic reveal loader.

To regenerate the code for the component's hidden HTML Embed:

```sh
node scripts/build-report-embed.mjs
```

Copy `dist/embeds/report-graphic.html` into that embed. Native layout/styles remain
editable in Webflow; the CSS here only provides the background grid, reveal states,
and portrait backgrounds. Run this command after a full Vite build, which clears dist.

Verified in Webflow Preview on desktop and 393px mobile: all 19 Audit and 18 Timeline
reveal elements complete, portraits load, variants align correctly, no page overflow,
and grid/fade/action controls independently remove their elements. Changes remain
unpublished; no production or staging publish was performed.

Audit dates refresh at page initialization and when the report first enters view,
using the visitor's local time minus 15, 30, and 60 minutes. Each date cell carries
`data-audit-minutes-ago`, so offsets can be adjusted without changing the script.

`report-filter.css` is stored in a hidden style embed inside Report Filter itself.
It increases right padding from 1.396cqi to 2.094cqi when its arrow is absent.

# Change Due Date

Native Webflow component: **Animations → Change Due Date**, at the bottom of the
 draft **Animations Playground**. The gray code panel and white card are separate
 HTML layers. **Window Graphics → Due Date Field** is used twice; edit its Label,
 Days from today (`-7` / `0`), Date override (blank for automatic), and Chevron.
 Dates use local calendar arithmetic and refresh every 30 seconds and on visibility
 changes. These are illustration fields, not a submitted form.

36 code lines (16 Figma + 20 added) type while upward scrolling starts immediately.
The duplicate track wraps continuously; only the card follows a fine pointer, up
 to 1.2% of the illustration width. Motion pauses offscreen/in background tabs and
 respects reduced motion. The shared Vite code-scroll module supplies the typing/scroll behavior.

Build the library and embeds with `npm run build:all`. This writes the portable
 CSS/script embed to `dist/embeds/due-date-graphic.html` and the local preview to
 `due-date.html`. Native source markup and CSS are adjacent to this document.
 Figma chevrons are retained in `assets/` and hosted in the Webflow asset library.

Verified in Webflow Preview: current/local dates and offsets, both original assets,
 72 rows including loop copies, upward motion, and card-only pointer movement.
 Changes are saved as a draft and have not been published.

Financial and due-date embeds now load their compiled ES modules and share one
code-scroll effect. See `docs/code-scroll.md` for commit-pinned Webflow release
instructions. The old inline typing/scroll implementations are no longer bundled
into these embeds.
