import https from 'https';

const SITE_URL = 'https://hylteninvest.se';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

const pingEngines = () => {
    console.log(`📡 Sitemap location: ${SITEMAP_URL}`);
    console.log('ℹ️  Note: Google and Bing have deprecated manual sitemap ping endpoints.');
    console.log('✅ Search engines will automatically discover your sitemap via robots.txt.');
    console.log('🔗 For immediate indexing, please use Google Search Console or Bing Webmaster Tools.');
};

pingEngines();
