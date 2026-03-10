# ModeLock Website Architecture

## Overview
The ModeLock product page is built using a modular, GitHub-hosted architecture that enables automatic updates without touching the CMS.

## Architecture

### File Structure
```
ModeLock/
├── css/
│   ├── base/           # Reset, variables
│   ├── universal/      # Shared components (cards, buttons, etc.)
│   └── sections/       # Section-specific styles
├── js/                 # Animations and interactions
├── html/       # Self-contained HTML sections
│   ├── 00-base-styles.html
│   ├── 01-hero.html
│   ├── 02-problem.html
│   ├── 03-solution.html
│   ├── 04-specs.html
│   └── 05-cta.html
└── widget_code.html   # Code placed in Odoo widget that's never fetched from GitHub, just here for reference
```

### How It Works
1. **GitHub** stores all code (HTML, CSS, JS)
2. **GitHack CDN** serves files from GitHub with proper MIME types
3. **Odoo** fetches and injects content via a single embed code widget
4. **Updates**: Push to GitHub → GitHack updates → Website updates automatically

## Odoo Setup

Create 1 embed code widget & paste all of the code from the `widget_code.html` file. This script:

1. **Prevents Flash of Unstyled Content** - Immediately injects temporary CSS to hide all `modelock-*-widget` elements (opacity: 0) until the entire loading sequence completes, then fades them in smoothly via the js-ready class.
2. **Loading Order** - CSS loads first (base styles), then HTML widgets are injected and populated (that remain hidden unitl JS loads), finally JavaScript files load sequentially. This order ensures styling is applied before content appears, and all HTML elements exist before JS attempts to reference them by ID.
3. **Widget Assembly** - Creates five section containers following the `modelock-*-widget` naming pattern (where * is replaced by hero, problem, solution, specs, CTA), positions them before the footer, fetches their HTML content from GitHub concurrently, and populates each container.
4. **Graceful Degradation** - Logs any loading failures but still reveals the page content, ensuring visitors see something even if individual sections or scripts fail to load.

## Development Workflow
1. Edit files locally
2. Test with `local-test.html` (think of it as the monofile)
3. Commit and push to GitHub
4. Website updates automatically (no Odoo changes needed)

## Key Benefits
- **Single source of truth**: All code lives in GitHub
- **Version control**: Full git history
- **Zero CMS updates**: Push once, deploys everywhere
- **Easy rollbacks**: Revert commits to undo changes
