import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content', 'insights');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const INSIGHTS_DIST_DIR = path.join(DIST_DIR, 'insights');

const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

async function generateSEO() {
    console.log('Generating SEO Static HTML for Hyltén Invest Insights...');

    if (!fs.existsSync(DIST_DIR)) {
        console.error('dist directory not found. Please run npm run build first.');
        process.exit(1);
    }

    const indexHtmlPath = path.join(DIST_DIR, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
        console.error('dist/index.html not found. Please run npm run build first.');
        process.exit(1);
    }

    const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

    ensureDir(INSIGHTS_DIST_DIR);

    const files = fs.existsSync(CONTENT_DIR) ? fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md')) : [];

    // 1. Generate Index Page
    let listHtml = `<div style="background: #ffffff; min-height: 100vh; padding: 120px 24px; font-family: 'Inter', sans-serif; color: #1A1A1A;">`;
    listHtml += '<div style="max-width: 900px; margin: 0 auto;">';
    listHtml += '<span style="color: #B08D57; text-transform: uppercase; letter-spacing: 5px; font-size: 0.75rem; margin-bottom: 20px; display: block; font-weight: 500;">Intelligence & Perspective</span>';
    listHtml += '<h1 style="font-size: clamp(2.5rem, 5vw, 4.5rem); color: #1A1A1A; margin-bottom: 80px; font-weight: 300; font-family: serif; letter-spacing: -0.02em;">Insights Archive</h1>';

    for (const file of files) {
        const filePath = path.join(CONTENT_DIR, file);
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(rawContent);
        const slug = data.slug || file.replace('.md', '');
        const title = data.title || 'Insight';
        const description = data.description || '';
        const date = data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

        listHtml += `
            <article style="margin-bottom: 80px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 60px;">
                <div style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px;">${date}</div>
                <a href="/Hylten-Invest/insights/${slug}/" style="text-decoration: none; color: inherit; display: block;">
                    <h2 style="font-size: 2.2rem; color: #1A1A1A; margin-bottom: 20px; font-weight: 400; font-family: serif; transition: color 0.3s;">${title}</h2>
                    <p style="font-size: 1rem; color: #555; line-height: 2; font-weight: 300; max-width: 700px; margin-bottom: 30px;">${description}</p>
                    <span style="color: #B08D57; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; display: inline-flex; align-items: center; font-weight: 500;">Access Report <span style="margin-left: 10px;">→</span></span>
                </a>
            </article>`;
    }
    listHtml += '</div></div>';

    const indexHtml = baseHtml
        .replace(/<title>.*?<\/title>/, '<title>Insights Archive | Hyltén Invest</title>')
        .replace(/<meta name="description" content=".*?">/, '<meta name="description" content="Strategic insights, analysis, and deep dives into technology, real estate, and capital deployment strategies.">')
        .replace('<div id="root"></div>', `<div id="root">${listHtml}</div>`);

    fs.writeFileSync(path.join(INSIGHTS_DIST_DIR, 'index.html'), indexHtml);
    console.log('✅ Generated /dist/insights/index.html');

    // 2. Generate Article Pages
    for (const file of files) {
        const filePath = path.join(CONTENT_DIR, file);
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(rawContent);

        const slug = data.slug || file.replace('.md', '');
        const title = data.title || 'Insight';
        const description = data.description || '';
        const date = data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

        const articleDir = path.join(INSIGHTS_DIST_DIR, slug);
        ensureDir(articleDir);

        const contentHtml = `<div style="background: #ffffff; min-height: 100vh; padding: 120px 24px; color: #1A1A1A; font-family: 'Inter', sans-serif;">
            <div style="max-width: 800px; margin: 0 auto;">
                <a href="/Hylten-Invest/insights/" style="text-decoration: none; color: #999; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 60px; display: inline-flex; align-items: center; font-weight: 500; transition: color 0.3s;">
                    <span style="margin-right: 10px;">←</span> Back to Insights
                </a>
                <div style="font-size: 11px; color: #B08D57; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 20px;">Intelligence Report</div>
                <h1 style="font-size: clamp(2.5rem, 6vw, 4.5rem); color: #1A1A1A; margin-bottom: 40px; font-weight: 300; line-height: 1.1; font-family: serif; letter-spacing: -0.02em;">${title}</h1>
                <div style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 60px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 30px;">Published ${date} • Hyltén Invest Analysis</div>
                <div style="line-height: 2.1; font-size: 1.1rem; color: #444; font-weight: 300;">
                    ${content.split('\n').map(p => p.trim() ? `<p style="margin-bottom: 35px;">${p}</p>` : '').join('')}
                </div>
                <div style="margin-top: 100px; padding-top: 40px; border-top: 1px solid rgba(0,0,0,0.05); text-align: center;">
                    <p style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 3px;">© ${new Date().getFullYear()} Hyltén Invest AB. Internal Research Archive.</p>
                </div>
            </div>
        </div>`;

        const articleHtml = baseHtml
            .replace(/<title>.*?<\/title>/, `<title>${title} | Hyltén Invest</title>`)
            .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${description}">`)
            .replace('<div id="root"></div>', `<div id="root">${contentHtml}</div>`);

        fs.writeFileSync(path.join(articleDir, 'index.html'), articleHtml);
        console.log(`✅ Generated /dist/insights/${slug}/index.html`);
    }

    // 3. Generate articles.json for hydration
    const articlesJson = files.map(file => {
        const filePath = path.join(CONTENT_DIR, file);
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(rawContent);
        return {
            slug: data.slug || file.replace('.md', ''),
            title: data.title || 'Insight',
            description: data.description || '',
            date: data.date || ''
        };
    });
    fs.writeFileSync(path.join(INSIGHTS_DIST_DIR, 'articles.json'), JSON.stringify(articlesJson));
    console.log('✅ Generated /dist/insights/articles.json');

    // 4. Generate sitemap.xml
    const SITE_URL = 'https://hylten.github.io/Hylten-Invest';
    const today = new Date().toISOString().split('T')[0];

    let sitemapUrls = `  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/insights/</loc>
    <lastmod>${today}</lastmod>
    <priority>0.9</priority>
  </url>`;

    for (const art of articlesJson) {
        sitemapUrls += `
  <url>
    <loc>${SITE_URL}/insights/${art.slug}/</loc>
    <lastmod>${art.date || today}</lastmod>
    <priority>0.8</priority>
  </url>`;
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>`;

    fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
    console.log('✅ Generated /dist/sitemap.xml');

    // 5. Generate robots.txt
    const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`;

    fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robots);
    console.log('✅ Generated /dist/robots.txt');

    // 6. Generate RSS Feed (Hyltén Intelligence Feed)
    let rssItems = '';
    for (const art of articlesJson) {
        rssItems += `
    <item>
      <title>${art.title.replace(/&/g, '&amp;')}</title>
      <link>${SITE_URL}/insights/${art.slug}/</link>
      <description>${art.description.replace(/&/g, '&amp;')}</description>
      <pubDate>${new Date(art.date || today).toUTCString()}</pubDate>
      <guid>${SITE_URL}/insights/${art.slug}/</guid>
    </item>`;
    }

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Hyltén Invest Intelligence</title>
  <link>${SITE_URL}/insights/</link>
  <description>Strategic analysis from Hyltén Invest Portfolio & Research.</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${rssItems}
</channel>
</rss>`;

    fs.writeFileSync(path.join(DIST_DIR, 'feed.xml'), rss);
    console.log('✅ Generated /dist/feed.xml');

    console.log('SEO Generation Complete!');
}

generateSEO().catch(console.error);
