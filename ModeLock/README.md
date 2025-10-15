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
└── html/       # Self-contained HTML sections
    ├── 00-base-styles.html
    ├── 01-hero.html
    ├── 02-problem.html
    ├── 03-solution.html
    ├── 04-specs.html
    └── 05-cta.html
└── widget_code.html   # Code placed in Odoo widget that's never fetched from GitHub, just here for reference
```

### How It Works
1. **GitHub** stores all code (HTML, CSS, JS)
2. **GitHack CDN** serves files from GitHub with proper MIME types
3. **Odoo** fetches and injects HTML via embed code widgets
4. **Updates**: Push to GitHub → GitHack updates → Website updates automatically

## Odoo Setup

Create 6 embed code widgets in this order:

### 1. Base Styles (loads first, blocking)
```html
<script>
    (async () => {
        const response = await fetch('https://raw.githack.com/Mid-City-Engineering/Website_Helper_Code/main/ModeLock/html_widgets/00-base-styles.html');
        const html = await response.text();
        document.head.insertAdjacentHTML('beforeend', html);
    })();
</script>
```

### 2-6. Content Sections (load after base)
```html
<div id="modelock-[section]-widget"></div>
<script>
    fetch('https://raw.githack.com/Mid-City-Engineering/Website_Helper_Code/main/ModeLock/html/0X-[section].html')
        .then(r => r.text())
        .then(html => document.getElementById('modelock-[section]-widget').innerHTML = html);
</script>
```

Replace `[section]` with: `hero`, `problem`, `solution`, `specs`, `cta`

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
