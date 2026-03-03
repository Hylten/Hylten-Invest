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
    let listHtml = `<div style="background: #ffffff; min-height: 100vh; padding: 100px 24px 60px; font-family: 'Inter', sans-serif; color: #1A1A1A; display: flex; flex-direction: column; align-items: center;">`;
    listHtml += '<div style="max-width: 800px; margin: 0 auto; text-align: center;">';
    listHtml += '<nav style="position: fixed; top: 0; left: 0; width: 100%; background: rgba(255,255,255,0.95); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.06); padding: 18px 40px; display: flex; align-items: center; justify-content: flex-start; z-index: 1000; box-sizing: border-box;">';
    listHtml += '  <a href="/Hylten-Invest/" style="text-decoration: none; color: #1A1A1A; display: flex; align-items: center; gap: 10px; font-weight: 500; font-size: 0.85rem; letter-spacing: 1.5px;">';
    listHtml += '    <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" style="height: 26px; width: auto;" alt="Logo" />';
    listHtml += '    HYLTÉN <span style="font-weight: 300; color: #888;">INVEST</span>';
    listHtml += '    <span style="margin-left: 12px; border-left: 1px solid rgba(0,0,0,0.1); padding-left: 12px; font-size: 0.6rem; letter-spacing: 2px; color: #B08D57; font-weight: 500;">RETURN TO HOME</span>';
    listHtml += '  </a>';
    listHtml += '</nav>';
    listHtml += '<span style="color: #B08D57; text-transform: uppercase; letter-spacing: 5px; font-size: 0.7rem; margin-bottom: 12px; display: block; font-weight: 500;">Intelligence &amp; Perspective</span>';
    listHtml += '<h1 style="font-size: clamp(2rem, 4vw, 3rem); color: #1A1A1A; margin-bottom: 16px; font-weight: 300; font-family: sans-serif; letter-spacing: -0.02em;">Insights Archive</h1>';
    listHtml += '<p style="font-size: 0.95rem; color: #777; line-height: 1.7; margin-bottom: 50px; max-width: 600px; margin-left: auto; margin-right: auto;">Strategic analysis on asset management, market trends, and the evolution of the investment landscape.</p>';

    for (const file of files) {
        const filePath = path.join(CONTENT_DIR, file);
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(rawContent);
        const slug = data.slug || file.replace('.md', '');
        const title = data.title || 'Insight';
        const description = data.description || '';
        const date = data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

        listHtml += `
            <article style="margin-bottom: 40px; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 40px;">
                <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">${date}</div>
                <a href="/Hylten-Invest/insights/${slug}/" style="text-decoration: none; color: inherit; display: block;">
                    <h2 style="font-size: 1.5rem; color: #1A1A1A; margin-bottom: 10px; font-weight: 400; font-family: sans-serif;">${title}</h2>
                    <p style="font-size: 0.95rem; color: #666; line-height: 1.7; font-weight: 300; max-width: 650px; margin-bottom: 16px; margin-left: auto; margin-right: auto;">${description}</p>
                    <span style="color: #B08D57; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; display: inline-flex; align-items: center; font-weight: 500;">Read Report <span style="margin-left: 8px;">→</span></span>
                </a>
            </article>`;
    }
    listHtml += '</div></div>';

    const sharedButtons = `
        <div style="display: flex; justify-content: center; margin-top: 40px; padding-bottom: 50px; width: 100%;">
          <a href="/Hylten-Invest/" style="padding: 10px 24px; background: #FFFFFF; border: 1px solid rgba(0,0,0,0.1); color: #1A1A1A; text-decoration: none; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0,0,0,0.06); font-family: 'Inter', sans-serif; font-weight: 500; display: inline-block; border-radius: 2px;">
            Return Home
          </a>
        </div>
        <a href="https://wa.me/46701619978?text=Regarding%20Hylt%C3%A9n%20Invest:" target="_blank" rel="noopener noreferrer" style="position: fixed; bottom: 28px; right: 28px; z-index: 10001; background: #1A1A1A; padding: 10px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; box-sizing: border-box; opacity: 0.5;">
          <svg style="width: 18px; height: 18px; display: block;" fill="#FFFFFF" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
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

        const contentHtml = `<div style="background: #ffffff; min-height: 100vh; padding: 100px 24px 60px; color: #1A1A1A; font-family: 'Inter', sans-serif;">
            <div style="max-width: 700px; margin: 0 auto;">
                <nav style="position: fixed; top: 0; left: 0; width: 100%; background: rgba(255,255,255,0.95); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.06); padding: 18px 40px; display: flex; align-items: center; justify-content: flex-start; z-index: 1000; box-sizing: border-box;">
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
