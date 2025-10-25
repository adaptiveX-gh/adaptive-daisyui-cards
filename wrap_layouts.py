#!/usr/bin/env python3
"""
Script to wrap all layout cards with shared component structure
"""

import re

# Read the HTML file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define layout patterns to wrap (all layouts except sidebar which is already done)
layouts_to_wrap = [
    'feature-layout',
    'masonry-layout',
    'dashboard-layout',
    'split-layout',
    'image-text-layout',
    'text-image-layout',
    'two-columns-layout',
    'two-columns-headings-layout',
    'three-columns-layout',
    'three-columns-headings-layout',
    'four-columns-layout',
    'title-bullets-layout',
    'title-bullets-image-layout',
    'hero-layout',
    'hero-overlay'
]

def wrap_layout(layout_id, layout_class):
    """Wrap a layout with shared component structure"""

    # Pattern to match the layout div
    # This matches: <div id="..." class="...layout-card..." data-layout="...">
    # up to its closing </div>

    pattern = rf'(<div id="{layout_id}"[^>]+>)(.*?)(</div>\s*(?=\n\s*<!--|\n\s*</div>))'

    def replacer(match):
        opening = match.group(1)
        content_inner = match.group(2)
        closing = match.group(3)

        # Don't wrap if already wrapped
        if 'layout-card-with-components' in content_inner:
            return match.group(0)

        # Build wrapped version
        wrapped = f'''{opening}
            <div class="layout-card-with-components">
              <div class="shared-header-container" data-card-id="{layout_id}"></div>
              <div class="card-content-scrollable {layout_class}">
{content_inner}
              </div>
              <div class="shared-footer-container" data-card-id="{layout_id}"></div>
            </div>
          {closing}'''

        return wrapped

    return re.sub(pattern, replacer, content, flags=re.DOTALL)

# Wrap each layout
for layout in layouts_to_wrap:
    # Extract class name from id
    layout_class = layout.replace('hero-overlay', 'hero-layout overlay')
    if layout_class == 'hero-layout':
        layout_class = 'hero-layout'
    elif 'overlay' not in layout_class:
        layout_class = layout

    print(f"Wrapping {layout}...")
    content = wrap_layout(layout, layout_class)

# Write back
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! All layouts wrapped.")
