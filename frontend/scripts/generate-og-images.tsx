
import fs from 'fs';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import yaml from 'js-yaml';
import { globSync } from 'glob';

// --- Configuration ---
const SOURCE_DIRS = [
    'src/data/pages/*.yml',
    'src/data/courses/*.yml'
];
const OUTPUT_DIR = 'public/og-images';
const SITE_SETTINGS_PATH = 'src/data/settings/site-settings.yml';
const FONT_PATH = 'public/fonts/ChenYuluoyan-2.0-Thin.woff2';

const WIDTH = 1200;
const HEIGHT = 630;

// Colors
const BG_COLOR = '#F2F2F0'; // Warm light gray (from site theme)
const TEXT_COLOR = '#1C1917'; // Dark gray
const ACCENT_COLOR = '#D97706'; // Amber/Orange similar to brand

// --- Types ---
interface PageData {
    title: string;
    slug?: string;
    description?: string;
    hero?: {
        title?: string;
        subtitle?: string;
        content?: string;
    }
}

interface SiteSettings {
    name: string;
}

// --- Helpers ---

// Helper to remove markdown symbols for clean text
function stripMarkdown(text: string): string {
    if (!text) return "";
    return text
        .replace(/#{1,6}\s/g, '') // Headers
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
        .replace(/(\*|_)(.*?)\1/g, '$2') // Italic
        .replace(/`{3}[\s\S]*?`{3}/g, '') // Code blocks
        .replace(/`(.+?)`/g, '$1') // Inline code
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links
        .replace(/\n/g, ' '); // Newlines to spaces
}

async function generate() {
    console.log('🖼️  Starting OG Image Generation...');

    // 1. Ensure Output Directory Exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 2. Load Resources
    // We need a font for Satori. Using the site's font if possible, or a fallback.
    // Note: Satori supports WOFF2, TTF, OTF.
    // 2. Load Resources
    // We need a font for Satori. Using the site's font if possible, or a fallback.
    // Note: Satori supports WOFF2, TTF, OTF.
    // 2. Load Resources
    let fontData: Buffer;
    try {
        console.log('⬇️  Fetching font (Open Huninn)...');
        // Use direct raw link to avoid redirect issues or HTML responses
        const fontUrl = 'https://raw.githubusercontent.com/justfont/open-huninn-font/master/font/jf-openhuninn-2.0.ttf';
        const response = await fetch(fontUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        fontData = Buffer.from(arrayBuffer);
        console.log(`✅ Font loaded! Size: ${fontData.length} bytes`);

    } catch (e) {
        console.error('Failed to load font:', e);
        return;
    }

    // Load Site Settings
    let siteName = '同心華德福';
    try {
        if (fs.existsSync(SITE_SETTINGS_PATH)) {
            const settings = yaml.load(fs.readFileSync(SITE_SETTINGS_PATH, 'utf8')) as SiteSettings;
            if (settings?.name) siteName = settings.name;
        }
    } catch (e) {
        console.warn('⚠️  Could not load site name, using default.');
    }

    // 3. Collect Files
    const files = SOURCE_DIRS.flatMap(pattern => globSync(pattern));
    console.log(`📂 Found ${files.length} pages to process.`);

    for (const file of files) {
        try {
            // Read Data
            const fileContent = fs.readFileSync(file, 'utf8');
            const data = yaml.load(fileContent) as PageData;

            // Determine Slug (filename is default)
            const filename = path.basename(file, '.yml');
            const slug = data.slug || filename;

            // Don't generate for 'index' if you want it to be named 'og-home.png' or similar, 
            // but usually index.png or home.png works. Let's stick to slug.

            // Determine Text Content
            const title = data.title || data.hero?.title || siteName;

            // Smart Description logic similar to Layout.tsx
            let description = data.description || data.hero?.subtitle || data.hero?.content || "";
            description = stripMarkdown(description);
            if (description.length > 100) {
                description = description.substring(0, 97) + '...';
            }

            // 4. Create SVG with Satori
            // High-Performance JSX-like syntax without React
            const svg = await satori(
                {
                    type: 'div',
                    props: {
                        style: {
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: BG_COLOR,
                            backgroundImage: `radial-gradient(circle at 25px 25px, #E5E5E5 2%, transparent 0%), radial-gradient(circle at 75px 75px, #E5E5E5 2%, transparent 0%)`,
                            backgroundSize: '100px 100px',
                            fontFamily: 'CustomFont',
                            padding: '40px 80px',
                            textAlign: 'center',
                        },
                        children: [
                            // Card Container
                            {
                                type: 'div',
                                props: {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'white',
                                        padding: '60px 80px',
                                        borderRadius: '24px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        width: '100%',
                                        height: '90%',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    },
                                    children: [
                                        // Decorative Top Line
                                        {
                                            type: 'div',
                                            props: {
                                                style: {
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '8px',
                                                    backgroundColor: ACCENT_COLOR,
                                                }
                                            }
                                        },
                                        // Site Name (Small Top)
                                        {
                                            type: 'div',
                                            props: {
                                                style: {
                                                    fontSize: 24,
                                                    color: '#666',
                                                    marginBottom: 30,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '2px',
                                                },
                                                children: siteName,
                                            }
                                        },
                                        // Main Title
                                        {
                                            type: 'div',
                                            props: {
                                                style: {
                                                    fontSize: 72,
                                                    fontWeight: 900,
                                                    marginBottom: description ? 30 : 0,
                                                    backgroundImage: `linear-gradient(90deg, ${TEXT_COLOR}, #444)`,
                                                    backgroundClip: 'text',
                                                    color: 'transparent',
                                                },
                                                children: title,
                                            }
                                        },
                                        // Description
                                        description ? {
                                            type: 'div',
                                            props: {
                                                style: {
                                                    fontSize: 32,
                                                    color: '#555',
                                                    lineHeight: 1.4,
                                                    maxWidth: '80%',
                                                },
                                                children: description,
                                            }
                                        } : null,

                                        // Bottom Decoration (optional logo or url)
                                        {
                                            type: 'div',
                                            props: {
                                                style: {
                                                    position: 'absolute',
                                                    bottom: 40,
                                                    fontSize: 20,
                                                    color: '#999',
                                                    fontFamily: 'sans-serif', // Fallback for url
                                                },
                                                children: 'tongxing.org.tw',
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    key: 'container'
                },
                {
                    width: WIDTH,
                    height: HEIGHT,
                    fonts: [
                        {
                            name: 'CustomFont',
                            data: fontData,
                            weight: 400,
                            style: 'normal',
                        },
                    ],
                }
            );

            // 5. Render SVG to PNG using Resvg
            const resvg = new Resvg(svg, {
                fitTo: { mode: 'width', value: WIDTH },
            });
            const pngData = resvg.render();
            const pngBuffer = pngData.asPng();

            // 6. Save File
            const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);
            fs.writeFileSync(outputPath, pngBuffer);

            console.log(`✅ Generated: ${slug}.png`);

        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error);
        }
    }
    console.log('✨ All OG images generated successfully!');
}

generate();
