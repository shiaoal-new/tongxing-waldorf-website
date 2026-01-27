
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { glob } from 'glob';

// Configuration
const BASE_DIR = process.cwd();
const DATA_PAGES_DIR = path.join(BASE_DIR, 'src/data/pages');
const DATA_COURSES_DIR = path.join(BASE_DIR, 'src/data/courses');
const SETTINGS_FILE = path.join(BASE_DIR, 'src/data/settings/site-settings.yml');
const PUBLIC_DIR = path.join(BASE_DIR, 'public');

interface SiteSettings {
    url: string;
    [key: string]: any;
}

interface SitemapUrl {
    loc: string;
    lastmod: string;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
}

async function generateSitemap() {
    console.log('🗺️  Starting Sitemap Generation...');

    // 1. Read Base URL
    let baseUrl = 'https://tongxing.org.tw'; // Default fallback
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const settings = yaml.load(fs.readFileSync(SETTINGS_FILE, 'utf8')) as SiteSettings;
            if (settings.url) {
                baseUrl = settings.url.replace(/\/$/, '');
            }
        } else {
            console.warn('⚠️  site-settings.yml not found, using default URL.');
        }
    } catch (error) {
        console.warn('⚠️  Error reading site-settings.yml, using default URL:', error);
    }

    console.log(`🔗 Base URL: ${baseUrl}`);

    const urls: SitemapUrl[] = [];

    // Helper to add URL
    const addUrl = (relativePath: string, filePath: string, priority: number = 0.5, changefreq: SitemapUrl['changefreq'] = 'weekly') => {
        try {
            const stats = fs.statSync(filePath);
            urls.push({
                loc: `${baseUrl}${relativePath}`,
                lastmod: stats.mtime.toISOString(),
                changefreq,
                priority
            });
        } catch (e) {
            console.error(`Error processing ${filePath}:`, e);
        }
    };

    // 2. Scan Pages
    // Home Page (from index.yml)
    const indexFile = path.join(DATA_PAGES_DIR, 'index.yml');
    if (fs.existsSync(indexFile)) {
        addUrl('/', indexFile, 1.0, 'daily');
    }

    // Other Pages in src/data/pages
    if (fs.existsSync(DATA_PAGES_DIR)) {
        const pageFiles = await glob('*.yml', { cwd: DATA_PAGES_DIR });
        for (const file of pageFiles) {
            if (file === 'index.yml') continue;
            const slug = file.replace('.yml', '');
            addUrl(`/${slug}`, path.join(DATA_PAGES_DIR, file), 0.8, 'weekly');
        }
    }

    // Courses in src/data/courses
    if (fs.existsSync(DATA_COURSES_DIR)) {
        const courseFiles = await glob('*.yml', { cwd: DATA_COURSES_DIR });
        for (const file of courseFiles) {
            const slug = file.replace('.yml', '');
            addUrl(`/courses/${slug}`, path.join(DATA_COURSES_DIR, file), 0.8, 'monthly');
        }
    }

    // 3. Generate Sitemap XML
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

    // 4. Write sitemap.xml
    if (!fs.existsSync(PUBLIC_DIR)) {
        fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml);
    console.log(`✅ Generated sitemap.xml with ${urls.length} URLs`);

    // 5. Generate robots.txt
    const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Allow AI Bots
User-agent: GPTBot
Allow: /

User-agent: CCBot
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;

    fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robotsTxt);
    console.log(`✅ Generated robots.txt`);
}

generateSitemap().catch(console.error);
