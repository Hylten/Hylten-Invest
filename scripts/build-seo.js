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
    let listHtml = '<div style="background: #ffffff; min-height: 100vh; padding: 100px 20px; font-family: sans-serif;">';
    listHtml += '<div style="max-width: 800px; margin: 0 auto;">';
    listHtml += '<h1 style="font-size: 3rem; color: #2C2C2C; margin-bottom: 50px; font-weight: 300; font-family: serif;">Insights & Analysis</h1>';

    for (const file of files) {
        const filePath = path.join(CONTENT_DIR, file);
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(rawContent);
        const slug = data.slug || file.replace('.md', '');
        const title = data.title || 'Insight';
        const description = data.description || '';

        listHtml += `
            <div style="margin-bottom: 60px; border-bottom: 1px solid rgba(176,141,87,0.1); padding-bottom: 40px;">
                <a href="/Hylten-Invest/insights/${slug}/" style="text-decoration: none; color: inherit;">
                    <h2 style="font-size: 1.8rem; color: #2C2C2C; margin-bottom: 15px; font-weight: 400; font-family: serif;">${title}</h2>
                    <p style="font-size: 0.95rem; color: #666; line-height: 1.8;">${description}</p>
                    <span style="color: #B08D57; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; margin-top: 20px; display: block; font-weight: 500;">Read More →</span>
                </a>
            </div>`;
    }
    listHtml += '</div></div>';

    const indexHtml = baseHtml
        .replace(/<title>.*?<\/title>/, '<title>Insights | Hyltén Invest</title>')
        .replace(/<meta name="description" content=".*?">/, '<meta name="description" content="Strategic insights on tech investments, real estate markets, and entrepreneurship.">')
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

        const articleDir = path.join(INSIGHTS_DIST_DIR, slug);
        ensureDir(articleDir);

        const contentHtml = `<div style="background: #ffffff; min-height: 100vh; padding: 100px 20px; color: #2C2C2C; font-family: sans-serif;">
            <div style="max-width: 800px; margin: 0 auto;">
                <a href="/Hylten-Invest/insights/" style="text-decoration: none; color: #B08D57; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 40px; display: block; font-weight: 500;">← Back to Insights</a>
                <h1 style="font-size: 3.5rem; color: #2C2C2C; margin-bottom: 30px; font-weight: 300; line-height: 1.2; font-family: serif;">${title}</h1>
                <div style="line-height: 2; font-size: 1.1rem; color: #555; font-weight: 300;">
                    ${content.split('\n').map(p => p.trim() ? `<p style="margin-bottom: 25px;">${p}</p>` : '').join('')}
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

    console.log('SEO Generation Complete!');
}

generateSEO().catch(console.error);
