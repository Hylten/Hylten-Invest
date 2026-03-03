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
    let listHtml = `<div style="background: #ffffff !important; min-height: 100vh; padding: 0 !important; margin: 0 !important; font-family: 'Inter', sans-serif; color: #1A1A1A; display: flex; flex-direction: column; align-items: center; overflow-x: hidden;">`;
    listHtml += '<div style="width: 100%; max-width: 1200px; margin: 0 auto; text-align: center; display: flex; flex-direction: column; align-items: center; padding-top: 500px; padding-bottom: 120px;">';
    listHtml += '<nav style="position: fixed; top: 0; left: 0; width: 100%; background: #ffffff !important; border-bottom: 1px solid rgba(0,0,0,0.05); padding: 24px 40px; display: flex; align-items: center; justify-content: space-between; z-index: 9999; box-sizing: border-box;">';
    listHtml += '  <a href="/Hylten-Invest/" style="text-decoration: none !important; color: #1A1A1A !important; display: flex; align-items: center; gap: 12px; font-weight: 500; font-size: 1rem; letter-spacing: 4px; text-transform: uppercase; font-family: serif;">';
    listHtml += '    <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" style="height: 32px; width: auto;" alt="Logo" />';
    listHtml += '    HYLTÉN <span style="font-weight: 300; color: #B08D57;">INVEST</span>';
    listHtml += '  </a>';
    listHtml += '  <span style="font-size: 0.7rem; color: #666; letter-spacing: 2px; text-transform: uppercase; font-family: sans-serif;">RETURN TO HOME</span>';
    listHtml += '</nav>';

    listHtml += '<div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 40px; width: 100%;">';
    listHtml += '  <div style="width: 50px; height: 1px; background: #B08D57;"></div>';
    listHtml += '  <span style="color: #B08D57; text-transform: uppercase; letter-spacing: 6px; font-size: 0.8rem; font-weight: 700;">Intelligence Archive</span>';
    listHtml += '  <div style="width: 50px; height: 1px; background: #B08D57;"></div>';
    listHtml += '</div>';

    listHtml += '<h1 style="font-size: clamp(3rem, 10vw, 7rem); color: #000000 !important; margin-bottom: 40px; font-weight: 400; font-family: serif; letter-spacing: -0.04em; line-height: 1; text-align: center;">Insights <span style="font-style: italic; color: #EEEEEE; font-weight: 200;">Archive</span></h1>';
    listHtml += '<p style="font-size: 1.25rem; color: #555555 !important; line-height: 1.8; margin-bottom: 80px; max-width: 700px; margin-left: auto; margin-right: auto; font-weight: 300; text-align: center;">Strategic analysis on global asset management, private equity trends, and the architectural evolution of the modern investment landscape.</p>';

    for (const file of files) {
        const filePath = path.join(CONTENT_DIR, file);
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(rawContent);
        const slug = data.slug || file.replace('.md', '');
        const title = data.title || 'Insight';
        const description = data.description || '';
        const date = data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

        listHtml += `
            <article style="margin-bottom: 120px; width: 100%; max-width: 900px; display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div style="font-size: 13px; color: #B08D57; text-transform: uppercase; letter-spacing: 5px; margin-bottom: 24px; font-weight: 800;">${date}</div>
                <a href="/Hylten-Invest/insights/${slug}/" style="text-decoration: none !important; color: #000000 !important; display: block; width: 100%;">
                    <h2 style="font-size: clamp(2.5rem, 6vw, 4rem); color: #000000 !important; margin-bottom: 24px; font-weight: 400; font-family: serif; line-height: 1.2; text-align: center;">${title}</h2>
                    <p style="font-size: 1.2rem; color: #444444 !important; line-height: 1.8; font-weight: 300; margin-bottom: 32px; max-width: 650px; margin-left: auto; margin-right: auto; text-align: center;">${description}</p>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                        <span style="color: #B08D57; font-size: 12px; text-transform: uppercase; letter-spacing: 5px; font-weight: 700;">Read Analysis</span>
                        <div style="width: 40px; height: 1px; background: #B08D57;"></div>
                    </div>
                </a>
            </article>`;
    }
    listHtml += '</div></div>';

    const sharedButtons = `
        <div style="display: flex; justify-content: center; margin-top: 80px; padding-bottom: 150px; width: 100%; background: #ffffff;">
          <a href="/Hylten-Invest/" style="padding: 16px 36px; background: #FFFFFF; border: 1px solid rgba(0,0,0,0.15); color: #000000 !important; text-decoration: none !important; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; font-family: sans-serif; font-weight: 600; display: inline-block; border-radius: 2px;">
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

        const contentHtml = `<div style="background: #ffffff !important; min-height: 100vh; padding: 400px 24px 120px; color: #1A1A1A; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center;">
            <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; width: 100%;">
                <nav style="position: fixed; top: 0; left: 0; width: 100%; background: #ffffff !important; border-bottom: 1px solid rgba(0,0,0,0.05); padding: 24px 40px; display: flex; align-items: center; justify-content: space-between; z-index: 9999; box-sizing: border-box;">
                  <a href="/Hylten-Invest/" style="text-decoration: none !important; color: #000000 !important; display: flex; align-items: center; gap: 12px; font-weight: 500; font-size: 1rem; letter-spacing: 4px; text-transform: uppercase; font-family: serif;">
                    <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" style="height: 32px; width: auto;" alt="Logo" />
                    HYLTÉN <span style="font-weight: 300; color: #B08D57;">INVEST</span>
                  </a>
                  <span style="font-size: 0.7rem; color: #666; letter-spacing: 2px; text-transform: uppercase; font-family: sans-serif;">INTELLIGENCE</span>
                </nav>
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 60px;">
                    <a href="/Hylten-Invest/insights/" style="text-decoration: none !important; color: #B08D57 !important; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-weight: 700;">← Archive</a>
                    <span style="color: #DDD;">|</span>
                    <a href="/Hylten-Invest/" style="text-decoration: none !important; color: #999 !important; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-weight: 500;">Home</a>
                </div>
                <div style="font-size: 12px; color: #B08D57; text-transform: uppercase; letter-spacing: 5px; margin-bottom: 24px; font-weight: 800; text-align: center;">Intelligence Report</div>
                <h1 style="font-size: clamp(2.5rem, 6vw, 4.5rem); color: #000000 !important; margin-bottom: 32px; font-weight: 400; line-height: 1.1; font-family: serif; text-align: center;">${title}</h1>
                <div style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 60px; border-bottom: 1px solid #F0F0F0; padding-bottom: 32px; width: 100%; text-align: center;">Published ${date} • Hyltén Invest Analysis</div>
                <div style="line-height: 2; font-size: 1.25rem; color: #333333 !important; font-weight: 300; width: 100%;">
                    ${content.split('\\n').map(p => p.trim() ? `<p style="margin-bottom: 40px;">${p}</p>` : '').join('')}
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
