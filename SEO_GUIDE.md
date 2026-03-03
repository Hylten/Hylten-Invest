# Hyltén Invest AB - AI Handover Guide

## System Architecture
This is a minimalist, high-performance landing page built for **Hyltén Invest AB**. It focuses on a "Principal/Investor" aesthetic (discrete, high-end, serif/sans-serif mix).

### Tech Stack
- **Core**: React 19 + TypeScript + Vite.
- **Styling**: Vanilla CSS (`src/index.css`) with CSS variables.
- **Routing**: Dual-mode architecture.
  - Landing page is a single-page React app with scroll logic.
  - `/insikter/` (Insights) section uses path-based routing managed by `App.tsx` and static HTML fallback.

### SEO & Pre-rendering
We use a custom script located at `scripts/build-seo.js`.
1. **Build Process**: `npm run build` generates the React bundle.
2. **Post-Build**: `node scripts/build-seo.js` reads the files, parses content in `content/insikter/*.md`, and generates:
   - `/dist/insikter/index.html` (Index of all articles)
   - `/dist/insikter/[slug]/index.html` (Individual articles)
   - `sitemap.xml`
   - `robots.txt`

This ensures Google can index the blog content even though the main app is a SPA.

### Content Management
- Add new insights as Markdown files in `content/insikter/`.
- Required frontmatter: `title`, `slug`, `description`, `date`.

## Deployment
Hosted on GitHub Pages at [https://hylten.github.io/Hylten-Invest/](https://hylten.github.io/Hylten-Invest/).

## Developer instructions for Plåtniklas / Cursor
1. **Design Principle**: Keep it discrete. Avoid flashy animations (except the subtle preloader and fade-ins).
2. **Typography**: Use **Inter** for UI/Body and **Cormorant Garamond** for Emphasis/Headings.
3. **Colors**: White/Black/Muted Gold (`#B08D57`).
