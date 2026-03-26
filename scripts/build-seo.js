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


    // Tracking Injection
    let trackingScript = '';
    try {
        const configPath = path.join(__dirname, '../../seo_config.json');
        if (fs.existsSync(configPath)) {
            const seoConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (seoConfig.tracking.google_analytics_id) {
                trackingScript += `
                <!-- Google tag (gtag.js) -->
                <script async src="https://www.googletagmanager.com/gtag/js?id=${seoConfig.tracking.google_analytics_id}"></script>
                <script>
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${seoConfig.tracking.google_analytics_id}');
                </script>`;
            }
            if (seoConfig.tracking.search_console_id) {
                trackingScript += `
<meta name="google-site-verification" content="${seoConfig.tracking.search_console_id}" />`;
            }
        }
    } catch (e) {
        console.warn('⚠️ No seo_config.json found or failed to parse. Skipping tracking injection.');
    }

    const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8')
        .replace('</head>', `${trackingScript}
</head>`);

    ensureDir(INSIGHTS_DIST_DIR);

    const files = fs.existsSync(CONTENT_DIR) ? fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md')) : [];

    // Process files for navigation
    const yearData = {}, quarterData = {}, fileData = [];
    for (const file of files) {
        const filePath = path.join(CONTENT_DIR, file);
        const rawContent = fs.readFileSync(filePath, 'utf8');
        let data = {}, content = '';
        try {
            const parsed = matter(rawContent);
            data = parsed.data || {};
            content = parsed.content || '';
        } catch (e) { continue; }
        const slug = data.slug || file.replace('.md', '');
        const title = data.title || 'Insight';
        const description = data.description || '';
        const dateStr = data.date || '';
        const date = dateStr ? new Date(dateStr) : null;
        const year = date ? date.getFullYear().toString() : '';
        const quarter = date ? `Q${Math.floor((date.getMonth() + 3) / 3)} ${year}` : '';
        const wordCount = content.split(/\s+/).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));
        fileData.push({ slug, title, description, date: dateStr, year, quarter, readTime, file });
        if (year && !yearData[year]) yearData[year] = [];
        if (year) yearData[year].push(slug);
    }
    const years = Object.keys(yearData).sort().reverse();
    const hasMultipleYears = years.length > 1;

    const navStyles = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;700&display=swap');
        .insights-page-wrapper a { color: #000000 !important; text-decoration: none !important; transition: color 0.3s; }
        .insights-page-wrapper a:hover { color: #B08D57 !important; }
        #root, #root > div { width: 100% !important; margin: 0 !important; padding: 0 !important; }
        .year-nav { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 30px; }
        .year-box { display: inline-block; padding: 10px 18px; background: transparent; border: 1px solid rgba(0,0,0,0.1); color: #666; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: 0.3s; }
        .year-box:hover { border-color: #B08D57; color: #000; }
        .year-box.active { background: #B08D57; border-color: #B08D57; color: #fff; }
        .search-box { max-width: 400px; margin: 0 auto 40px; }
        .search-input { width: 100%; padding: 14px 20px; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.1); color: #000; font-size: 14px; font-family: 'Inter', sans-serif; outline: none; }
        .search-input:focus { border-color: #B08D57; }
        .search-input::placeholder { color: #999; }
        .read-time { color: #999; margin-left: 10px; font-size: 10px; }
    </style>`;
    const filterScript = `
    <script>
        let activeYear = 'all';
        function filterYear(year, el) {
            activeYear = year;
            document.querySelectorAll('.year-box').forEach(b => b.classList.remove('active'));
            el.classList.add('active');
            document.querySelector('.search-input').value = '';
            document.querySelectorAll('.arch-item').forEach(item => {
                if (year === 'all' || item.dataset.year === year) item.style.display = 'block';
                else item.style.display = 'none';
            });
        }
        function searchItems(query) {
            query = query.toLowerCase();
            document.querySelectorAll('.arch-item').forEach(item => {
                const title = (item.querySelector('h2')?.textContent || '').toLowerCase();
                const desc = (item.querySelector('.desc')?.textContent || '').toLowerCase();
                if (!query || title.includes(query) || desc.includes(query)) item.style.display = 'block';
                else item.style.display = 'none';
            });
            if (query) document.querySelectorAll('.year-box').forEach(b => b.classList.remove('active'));
        }
    </script>`;
    const yearNav = hasMultipleYears ? `<div class="year-nav"><span class="year-box active" onclick="filterYear('all', this)">All</span>${years.map(y => `<span class="year-box" data-year="${y}" onclick="filterYear('${y}', this)">${y}</span>`).join('')}</div>` : '';
    const searchBox = `<div class="search-box"><input type="text" class="search-input" placeholder="Search insights..." onkeyup="searchItems(this.value)"></div>`;

    // 1. Generate Index Page
    let listHtml = navStyles + filterScript + yearNav + searchBox + `
    <div class="insights-page-wrapper" style="background: #ffffff !important; min-height: 100vh; padding: 0 !important; margin: 0 !important; font-family: 'Inter', sans-serif; color: #1A1A1A; display: flex; flex-direction: column; align-items: center; overflow-x: hidden;">`;
    listHtml += '<div style="width: 100%; max-width: 1240px; margin: 180px auto 120px; text-align: center; display: flex; flex-direction: column; align-items: center;">';
    listHtml += '<nav style="position: fixed; top: 0; left: 0; width: 100%; background: #ffffff !important; border-bottom: 1px solid rgba(0,0,0,0.05); padding: 24px 40px; display: flex; align-items: center; justify-content: space-between; z-index: 9999; box-sizing: border-box;">';
    listHtml += '  <a href="/Hylten-Invest/" style="text-decoration: none !important; color: #1A1A1A !important; display: flex; align-items: center; gap: 12px; font-weight: 500; font-size: 1rem; letter-spacing: 4px; text-transform: uppercase;">';
    listHtml += '    <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" style="height: 32px; width: auto;" alt="Logo" />';
    listHtml += '    HYLTÉN <span style="font-weight: 300; color: #B08D57;">INVEST</span>';
    listHtml += '  </a>';
    listHtml += '  <span style="font-size: 0.7rem; color: #666; letter-spacing: 2px; text-transform: uppercase; font-family: sans-serif;">RETURN TO HOME</span>';
    listHtml += '</nav>';

    listHtml += '<div style="display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 48px; width: 100%;">';
    listHtml += '  <div style="width: 60px; height: 1px; background: rgba(176,141,87,0.3);"></div>';
    listHtml += '  <span style="color: #B08D57; text-transform: uppercase; letter-spacing: 6px; font-size: 0.75rem; font-weight: 700;">Intelligence report</span>';
    listHtml += '  <div style="width: 60px; height: 1px; background: rgba(176,141,87,0.3);"></div>';
    listHtml += '</div>';

    listHtml += '<h1 style="font-size: clamp(3.5rem, 10vw, 8rem); color: #000000 !important; margin-bottom: 60px; font-weight: 400; font-family: serif; letter-spacing: -0.05em; line-height: 1; text-align: center;">Insights <span style="font-style: italic; color: #D1D5DB; font-weight: 300; letter-spacing: -0.02em;">Archive</span></h1>';
    listHtml += '<p style="font-size: 1.25rem; color: #4B5563; max-width: 700px; margin: 0 auto 200px; line-height: 1.6; font-weight: 300; text-align: center;">Strategic analysis on global asset management, private equity trends, and the architectural evolution of the modern investment landscape.</p>';

    // Use fileData for the list
    fileData.forEach((fd, index) => {
        const displayIndex = (fileData.length - index).toString().padStart(2, '0');
        const dateDisplay = fd.date ? new Date(fd.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        listHtml += `
            <article class="arch-item" data-year="${fd.year}" style="margin-bottom: 300px; width: 100%; max-width: 900px; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; padding-bottom: 150px; border-bottom: 1px solid rgba(0,0,0,0.05);">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 24px; margin-bottom: 80px;">
                    <span style="font-size: 10px; color: #B08D57; letter-spacing: 8px; font-weight: 800; text-transform: uppercase;">INSIGHT NO. ${displayIndex}</span>
                    <div style="width: 1px; height: 40px; background: #B08D57;"></div>
                </div>
                
                <a href="/Hylten-Invest/insights/${fd.slug}/" style="text-decoration: none !important; color: #000000 !important; display: block; width: 100%;">
                    <div style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 5px; margin-bottom: 80px; font-weight: 600;">Published &mdash; ${dateDisplay} <span class="read-time">${fd.readTime} min</span></div>
                    <h2 style="font-size: clamp(2.2rem, 5vw, 4.2rem); color: #000000 !important; margin-bottom: 40px; font-weight: 400; font-family: serif; line-height: 1.2; text-align: center; max-width: 850px; margin-left: auto; margin-right: auto;">${fd.title}</h2>
                    <p class="desc" style="font-size: 1.25rem; color: #4B5563 !important; line-height: 1.8; font-weight: 300; margin-bottom: 60px; max-width: 600px; margin-left: auto; margin-right: auto; text-align: center; font-style: italic;">${fd.description}</p>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <span style="color: #000; font-size: 10px; text-transform: uppercase; letter-spacing: 4px; font-weight: 700; border-bottom: 1px solid #B08D57; padding-bottom: 8px; transition: all 0.3s;">Explore Briefing</span>
                    </div>
                </a>
            </article>`;
    });
    listHtml += '</div></div>';

    const sharedButtons = `
        <div style="display: flex; justify-content: center; margin-top: 80px; padding-bottom: 150px; width: 100%; background: #ffffff;">
          <a href="/Hylten-Invest/" style="padding: 16px 36px; background: #FFFFFF; border: 1px solid rgba(0,0,0,0.15); color: #000000 !important; text-decoration: none !important; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; font-family: sans-serif; font-weight: 600; display: inline-block; border-radius: 2px;">
            Return Home
          </a>
        </div>
        <div style="text-align: center; margin-top: 80px; padding-top: 40px; border-top: 1px solid rgba(0,0,0,0.05);">
          <a href="https://www.linkedin.com/in/hylten/" target="_blank" rel="noopener noreferrer" style="color: #999; font-size: 12px; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">LinkedIn</a>
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
        const dateRaw = data.date || '';
        const date = dateRaw ? new Date(dateRaw).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        const dateObj = dateRaw ? new Date(dateRaw) : null;
        const year = dateObj ? dateObj.getFullYear().toString() : '';
        const wordCount = content.split(/\s+/).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));

        const articleDir = path.join(INSIGHTS_DIST_DIR, slug);
        ensureDir(articleDir);

        // Schema
        const schema = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": title,
            "description": description,
            "author": { "@type": "Person", "name": "Hyltén Invest" },
            "datePublished": dateRaw,
            "url": `https://hylten.github.io/Hylten-Invest/insights/${slug}/`
        };

        // Breadcrumb
        const breadcrumb = year ? `
            <div style="margin-bottom: 20px;">
                <a href="/Hylten-Invest/insights/" style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Insights</a>
                <span style="font-size: 10px; color: #ccc; margin: 0 8px;">/</span>
                <a href="/Hylten-Invest/insights/?year=${year}" style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px;">${year}</a>
            </div>` : '';

        const contentHtml = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;700&display=swap');
            .insights-page-wrapper a { color: #000000 !important; text-decoration: none !important; transition: color 0.3s; }
            .insights-page-wrapper a:hover { color: #B08D57 !important; }
            #root, #root > div { width: 100% !important; margin: 0 !important; padding: 0 !important; }
        </style>
        <div class="insights-page-wrapper" style="background: #ffffff !important; min-height: 100vh; padding: 0 !important; margin: 0 !important; font-family: 'Inter', sans-serif; color: #1A1A1A; display: flex; flex-direction: column; align-items: center; overflow-x: hidden;">
            <div style="width: 100%; max-width: 1240px; margin: 220px auto 120px; text-align: center; display: flex; flex-direction: column; align-items: center; padding: 0 24px;">
                <nav style="position: fixed; top: 0; left: 0; width: 100%; background: #ffffff !important; border-bottom: 1px solid rgba(0,0,0,0.05); padding: 24px 40px; display: flex; align-items: center; justify-content: space-between; z-index: 9999; box-sizing: border-box;">
                  <a href="/Hylten-Invest/" style="text-decoration: none !important; color: #1A1A1A !important; display: flex; align-items: center; gap: 12px; font-weight: 500; font-size: 1rem; letter-spacing: 4px; text-transform: uppercase;">
                    <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" style="height: 32px; width: auto;" alt="Logo" />
                    HYLTÉN <span style="font-weight: 300; color: #B08D57;">INVEST</span>
                  </a>
                  <span style="font-size: 0.7rem; color: #666; letter-spacing: 2px; text-transform: uppercase;">INTELLIGENCE</span>
                </nav>
                <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 64px;">
                    <a href="/Hylten-Invest/insights/" style="text-decoration: none !important; color: #B08D57 !important; font-size: 13px; text-transform: uppercase; letter-spacing: 4px; font-weight: 700;">← Archive</a>
                    <span style="color: #DDD;">|</span>
                    <a href="/Hylten-Invest/" style="text-decoration: none !important; color: #9CA3AF !important; font-size: 13px; text-transform: uppercase; letter-spacing: 4px; font-weight: 500;">Home</a>
                </div>
                ${breadcrumb}
                <div style="font-size: 14px; color: #B08D57; text-transform: uppercase; letter-spacing: 6px; margin-bottom: 32px; font-weight: 800;">Intelligence Report</div>
                <h1 style="font-size: clamp(2.5rem, 6vw, 4.5rem); color: #000000 !important; margin-bottom: 40px; font-weight: 400; line-height: 1.1; font-family: serif; text-align: center;">${title}</h1>
                <div style="font-size: 14px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 80px; border-bottom: 1px solid #F3F4F6; padding-bottom: 48px; width: 100%; text-align: center;">Published ${date} • <span style="color: #B08D57;">${readTime} min read</span> • Hyltén Invest Portfolio Strategy</div>
                <div style="line-height: 2.1; font-size: 1.35rem; color: #374151 !important; font-weight: 300; width: 100%; max-width: 800px; text-align: left; margin: 0 auto;">
                    ${content.split('\n').map(p => {
            p = p.trim();
            if (!p) return '';
            if (p.startsWith('### ')) return `<h3 style="font-size: 1.5rem; color: #000; margin-top: 40px; margin-bottom: 20px; font-weight: 500; font-family: serif;">${p.replace('### ', '')}</h3>`;
            if (p.startsWith('## ')) return `<h2 style="font-size: 2rem; color: #000; margin-top: 60px; margin-bottom: 30px; font-weight: 500; font-family: serif;">${p.replace('## ', '')}</h2>`;
            p = p.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #000; font-weight: 600;">$1</strong>');
            return `<p style="margin-bottom: 48px;">${p}</p>`;
        }).join('')}
                </div>
                <div style="margin-top: 100px; padding-top: 48px; border-top: 1px solid #F3F4F6; text-align: center; width: 100%;">
                    <a href="/Hylten-Invest/" style="display: inline-block; padding: 16px 40px; border: 1px solid #E5E7EB; color: #000000; text-decoration: none; text-transform: uppercase; letter-spacing: 4px; font-size: 12px; font-weight: 600;">Return to Home</a>
                </div>
            </div>
        </div>`;

        const articleHtml = baseHtml
            .replace(/<title>.*?<\/title>/, `<title>${title} | Hyltén Invest</title>`)
            .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${description}">`)
            .replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`)
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
