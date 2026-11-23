# Content Article

Use one `article.content-article` within the main landmark. The Blogs, Presses, and Partnerships templates use the same native article layout. Its title, date, author, cover and rich text retain their existing CMS bindings. The related blogs section is a sibling of the article. The former header and content containers are hidden on each template. The old Finsweet imports remain commented in the template head.

Native Webflow classes own the layout, typography, responsive breakpoints and the rich-text flex gap. H2–H6, images, and figure captions use native nested Webflow selectors on `content-article-rich-text`. Images use a 0.5rem radius. Captions use a 0.875rem font size and logical `text-align: start` for LTR and RTL. The nested All Block Quotes selector matches the Quote component’s text and container styling, including its responsive font size. Its native 1.5rem row gap applies to each top-level block, including images and embedded components. The footer retains contextual spacing exceptions for H2s and lists that follow text. One instance of the native **Content Article Styles and Interactions** component sits at the end of each template. Its hidden Code Embed holds the CSS from `src/embeds/content-article/template.css` above the script from `template.js`. Edit the component definition to update all instances. The duplicate article blocks were removed from Page Settings. The script observes rich-text changes because Webflow Preview may hydrate the CMS field after initialization. The scoped styles are visible in Preview with custom code enabled.

The desktop sidebar builds its links from the introduction anchor and each nonempty H2 in the CMS body. The TOC is hidden when the body contains no nonempty H2s. Existing heading IDs are preserved. The progress rail advances to the bottom of the active link row when the active section changes, including rows with wrapped labels, using the site's primary motion easing and default duration. At 991px and below, the same navigation becomes an in-flow disclosure between the cover image and body. The button shows “Jump to” and the last explicitly selected heading on one line (it follows the active heading before the first selection), sizes to the longest label within the tablet container, and uses the full container width at 767px and below. The panel applies the Real AI product camera menu styling at article scale and uses a quarter of the site’s fast motion duration. Reduced-motion preferences disable transitions and animated TOC jumps. The page uses native manual scrolling in Designer, Preview, and published pages. Introduction lands at the top of the cover, and H2 links clear the fixed site header.

Reading time counts the visible CMS rich text at 200 words per minute, rounds to the nearest minute and displays a minimum of one minute. The article header reading time is script-only. The divider and translatable reading label are separate native elements. The script segments the localized CMS body and updates only the number, formatted using the page locale. The minute count is named “Read time · auto-filled minutes” in Designer. Copy URL copies the current location, including any fragment, and announces the result. Its label, success text, and error text are separate native Webflow text nodes marked with `data-content-article-copy-label`, `data-content-article-copy-success`, and `data-content-article-copy-error`. The latter two use the native `hide` utility so they stay in the markup for localization. The script reads the localized text from these nodes. The decorative 16 px icon is a native image using the shared Webflow asset `6b015d3c725cbde9e43136a2`. The source and optimized SVGs come from Figma node `733:13860`. SVGO 4.1.0 used the reviewed project plugin list, multipass, numeric precision 2, transform precision 8, and preserved the namespace and viewBox. The export went from 615 to 379 bytes.

The related sections share the More Articles layout and retain their own CMS lists and View all destinations. The Presses template also retains its existing Real AI film support.

For reuse, copy the native Content Article section and rebind it to the destination collection. Place one instance of **Content Article Styles and Interactions** at the end of the destination template. The combined source for the component embed is `src/embeds/content-article/page-custom-code.html`. Keep the CSS first when updating the definition.

## Press company boilerplate

The Presses template ends `content-article-body` with the native **Company About**
section, immediately after `content-article-rich-text`. Set **About Company** on
a Presses item to select its company. The template binds Name and Short
Description from the selected Companies item. The custom H2 contains two
separate text elements for the translatable About label and the referenced
company name. Both are block-level flex items inside the heading.
**Company Description Override**
is an optional multiline field on the press item. The section uses native
Webflow classes and conditional visibility. It renders only when **About Company**
is set. The override paragraph renders when the override is set. The shared
description paragraph renders when the override is empty and the company has a
Short Description. Keep in HTML when hidden is off for these elements. Webflow
Preview verified that the unselected paragraph is absent from the rendered markup.

The English Patrick J. Adams release references Stitch and retains the campaign
film. The English Series A release references Andreessen Horowitz. Their former
boilerplate paragraphs were removed from the article rich text. The $10 million
release has an empty **About Company** field. Webflow Preview verified the two
shared descriptions, a temporary article override, and the hidden section on
the unassigned release. The temporary override was cleared. The Stitch section
also fit the 393 px mobile canvas. Changes were saved without publication.

In Companies, **Trusted by Logo Strip** groups **Show in Trusted by** and
**Display order**. **Short Description** is the shared source for press copy.
