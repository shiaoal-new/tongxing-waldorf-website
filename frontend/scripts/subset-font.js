const Fontmin = require('fontmin');
const { glob } = require('glob');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const SOURCE_FONT = path.join(FRONTEND_ROOT, 'public/fonts/ChenYuluoyan-2.0-Thin.ttf');
const OUTPUT_DIR = path.join(FRONTEND_ROOT, 'public/fonts');

// Basic characters to always include (Latin, digits, common symbols, and identity-related characters)
const FALLBACK_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};\':",./<>?|\\~` \n\t\r一二三四五六七八九十同心華德福';

async function getUniqueChars() {
    console.log('Starting Smart Character Extraction...');
    let allText = FALLBACK_CHARS;

    // 1. Check for built artifacts in 'out/' (The most accurate source)
    const outHtmlFiles = await glob('out/**/*.html', { cwd: FRONTEND_ROOT });

    if (outHtmlFiles.length > 0) {
        console.log(`Analyzing ${outHtmlFiles.length} production HTML files...`);
        outHtmlFiles.forEach(file => {
            try {
                const html = fs.readFileSync(path.join(FRONTEND_ROOT, file), 'utf8');
                const $ = cheerio.load(html);

                // Find all elements using the accent font class
                $('.font-accent').each((i, el) => {
                    const text = $(el).text().trim();
                    if (text) allText += text;
                });
            } catch (e) {
                console.warn(`Failed to process ${file}: ${e.message}`);
            }
        });
    } else {
        // 2. Fallback: Scan source files if 'out/' doesn't exist (e.g., during initial dev)
        console.warn('⚠️ No built "out/" directory found. Falling back to source code scan...');
        console.log('Scanning src/**/*.{tsx,yml} for text...');

        const srcFiles = await glob('src/**/*.{tsx,ts,jsx,js,yml}', {
            cwd: FRONTEND_ROOT,
            ignore: ['**/node_modules/**', '**/public/**']
        });

        srcFiles.forEach(file => {
            try {
                const content = fs.readFileSync(path.join(FRONTEND_ROOT, file), 'utf8');
                if (file.endsWith('.yml')) {
                    // Smart regex for YAML accent text fields
                    const matches = content.match(/accent_text:\s*["']?([^"'\n]+)["']?/g);
                    if (matches) {
                        matches.forEach(m => {
                            const val = m.split(':')[1].replace(/["']/g, '').trim();
                            allText += val;
                        });
                    }
                } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
                    // For JS/TSX, we can't easily know which text uses the font, 
                    // so we extract all meaningful Chinese/text as a safer but heavier fallback.
                    // Or for this "Smart" script, we specifically look for strings near 'font-accent'
                    // but that's complex, so we'll just take a modest sample or the whole file text.
                    allText += content;
                }
            } catch (e) {
                console.warn(`Failed to read source ${file}: ${e.message}`);
            }
        });
    }

    // Filter unique characters
    const uniqueChars = Array.from(new Set(allText)).join('');
    console.log(`Scan complete. Found ${uniqueChars.length} unique characters.`);
    return uniqueChars;
}

async function subsetFont() {
    try {
        if (!fs.existsSync(SOURCE_FONT)) {
            console.error(`❌ Source font not found at: ${SOURCE_FONT}`);
            console.error('Please ensure the raw .ttf font is available in frontend/out/fonts/ for subsetting.');
            process.exit(1);
        }

        const text = await getUniqueChars();

        console.log(`🚀 Subsetting font to ${OUTPUT_DIR}...`);

        const fontmin = new Fontmin()
            .src(SOURCE_FONT)
            .dest(OUTPUT_DIR)
            .use(Fontmin.glyph({
                text: text,
                hinting: false // Optional: set to true if font quality is low
            }))
            .use(Fontmin.ttf2woff2());

        fontmin.run(async (err, files) => {
            if (err) {
                throw err;
            }
            console.log('✅ Font subsetting complete!');

            let subsetBuffer = null;
            files.forEach(file => {
                const fileName = path.basename(file.path);
                if (fileName.endsWith('.woff2')) {
                    subsetBuffer = file.contents;
                    const sizeKB = (file.contents.length / 1024).toFixed(2);
                    console.log(`📦 Result: ${fileName} (${sizeKB} KB)`);
                }
            });

            // 3. CRITICAL: Overwrite the hashed version in 'out/' so Firebase deploys the small one
            if (subsetBuffer) {
                const buildMediaDir = path.join(FRONTEND_ROOT, 'out/_next/static/media');
                if (fs.existsSync(buildMediaDir)) {
                    const hashedFonts = await glob('ChenYuluoyan*.woff2', { cwd: buildMediaDir });
                    if (hashedFonts.length > 0) {
                        console.log(`Found ${hashedFonts.length} hashed fonts in build output. Overwriting...`);
                        hashedFonts.forEach(hashedFile => {
                            const fullPath = path.join(buildMediaDir, hashedFile);
                            fs.writeFileSync(fullPath, subsetBuffer);
                            console.log(`✨ Patched: ${hashedFile}`);
                        });
                    }
                }
            }
        });

    } catch (error) {
        console.error('❌ Error during subsetting:', error);
        process.exit(1);
    }
}

subsetFont();
