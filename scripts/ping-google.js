import https from 'https';

const SITE_URL = 'https://hylten.github.io/Hylten-Invest';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

const pingEngines = () => {
    console.log(`📡 Pinging search engines for Sitemap: ${SITEMAP_URL}`);

    // Bing/Yahoo (IndexNow + Sitemap Ping)
    const bingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
    const googleUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;

    const pings = [
        { name: 'Bing', url: bingUrl },
        // While Google officially deprecated pings, sometimes the endpoint still responds for a bit.
        { name: 'Google (Legacy Ping)', url: googleUrl }
    ];

    pings.forEach(engine => {
        https.get(engine.url, (res) => {
            console.log(`✓ ${engine.name} notified. Status: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error(`- Failed to notify ${engine.name}: ${err.message}`);
        });
    });

    console.log('💡 Note: For Google indexing < 60 min, the Google Indexing API is recommended.');
};

pingEngines();
