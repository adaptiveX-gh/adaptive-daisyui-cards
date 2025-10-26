Static vs Dynamic Rendering Differences Across All Layouts

Below we compare each layout’s static HTML structure (from index.html or templates) with how the dynamic preview (streaming-progressive.html) renders it. Key structural mismatches and their impact on CSS/styling are highlighted for all 17 layouts.

Objectives Layout

Static Structure: The objectives layout is a two-column design with a left context section and a right objectives list. The outer container has class .objectives-layout and contains an .objectives-grid wrapper dividing the two columns
GitHub
GitHub
. The right column is an ordered list <ol class="objectives-list"> with each item showing a numbered badge (<div class="badge objective-badge">) and content (action and description)
GitHub
.

Dynamic Output: In the dynamic preview, the content was likely parsed as a simple title and bullet list (flat structure), so the distinct two-column HTML was not created. No .objectives-grid or left/right containers are present, because the dynamic pipeline did not generate a dedicated context vs list structure. The numbered badge elements are missing – dynamic bullets render as regular list items (with default discs) instead of circled numbers. For example, static uses a custom list-style (no default bullets) and adds content: '•' via CSS for list items
GitHub
, whereas dynamic simply outputs a <ul class="list-disc"> for bullets
GitHub
. Without the .objective-badge badges and structured <ol>, the numbering and styling do not match.

CSS Mismatch: Because the dynamic output does not include the outer .objectives-layout class on the correct container, the static CSS rules (e.g. flex/grid layout in .objectives-grid and sizing of .objective-badge) do not apply
GitHub
GitHub
. This likely causes the objectives list to stack incorrectly. For instance, static CSS uses container queries on .objectives-layout to switch from column to grid layout at certain breakpoints
GitHub
 – dynamic preview fails to meet these selectors, so it may remain a single-column flow. In short, objectives in dynamic preview appear as a plain list under the title, losing the intended two-column format and styled badges.

Sidebar Layout

Static Structure: The sidebar layout is intended to place an image on one side and text on the other. The static template uses a container with class .sidebar-layout (a flex row) containing a .sidebar-image div for the image and a .sidebar-content div for the text
GitHub
GitHub
. Typically, the image div holds an <img> of fixed width (e.g. 300px), and the content div holds the title, description, bullets, etc.

Dynamic Output: The dynamic preview does not create these specific wrapper divs. It will prepend an image container at the top of the card if an image is generated (using a generic .card-image class)
GitHub
, rather than placing it in a .sidebar-image side container. All text content (title, bullets) is then rendered in a single column below the image. In other words, no .sidebar-image or .sidebar-content elements exist in the dynamic DOM, so the image and text are not side-by-side as intended. The title likely appears as a heading (or styled <div>) and bullets as a standard <ul> below it, all in one column.

CSS Mismatch: Because the dynamic card’s outer element uses a class card-sidebar-layout (with a prefix) instead of the plain sidebar-layout class, the static CSS selectors don’t match. Static CSS expects .sidebar-layout .sidebar-image and .sidebar-layout .sidebar-content to apply sizing and layout
GitHub
GitHub
. These rules (e.g. making the container a row flex and the image 300px wide) never activate in preview. As a result, the dynamic preview’s image (if present) likely spans full width above the text, and the text does not wrap next to it – a clear layout discrepancy from the static design.

Feature Layout

Static Structure: The feature grid layout presents a header and a set of feature items (e.g. for key benefits or features). In static HTML, the outer .feature-layout contains a .feature-header with a title <h2> and subtitle <p>
GitHub
. Below that, a .feature-grid wraps multiple .feature-item blocks
GitHub
. Each feature item has an icon (e.g. an emoji or icon HTML), a sub-heading <h3> for the feature title, and a description paragraph
GitHub
.

Dynamic Output: The dynamic generator does not output a structured features array with icons, titles, descriptions. If the outline text had bullet points, the backend likely treated them as plain bullets (since no special parse for “features” was noted). Thus, the preview would show the card title and then a bullet list of feature texts, rather than a grid of feature items. No .feature-grid or .feature-item divs are created in the dynamic content. The icons are probably lost or rendered as plain text if they were included (e.g. “⭐” would just appear as a character, not styled separately). The sub-headings for each feature are not distinguished – everything after the title becomes part of a single list.

CSS Mismatch: The static CSS expects a grid layout for features: .feature-grid as a container and each .feature-item styled with certain spacing. None of these classes exist in the dynamic version, so the card remains a basic vertical list. For example, static design would put items in columns (three across on large screens) and use adaptive text sizing for .adaptive-text-lg on feature item titles
GitHub
. In the preview, because it’s just a <ul class="list-disc"> for bullets, the styling is limited to default list appearance
GitHub
 and the items will not auto-arrange into a grid or use the intended icon styling.

Masonry Layout

Static Structure: The masonry layout displays a gallery of images with captions. In static HTML, the outer .masonry-layout contains a title <h2> and a .masonry-grid container
GitHub
. Inside the grid, each item is a .masonry-item with an <img> and an overlay text block (.masonry-item-content) that has a smaller title and description
GitHub
. This creates a mosaic of images and text.

Dynamic Output: The dynamic preview is not capable of generating a masonry grid from outline text. Typically, the outline content would need to provide multiple image URLs and captions. Since the SSE generation only handles one AI-generated image per card (at most), the preview likely shows at most one image (or none) for a masonry layout. The title might appear, but instead of a .masonry-grid with multiple items, there would be no grid structure. If bullets were provided as captions, they might just form a list. In essence, the dynamic card will not reproduce the multi-item grid – it may end up with a single image (at top) and a bullet list of text below, or just a list of text if no image is present.

CSS Mismatch: Static CSS for masonry expects the .masonry-layout class on the container and a child .masonry-grid to apply a multi-column layout
GitHub
. These are absent in preview, so no masonry styling occurs. The dynamic card likely falls back to a single-column layout of whatever content it has. The absence of .masonry-item and .masonry-item-content means that any intended styling (like making captions overlay or formatting the grid cells) is lost. The preview of a masonry layout therefore appears as a plain slide (often just a title and some bullets/images in a column) rather than a Pinterest-style grid.

Dashboard Layout

Static Structure: The dashboard layout is a complex, data-heavy slide with multiple sections. Static HTML divides it into a header, sidebar menu, main content area with widgets, and an optional footer. For example, the template shows a .dashboard-header with title and subtitle
GitHub
, a .dashboard-sidebar with a menu list (an <ul> of menuItems)
GitHub
, and a .dashboard-main area containing several .dashboard-widget items (each with its own title, value, and description)
GitHub
. A .dashboard-footer can appear at the bottom with a footnote
GitHub
.

Dynamic Output: The dynamic preview cannot assemble this intricate structure from a plain outline. Likely, it treats the card as a regular bullet-list card. The entire outline text for a “dashboard” slide might be parsed into a title and a list of bullet points (representing stats or insights). No separate sidebar or widget containers are created. This means the previewed card might just show a title and a vertical list of points (or at best, two lists if the content had some hint of separation, but not in the structured way the static version expects). The specialized elements like .dashboard-widget (with colored numeric values) or .menu menu-compact list in the sidebar are not present in dynamic output.

CSS Mismatch: Without the .dashboard-layout class on a wrapping element, none of the dashboard-specific CSS rules apply. Static CSS expects a grid/column layout for the main vs sidebar (e.g., a media query that on large screens would place sidebar and main side by side)
GitHub
. In dynamic output, since everything is in one column, those layout rules are bypassed. Also, things like the .dashboard-widget styling (large font values colored by class text-{color}) are lost, because the preview did not create those elements at all. Thus, the dynamic “dashboard” appears as an ordinary list slide, lacking the multi-column dashboard feel.

Split Layout

Static Structure: The split layout is meant for a side-by-side comparison or before/after scenario. Static markup wraps the whole card in .split-layout and typically has two main containers: .split-left and .split-right
GitHub
GitHub
. Each side can have its own title and content. For example, the left might contain a title, an optional avatar block, and a list of points (leftItems), while the right side might have its own small header and a list of bullet points (rightItems)
GitHub
GitHub
.

Dynamic Output: The backend does split the outline bullets into two halves for left/right content
GitHub
. However, the dynamic front-end does not create two columns to display them. There is no logic in streaming-progressive.html to generate .split-left and .split-right divs. Likely, the preview simply outputs the left content followed by the right content in sequence (one after the other in the DOM). In the worst case, if the SSE sent a single object with { left: [...], right: [...] }, the preview might even show a JSON blob (since no handler for a “split” section exists, it could default to printing the object as text). Assuming it handled them separately, the result is two lists, but stacked vertically.

CSS Mismatch: Because the .split-layout class isn’t applied to a containing element in the dynamic card, the CSS that arranges .split-left and .split-right side by side doesn’t trigger. Static CSS would normally use flex or grid on .split-layout to create a 50/50 two-column layout
GitHub
. In the preview, without those classes, the left and right content (if separately rendered) will just occupy full width one after the other. Additionally, styled elements like the left side’s avatar/name block or right side’s badges
GitHub
GitHub
 are missing entirely. The dynamic preview of a split card therefore fails to visually split – it looks like a single column of text, losing the comparative layout.

Image-Text Layout (Image on Left, Text on Right)

Static Structure: In static form, .image-text-layout organizes content in two sections: an .image-section (typically left side) containing an <img>
GitHub
, and a .text-section (right side) with the title, paragraph, bullets, and button(s)
GitHub
GitHub
. The container has the class .image-text-layout which by default makes it a flex row for large screens
GitHub
, falling back to column on smaller screens
GitHub
.

Dynamic Output: The dynamic preview does not preserve these section wrappers. It will generate an image container for the card (if images are enabled) and always prepend it at the top of the card body
GitHub
. The rest of the text (title, bullets) is rendered below that. This means there is no .image-section div housing the image nor a .text-section around the text. All content ends up in one vertical flow. The title might appear as a large text (styled by default rules) and bullets as a standard list, but they are not enclosed in a .text-section with appropriate padding or alignment.

CSS Mismatch: Static CSS expects the parent to have class .image-text-layout for the flex styling
GitHub
, and uses .image-section and .text-section to size and align the halves (e.g. the image section flex-basis 40%
GitHub
, text-section filling the rest). In the dynamic card, the class applied to the outer card is card-image-text-layout (with prefix), so the selector .image-text-layout isn’t matched. As a result, the preview likely shows the image full-width on top (since the fallback column layout is essentially always in effect without the proper classes), and the text below full-width. The side-by-side effect on larger screens is lost. Additionally, list styling differences apply here too – static bullets in this layout use checkmark icons (✓) and no default list-style
GitHub
, whereas dynamic bullets are plain disc list items
GitHub
.

Text-Image Layout (Text on Left, Image on Right)

Static Structure: The text-image layout is the mirror of the above, with text first and an image second. Static HTML uses .text-image-layout as the container, containing a .text-section (with title, subtitle, bullets, buttons) followed by an .image-section for the image
GitHub
GitHub
. The classes are essentially the same concept, just reversed order in the HTML.

Dynamic Output: As with image-text, the dynamic preview doesn’t maintain separate sections. The image (if generated) will still be prepended to the card body (meaning in this case, the image actually ends up above the text – which is opposite of the intended order for text-image layout). The text content then flows below. So the preview for a text-image layout card ironically may show the image on top, because the code isn’t aware to append vs prepend based on layout type. There is no .text-section or .image-section wrapping these in the DOM.

CSS Mismatch: Static CSS for .text-image-layout is similar to the image-text rules: it expects the layout class and the two section classes to position content with flex (image flex-basis 40% on the right, etc.)
GitHub
GitHub
. Without those present, the preview again falls back to a single-column layout. The dynamic card likely looks just like the image-text case (image above text), which is a significant deviation from the intended design (text first, then image on large screens). Also, static bullet styling (no default bullets, custom list icon, etc.) in the text section is not applied in preview for the same reasons described above.

Two-Columns Layout

Static Structure: The two-columns layout is a generic side-by-side layout for comparing two lists or groups of content. In static form, the container .two-columns-layout encloses (optionally) a header .two-columns-header for the card’s overall title, and a .two-columns-container that holds two .column divs
GitHub
GitHub
. Each column in static HTML might contain a list or text relevant to that column.

Dynamic Output: The dynamic system does detect a “columns” layout and splits bullets accordingly. For two columns, the backend would split the bullet list into two arrays
GitHub
. However, the front-end doesn’t explicitly create the .two-columns-container or column div wrappers to hold each list. It likely processes each column’s content sequentially. The result is that the preview might show the first column’s text followed by the second column’s text, one after the other, rather than actually in side-by-side columns. There are no .column class divs in the DOM to allow styling.

CSS Mismatch: Static CSS defines .two-columns-layout .two-columns-container { display: flex; ... } to arrange the columns horizontally
GitHub
. Because the dynamic output is missing that container and the .two-columns-layout class on a parent element, those rules never apply. Moreover, static design removes list bullets and uses custom bullet styling inside columns
GitHub
GitHub
, but the dynamic preview’s bullets are raw <ul class="list-disc"> in each column’s content. Even if the dynamic preview somehow put the two arrays into two separate <ul>s, without the proper container and classes they would still stack vertically. Essentially, the preview doesn’t visually appear as “two columns” at all – it fails to leverage the grid/flex CSS that the static version uses for this layout.

Two-Columns with Headings Layout

Static Structure: This layout is an enhanced two-column design where each column has a heading. In static HTML, the outer container class is .two-columns-headings-layout (often with a header for the whole card similar to above). Inside, a .two-columns-container holds two .column divs
GitHub
 (likely each column includes a sub-heading element). For example, each column might have an <h3 class="column-heading"> and some text or bullets under it (similar to the three-column headings pattern, but with two columns).

Dynamic Output: The backend splits the content into content.columns array with each column having a title (first bullet as heading) and bullets (remaining points)
GitHub
GitHub
. However, on the front-end, there is no code to automatically render a structured two-column layout. The preview will not create the .two-columns-container grid or the <h3 class="column-heading"> elements for each column. At best, the dynamic logic might treat each column object as a section of content. The enrichContent function does attempt to map col.title to a heading text, but since it doesn’t generate separate column containers, these “headings” might just appear as bold text or as part of a list. Essentially, the preview likely lists column1 heading and bullets, then column2 heading and bullets, one after the other.

CSS Mismatch: Without the .two-columns-headings-layout class on a parent and the structured DOM, none of the CSS for this layout applies. Static CSS expects to find .column-heading inside each .column for styling, and uses the same .two-columns-container grid rules as the two-column layout
GitHub
. The dynamic output doesn’t include those classes (the preview’s outer card gets a class card-two-columns-headings-layout instead of just two-columns-headings-layout), so the columns are not positioned side by side. Additionally, the bullet styling issue is similar: static removes default bullets and adds custom ones
GitHub
, but dynamic uses default list styling
GitHub
. The net effect is the preview appears as two lists stacked vertically, with perhaps the first item of each list acting as an unstyled “heading” line, rather than two labeled columns.

Hero Layout

Static Structure: The hero layout is a title slide with a prominent heading. Static HTML is very simple: a .hero-layout container containing a .hero-content section for text and (optionally) a .hero-image section for a background image
GitHub
. Typically it has an <h1 class="hero-title"> for the big title and maybe a <p class="hero-subtitle"> for a subtitle
GitHub
. The hero-image <img> (if provided) sits in a separate div that spans the card’s background
GitHub
.

Dynamic Output: The dynamic preview handles hero layouts with special cases. On receiving content, it creates a .hero-content container inside the card body to hold text
GitHub
. It also treats the title and subtitle sections with unique styling: after the typewriter effect, enrichContent converts the title text into an <h1> with class hero-title, and subtitle into a <p> with class hero-subtitle
GitHub
. If an image is included (e.g. “hero-overlay” variant or if user enabled an image for a hero), the code creates a .hero-image div absolutely positioned and inserts the image there
GitHub
. Thus, the dynamic structure for hero is relatively close to static: it does produce a .hero-content and .hero-image division, matching static expectations.

Minor Differences: One difference is in class naming at the very top level – the dynamic card element gets class card-hero-layout in addition to generic classes
GitHub
. However, since static CSS often targets .hero-layout .hero-title etc., the preview also adds the correct hero classes on inner elements, so most styling is applied correctly. The hero title is rendered as large text (dynamic uses inline styles to set font-size ~3rem and white color for overlay cases
GitHub
, or via DaisyUI theme classes). If anything, a discrepancy might be that dynamic always injects a .hero-content wrapper even if no image, whereas static template had the text directly under .hero-content. This doesn’t affect appearance. In summary, hero layouts are nearly identical between static and dynamic, thanks to explicit handling – the title and subtitle render with the same classes and hierarchy, and if the image is present, the overlay effect (dark gradient over the image) is achieved via CSS on .hero-image::after which the preview does include
GitHub
.

Hero Overlay Layout

Static Structure: A hero overlay layout is similar to hero, but with background image and overlaid text. Static structure would still use .hero-overlay-layout (or sometimes the same .hero-layout class with a modifier). Typically, the text is centered and white over a full-bleed image. The static template likely wraps text in a .hero-content (positioned relative above the image) and an absolutely positioned .hero-image for the image (with a dark overlay).

Dynamic Output: The dynamic pipeline treats hero-overlay largely the same as hero. It sees 'hero' in the layout name and parses title, subtitle accordingly
GitHub
. On the front-end, it creates the .hero-content container for text and sets up the image container with class hero-image for the background
GitHub
. The title and subtitle are given the hero-title and hero-subtitle classes and turned into appropriate tags (h1, p) just like the standard hero
GitHub
. This means the overlay text styling (large white text) is preserved in preview. The gradient overlay is handled by CSS (.hero-image::after in the static stylesheet adds the dark gradient layer
GitHub
), and since the preview does apply the hero-image class, that CSS effect works.

Minor Differences: The same note about outer class naming applies: dynamic uses card-hero-overlay on the card element instead of just hero-overlay-layout. If any static CSS specifically targeted .hero-overlay-layout on the container, it wouldn’t match. However, most of the hero overlay effect is achieved through the inner structure and classes which are present. Thus, the dynamic hero-overlay should visually match the static layout quite closely. Any differences might be subtle (e.g. timing of image load or slight variation in padding), but structurally, both have a .hero-image div with the image and overlay, and a .hero-content for centered text
GitHub
GitHub
.

Three-Columns Layout

Static Structure: The three-columns layout is a basic 3-column format (often for comparing three items or listing three categories). Static HTML uses .three-columns-layout on the container and usually a .three-columns-container (possibly a grid) that contains three .column divs
GitHub
GitHub
. Each column might just have some text or a list inside.

Dynamic Output: The backend would split bullets into 3 groups for content.columns array if this layout is chosen. However, the dynamic front-end does not explicitly render a three-column container. There is no creation of a .three-columns-container grid or separate .column wrappers in the streaming preview code. Likely, the content for all three intended columns is appended in sequence. Without distinct column divs, the preview shows the column texts one below the other. In some cases, the dynamic output for “columns” might even appear as a JSON array string (if not handled gracefully)
GitHub
GitHub
, but assuming it iterates, it would still be vertically stacked content.

CSS Mismatch: Static CSS for .three-columns-layout is quite elaborate: it defines a container that switches from one-column to two-column to three-column grid at various widths
GitHub
GitHub
. None of that can apply, because the preview’s outer element isn’t labeled .three-columns-layout (it’s card-three-columns-layout instead
GitHub
), and the required <div class="three-columns-container"> isn’t present to trigger the grid. Also, static hides default list bullets and uses custom bullet styling in each column’s lists
GitHub
GitHub
, but dynamic didn’t output those classes, so default bullets show. Essentially, the preview fails to form the 3-column layout – the items appear in one column, losing the side-by-side alignment and any responsive adjustments.

Three-Columns with Headings Layout

Static Structure: This layout displays three columns, each with its own sub-heading. In static HTML, the container has class .three-columns-headings-layout. There is often an overall header section (.three-columns-header with card title/subtitle)
GitHub
, and below that a .three-columns-container wrapping three .column divs
GitHub
. Each column contains an <h3 class="column-heading"> and a .column-content with description text, an optional list (<ul>) of items, and possibly a price or other details
GitHub
GitHub
.

Dynamic Output: The backend parsing creates content.columns with each column’s title (for the heading) and bullets (for the list)
GitHub
GitHub
. The dynamic front-end partially handles this: when rendering each column’s content, it checks for col.heading || col.title and for col.items || col.bullets
GitHub
 (as hinted by the code). This means the text of the first bullet in each column is used as a heading in principle. However, the preview fails to actually create the structural elements needed. It does not generate an <h3> with class column-heading inside a .column div – instead it likely just writes the heading text as a bold line or leaves it as the first list item. Without a container for each column, all the column content flows together.

CSS Mismatch: Because .three-columns-headings-layout is not applied on an ancestor of the content (dynamic uses card-three-columns-headings-layout on the card element
GitHub
), static CSS targeting that class won’t apply. For instance, static CSS uses .three-columns-headings-layout .three-columns-container { display: grid; … } similar to the three-column case, and .column-heading to style each column’s sub-title. In preview, the headings from each column are not rendered with the column-heading class at all (they might not even be separate <h3> elements). Also, the bullet points in columns appear with default styling (no removal of list markers), whereas static would have them unstyled and indented under .column-content
GitHub
GitHub
. The overall effect is that the dynamic preview merges the three columns into one list, losing the clear separation and styling of individual column headings. For example, a static three-column-with-headings card might show three side-by-side lists each under a heading; the preview would show all three headings and all bullet items in one long vertical list.

Four-Columns Layout

Static Structure: The four-columns layout extends the pattern: container class .four-columns-layout, optional header, and a .four-columns-container grid with four .column elements
GitHub
GitHub
. Static CSS uses a grid that goes from 1-column on mobile up to 4-column on desktop inside that container
GitHub
GitHub
.

Dynamic Output: The dynamic system would split bullets into four groups for content. But as with 2- and 3-column layouts, the preview doesn’t create the .four-columns-container or column divs. All four segments of content are appended one after another in the DOM. There’s no mechanism to start a new row or column visually. So the preview essentially fails to show four columns; instead it’s one column of text comprising all content.

CSS Mismatch: None of the static four-column-specific CSS is activated. The preview’s outer card lacks the .four-columns-layout class (it has card-four-columns-layout instead, which isn’t targeted by the styles). Thus, the .four-columns-container grid rules do nothing (the element isn’t there). Also, static style expects to find .column ul to remove bullets and add custom ones
GitHub
【69†L55-L63}, but dynamic output uses normal <ul class="list-disc"> for each bullet list. The intended grid of four equal columns in static becomes a flat list in dynamic. Visually, the previewed four-columns layout doesn’t distribute content into columns at all, appearing incorrect compared to the static example (which would have a nice 2x2 or 4x1 grid depending on screen size).

Title-Bullets Layout

Static Structure: This is a simple layout for a title and bullet list. The static structure still wraps everything in .title-bullets-layout. Inside, there’s a .title-bullets-header containing the title <h2> (and optional subtitle)
GitHub
, and a .bullets-container wrapping an unordered list of bullet points
GitHub
. Notably, static CSS for this layout removes the default list style (no bullets) and uses a custom bullet via CSS ::before on list items (a colored bullet symbol)
GitHub
GitHub
.

Dynamic Output: The dynamic preview for a title with bullets is functionally correct in structure (it will show a title and a list of bullets), but there are subtle differences. The preview likely creates a section === 'title' element for the title text and a section === 'bullets' for the list. The title becomes a <div> or similar with classes text-3xl font-bold ... applied
GitHub
 – whereas static used a semantic <h2> with adaptive-text-3xl. The bullet list is rendered as <ul class="list-disc list-inside ..."> with <li class="text-base"> for each item
GitHub
. It does not wrap the list in a .bullets-container div, nor label the header section with a .title-bullets-header class.

CSS Mismatch: Because the preview’s outer element is missing the plain .title-bullets-layout class (and instead might have card-title-bullets-layout), the container-specific styles (like padding and max-width for the bullets container) don’t apply
GitHub
GitHub
. More visibly, the bullet styling differs: dynamic uses default browser bullets (disc), while static lists have list-style: none and rely on the CSS pseudo-element for a bullet
GitHub
GitHub
. This means in preview you’ll see black default bullets, whereas in static you’d see custom-colored bullets (matching the theme primary color) preceding each item. The spacing and alignment might also differ slightly due to missing wrapper classes, but overall this layout’s discrepancy is mainly in bullet styling and some minor padding around the list.

Title-Bullets-Image Layout

Static Structure: This layout is similar to Title-Bullets, but with an image alongside the bullets. Static HTML includes a .title-bullets-image-layout container. Inside, there’s a header section for the title/subtitle, and then a .content-container that holds two parts: a .bullets-section (with the <ul> of bullets) and an .image-section (with an <img>)
GitHub
GitHub
. This allows text on one side and an image on the other side, typically.

Dynamic Output: The dynamic preview does not create a .content-container or split sections. As with other image-bearing layouts, the image (if generated) is simply prepended to the card. All bullets then follow below. Therefore, instead of side-by-side bullets and image, the preview will show the image on top and bullets beneath (especially on large screens where static would have them in one line, dynamic still stacks them). There’s no .bullets-section or .image-section div in the DOM.

CSS Mismatch: Static CSS likely uses .title-bullets-image-layout .content-container { display: flex; ... } to arrange the two sections horizontally, and sets the .bullets-section and .image-section widths appropriately. The dynamic output fails to match those selectors: it has neither the container class applied nor the section classes. Thus, the flex layout is not activated, and the image defaults to block layout above the text. Additionally, static styling for bullet lists (removing default bullets, etc.) is the same as in title-bullets layout, which the preview misses as discussed above. The end result is a significant layout difference: what should be text and image side-by-side (in desktop view) in static ends up as a vertical stack in dynamic preview.

Common Issues Identified and Root Causes

Across all these layouts, several recurring issues explain why static and dynamic renderings diverge:

Layout Class Not Applied to Correct Element: In the dynamic HTML, the specific layout class (e.g. .three-columns-layout, .sidebar-layout) is not present on the same wrapper element as in the static HTML. Instead, the preview adds a class like card-<layout> to the card element
GitHub
, which does not match the static CSS selectors. For example, static CSS targets .three-columns-layout .column ...
GitHub
, but the preview’s element is <div class="card-three-columns-layout"> which fails to trigger those rules. This mis-placement or renaming of the class means none of the layout-specific CSS gets applied in dynamic mode. (The fix would be to add the plain layout class to the appropriate container – e.g. the scrollable content container – so the styles match
GitHub
.)

Missing Structural Wrappers: The dynamic generation often outputs content without the additional wrapper <div>s that static templates rely on. For instance, columns layouts lack a container for columns and individual column divs, sidebar and image-text layouts lack separate image/text section divs, and title-bullets(-image) layouts lack wrapper divs around lists. These wrappers usually carry classes used for styling (like .sidebar-content, .two-columns-container, .bullets-container). Without them, the corresponding CSS (like flexbox or grid definitions) doesn’t apply, and the HTML elements that are present just stack by default. This is why many multi-column designs default to a single column in preview.

Property Mapping and Content Parsing Gaps: Some layouts expect specific data fields (e.g. action and description for Objectives items
GitHub
, or sidebarTitle and menuItems for Dashboard
GitHub
). The dynamic outline parsing did not always populate those fields correctly. It often treated everything as either a title or bullets. For example, in objectives-layout, a numbered list of objectives was not parsed into {action, description} pairs – the dynamic content likely just had bullet text, so it couldn’t split bold action vs description parts. Similarly, feature-layout expects an array of {icon, title, description} but the outline just gave bullet text (no way to assign an icon or separate title). These mismatches in data shape lead to missing elements in the preview: e.g., no <span class="objective-action"> or <span class="text-primary mt-1">✓</span> icons in feature bullets because the data wasn’t structured to create them.

Bullet List Rendering Differences: Many layouts use custom list styling in static form (no default bullets and a colored symbol or icon as the marker). The dynamic preview, by default, renders bullets as <ul class="list-disc list-inside">...<li>...
GitHub
. This means black disc markers appear, and the text might not be indented as in static design. We see this in three-columns-headings, two-columns-headings, title-bullets, etc., where static CSS turns off list markers and injects content: '•' with a specific color for consistency with the theme
GitHub
GitHub
. The preview doesn’t emulate that, resulting in a visual discrepancy (different bullet style and spacing).

Image Placement and Sizing: For layouts that include images combined with text (sidebar, image-text, title-bullets-image), dynamic rendering always places the image at the top of the card body by default
GitHub
. It does not respect the intended side placement or specific sizing from static layout. For example, static sidebar has the image constrained to 300px on the left
GitHub
, but preview might show a full-width image on top. This one-size-fits-all image insertion is a root cause for the layout difference in any mixed text-image card that isn’t the hero overlay. The dynamic code currently only has a special case for hero overlays
GitHub
 – other layouts with images aren’t handled specially, leading to layout drift.

In summary, the static vs dynamic discrepancies come down to the dynamic system not replicating the exact HTML structure or class names that the static examples use. The CSS rules were written for the static structure, so any deviation (missing containers, different class naming, different tag hierarchy) in the preview causes those rules to either not match or not find the expected elements.

Recommendations to Fix Mismatches

Apply Layout Classes to Container: Ensure the un-prefixed layout class (e.g. .three-columns-headings-layout) is added to a wrapping element in the dynamic card DOM. The ideal place is the scrollable content container (so that it encloses all card-specific content). For instance, instead of cardEl.classList.add('card-three-columns-headings-layout'), do scrollableDiv.classList.add('three-columns-headings-layout'). This will immediately enable the correct CSS selectors for layout spacing, grids, etc. (In the code, a fix was noted to move the class add from the .card-body to the .card-content-scrollable element
GitHub
.)

Generate Missing Wrapper Elements: Update the front-end rendering logic to explicitly create structural <div>s for sections as needed. For example, when a “columns” layout is detected, create a <div class="two-columns-container"> and inside it generate two <div class="column"> containers, then place content within those. Similarly, wrap image and text in .sidebar-image and .sidebar-content for sidebar layout, etc. This may involve using the layout name to conditionally insert certain elements. While this adds complexity, it would make the dynamic DOM mirror the static DOM, letting existing CSS do its job.

Align Element Tags and Classes: Where static uses specific tags or classes for styling (like <h3 class="column-heading"> for column titles, or <ul class="menu"> for a menu list), the dynamic renderer should use the same. For instance, when rendering a column title in three-columns-headings, create an <h3> element with column-heading class rather than just a text node or generic <div>. This ensures typography and spacing match (static classes like .adaptive-text-xl on headings would then apply if present). The enrichContent function could be extended to handle sections like “heading” or “columnTitle” to assign these classes.

Customize Bullet Rendering per Layout: Introduce layout-aware bullet styling. For example, for title-bullets layouts, use no list-disc class and instead add a custom marker via CSS or insert a bullet icon inline to mimic the static style. The dynamic code could detect the layout and adjust the generated HTML for bullet lists – e.g., add a class to the <ul> that corresponds to the layout, so the CSS list-style: none rules apply. In general, making the preview’s <ul> structure match the static template (including any surrounding div) will automatically apply the correct bullet style from the existing CSS.

Respect Image Placement: Modify the image placeholder insertion logic to be layout-specific beyond just hero. For instance, if layout is image-text-layout or sidebar-layout or title-bullets-image-layout, do not prepend the image container to the card body. Instead, insert an image container in the appropriate position or wrapper. This might mean creating the .image-section div first, and appending/prepending relative to text-section. A simpler interim fix could be to add CSS rules for the dynamic .card-image placement when a known layout class is present. For example, .sidebar-layout .card-image { float: left; width: 40%; } as a quick patch, though structural HTML parity is cleaner.

By implementing the above, the dynamic output will structurally and semantically match the static examples, eliminating the visual drift. Each of the identified issues (class mismatch, missing wrappers, etc.) correlates to a straightforward fix as outlined, which would bring the preview in line with the hand-coded designs.

Test Plan: After fixes, each layout should be tested by creating a card with sample content and ensuring the DOM of the preview matches the DOM of the static template (you can use the browser inspector or diffing the outer HTML as described in Phase 3 of the research task). Key things to verify for each layout:

Correct application of the layout class on an ancestor element (so CSS container queries and selectors fire).

Presence of expected wrapper divs (columns container, sidebar content, etc.).

Proper tags for headings and text (e.g., hero title is an <h1>, column headings are <h3>, etc.).

Bullet lists have identical structure and styling (no extra <span> or missing icons compared to static).

Images appear in the correct section or container and obey layout-specific sizing (e.g., not full-width if meant to be a side image).

Performing these checks will ensure the static and dynamic renderings become virtually identical for all layouts, fulfilling the goal of eliminating layout mismatches.