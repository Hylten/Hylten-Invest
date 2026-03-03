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

    const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8')
        .replace(/(href|src)="assets\//g, '$1="/Hylten-Invest/assets/')
        .replace('</head>', '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">\n</head>');

    ensureDir(INSIGHTS_DIST_DIR);

    const files = fs.existsSync(CONTENT_DIR) ? fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md')) : [];

    // 1. Generate Index Page
    let listHtml = `<div style="background: #ffffff; min-height: 100vh; padding: 800px 24px 120px; font-family: 'Inter', sans-serif; color: #1A1A1A; display: flex; flex-direction: column; align-items: center; overflow-x: hidden;">`;
    listHtml += '<div style="width: 100%; max-width: 1200px; margin: 0 auto; text-align: center; display: flex; flex-direction: column; align-items: center;">';
    listHtml += '<nav style="position: fixed; top: 0; left: 0; width: 100%; background: #ffffff; border-bottom: 1px solid rgba(0,0,0,0.05); padding: 24px 40px; display: flex; align-items: center; justify-content: space-between; z-index: 1000; box-sizing: border-box;">';
    listHtml += '  <a href="/Hylten-Invest/" style="text-decoration: none; color: #1A1A1A; display: flex; align-items: center; gap: 12px; font-weight: 500; font-size: 1rem; letter-spacing: 4px; text-transform: uppercase; font-family: serif;">';
    listHtml += '    <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" style="height: 32px; width: auto;" alt="Logo" />';
    listHtml += '    HYLTÉN <span style="font-weight: 300; color: #B08D57;">INVEST</span>';
    listHtml += '  </a>';
    listHtml += '  <span style="font-size: 0.7rem; color: #666; letter-spacing: 2px; text-transform: uppercase;">RETURN TO HOME</span>';
    listHtml += '</nav>';

    listHtml += '<div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 40px;">';
    listHtml += '  <div style="width: 40px; height: 1px; background: rgba(176,141,87,0.3);"></div>';
    listHtml += '  <span style="color: #B08D57; text-transform: uppercase; letter-spacing: 6px; font-size: 0.75rem; font-weight: 600;">Intelligence Report</span>';
    listHtml += '  <div style="width: 40px; height: 1px; background: rgba(176,141,87,0.3);"></div>';
    listHtml += '</div>';

    listHtml += '<h1 style="font-size: clamp(3rem, 8vw, 6rem); color: #1A1A1A; margin-bottom: 40px; font-weight: 300; font-family: serif; letter-spacing: -0.04em; line-height: 1;">Insights <span style="font-style: italic; color: #DDD; font-weight: 200;">Archive</span></h1>';
    listHtml += '<p style="font-size: 1.25rem; color: #666; line-height: 1.8; margin-bottom: 80px; max-width: 650px; margin-left: auto; margin-right: auto; font-weight: 300; border-top: 1px solid #F5F5F5; pt-40px; padding-top: 40px;">Strategic analysis on global asset management, private equity trends, and the architectural evolution of the modern investment landscape.</p>';

    for (const file of files) {
        const filePath = path.join(CONTENT_DIR, file);
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(rawContent);
        const slug = data.slug || file.replace('.md', '');
        const title = data.title || 'Insight';
        const description = data.description || '';
        const date = data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

        listHtml += `
            <article style="margin-bottom: 120px; display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div style="font-size: 12px; color: #B08D57; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 24px; font-weight: 700;">${date}</div>
                <a href="/Hylten-Invest/insights/${slug}/" style="text-decoration: none; color: inherit; display: block; max-width: 800px;">
                    <h2 style="font-size: clamp(2rem, 5vw, 3.5rem); color: #1A1A1A; margin-bottom: 24px; font-weight: 400; font-family: serif; line-height: 1.2;">${title}</h2>
                    <p style="font-size: 1.15rem; color: #555; line-height: 1.8; font-weight: 300; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto;">${description}</p>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <span style="color: #B08D57; font-size: 11px; text-transform: uppercase; letter-spacing: 4px; font-weight: 700;">Read Analysis</span>
                        <div style="width: 32px; height: 1px; background: #B08D57;"></div>
                    </div>
                </a>
            </article>`;
    }
    listHtml += '</div></div>';

    const sharedButtons = `
        <div style="display: flex; justify-content: center; margin-top: 80px; padding-bottom: 120px; width: 100%;">
          <a href="/Hylten-Invest/" style="padding: 14px 32px; background: #FFFFFF; border: 1px solid rgba(0,0,0,0.1); color: #1A1A1A; text-decoration: none; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; font-family: 'Inter', sans-serif; font-weight: 500; display: inline-block; border-radius: 2px;">
            Return Home
          </a>
        </div>
    `;

    const indexHtml = baseHtml
        .replace(/<title>.*?<\/title>/, '<title>Insights Archive | Hyltén Invest</title>')
        .replace(/<meta name="description" content=".*?">/, '<meta name="description" content="Strategic insights, analysis, and deep dives into technology, real estate, and capital deployment strategies.">')
        .replace('<div id="root"></div>', `<div id="root">${listHtml}${sharedButtons}</div>`);

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

        const contentHtml = `<div style="background: #ffffff; min-height: 100vh; padding: 450px 24px 120px; color: #1A1A1A; font-family: 'Inter', sans-serif;">
            <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; align-items: center;">
                <nav style="position: fixed; top: 0; left: 0; width: 100%; background: #ffffff; border-bottom: 1px solid rgba(0,0,0,0.05); padding: 24px 40px; display: flex; align-items: center; justify-content: space-between; z-index: 1000; box-sizing: border-box;">
                  <a href="/Hylten-Invest/" style="text-decoration: none; color: #1A1A1A; display: flex; align-items: center; gap: 10px; font-weight: 500; font-size: 0.85rem; letter-spacing: 1.5px;">
                    <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" style="height: 26px; width: auto;" alt="Logo" />
                    HYLTÉN <span style="font-weight: 300; color: #888;">INVEST</span>
                    <span style="margin-left: 12px; border-left: 1px solid rgba(0,0,0,0.1); padding-left: 12px; font-size: 0.6rem; letter-spacing: 2px; color: #B08D57; font-weight: 500;">RETURN TO HOME</span>
                  </a>
                </nav>
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 40px;">
                    <a href="/Hylten-Invest/insights/" style="text-decoration: none; color: #999; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; display: inline-flex; align-items: center; font-weight: 500;">
                        <span style="margin-right: 8px;">←</span> Archive
                    </a>
                    <span style="color: #DDD;">|</span>
                    <a href="/Hylten-Invest/" style="text-decoration: none; color: #999; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; display: inline-flex; align-items: center; font-weight: 500;">
                        Home
                    </a>
                </div>
                <div style="font-size: 11px; color: #B08D57; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 16px;">Intelligence Report</div>
                <h1 style="font-size: clamp(2rem, 5vw, 3rem); color: #1A1A1A; margin-bottom: 24px; font-weight: 300; line-height: 1.2; font-family: sans-serif; letter-spacing: -0.02em;">${title}</h1>
                <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 40px; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 24px;">Published ${date} • Hyltén Invest Analysis</div>
                <div style="line-height: 1.9; font-size: 1.05rem; color: #444; font-weight: 300;">
                    ${content.split('\\n').map(p => p.trim() ? `<p style="margin-bottom: 28px;">${p}</p>` : '').join('')}
                </div>
                <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid rgba(0,0,0,0.06); text-align: center;">
                    <p style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 3px;">© ${new Date().getFullYear()} Hyltén Invest AB. Internal Research Archive.</p>
                </div>
            </div>
        </div>`;

        const articleHtml = baseHtml
            .replace(/<title>.*?<\/title>/, `<title>${title} | Hyltén Invest</title>`)
            .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${description}">`)
            .replace('<div id="root"></div>', `<div id="root">${contentHtml}${sharedButtons}</div>`);

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
