const Fontmin = require('fontmin');
const { glob } = require('glob');
const fs = require('fs');
const path = require('path');

// Configuration
// Using absolute paths or relative to CWD helps, but relative to __dirname is safest
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const SOURCE_FONT = path.join(FRONTEND_ROOT, 'out/fonts/ChenYuluoyan-2.0-Thin.ttf');
const OUTPUT_DIR = path.join(FRONTEND_ROOT, 'public/fonts');
const SCAN_PATTERN = 'src/**/*.{js,jsx,ts,tsx,yml,json,md,html}'; // Relative to CWD (frontend)

// Fallback characters (Basic Latin + Symbols + Common Chinese)
const FALLBACK_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};\':",./<>?|\\~` \n\t\r一二三四五六七八九十';

async function getUniqueChars() {
    console.log('Scanning files...');
    // glob v10+ returns a Promise
    const files = await glob(SCAN_PATTERN, { cwd: FRONTEND_ROOT });

    let allText = FALLBACK_CHARS;

    files.forEach(file => {
        try {
            const content = fs.readFileSync(path.join(FRONTEND_ROOT, file), 'utf8');
            // Very basic extraction
            allText += content;
        } catch (e) {
            console.warn(`Failed to read ${file}: ${e.message}`);
        }
    });

    // Get unique characters
    const uniqueChars = Array.from(new Set(allText)).join('');
    console.log(`Scanned ${files.length} files. Found ${uniqueChars.length} unique characters.`);
    return uniqueChars;
}

async function subsetFont() {
    try {
        if (!fs.existsSync(SOURCE_FONT)) {
            console.error(`Source font not found at: ${SOURCE_FONT}`);
            console.error('Please ensure the source TTF file exists to generate the subset.');
            // Check if we can use the one in public as source if it was TTF? No, it's woff2 there (or invalid).
            // Fallback: check if we have a backup or ask user.
            process.exit(1);
        }

        const text = await getUniqueChars();

        console.log(`Subsetting font from ${SOURCE_FONT}...`);

        const fontmin = new Fontmin()
            .src(SOURCE_FONT)
            .dest(OUTPUT_DIR)
            .use(Fontmin.glyph({
                text: text,
                hinting: false
            }))
            .use(Fontmin.ttf2woff2());

        fontmin.run((err, files) => {
            if (err) {
                throw err;
            }
            console.log('Font subsetting complete!');
            files.forEach(file => {
                const fileName = path.basename(file.path);
                if (fileName.endsWith('.woff2')) {
                    const sizeKB = (file.contents.length / 1024).toFixed(2);
                    console.log(`Generated: ${fileName} (${sizeKB} KB)`);
                }
            });
        });

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

subsetFont();
