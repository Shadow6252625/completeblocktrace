# BlockTrace - The Truth Engine

A blockchain intelligence and forensics platform providing transaction tracing, analysis, and verification capabilities.

## Features

- **Single-Page Application** (`index.html`) - Combined landing page and dashboard
- **Main Landing Page** - Marketing and information site with hero section, protocol overview, governance, pricing, and testimonials
- **Forensic Intelligence Dashboard** - Advanced analytics and investigation tools (accessible via "Launch App" button)

## Pages

### Main Landing Page
- Hero section with transaction tracing
- Protocol overview
- Explorer features (Bento grid dashboard preview)
- Governance framework
- Testimonials
- Pricing tiers
- Footer with navigation links

### Dashboard
- Transaction volume analysis
- Risk distribution visualization
- AI-powered entity resolution
- Flagged transactions monitoring
- Case reports and investigations

## Navigation

- **From Landing Page → Dashboard**: Click "Launch App" button in navigation bar
- **From Dashboard → Landing Page**: Click the logo in the Transaction Volume Analysis card

## Technologies

- HTML5
- Tailwind CSS (via CDN)
- Iconify Icons
- Custom CSS animations and scroll effects
- JavaScript for dynamic content switching
- Responsive design
- SVG favicon support

## Favicon

The project includes a custom SVG favicon embedded directly in `index.html` featuring the BlockTrace "B" logo with cyan-blue glow and orange arc effects. The favicon is included as a data URI, so no separate files are needed.

## File Structure

```
blocktrace/
├── index.html          # Main application (landing page + dashboard) - Contains embedded favicon
└── README.md           # This file
```

**Note:** The favicon is embedded directly in `index.html` as a data URI, so no separate favicon files are needed.

## Deployment

This is a static website that can be deployed to:
- **GitHub Pages** - Simply push to a repository and enable Pages
- **Netlify** - Drag and drop or connect repository
- **Vercel** - Connect repository for automatic deployment
- Any static hosting service

### GitHub Pages Deployment

1. Create a new repository on GitHub
2. Upload `index.html`, `favicon.svg`, and `README.md`
3. Go to Settings → Pages
4. Select source branch (usually `main`)
5. Your site will be live at `https://[username].github.io/[repository-name]/`

The single `index.html` file contains everything needed - no build process required!

## License

© 2026 BlockTrace. All rights reserved.


