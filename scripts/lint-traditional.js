const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * A curated list of characters that are STRICTLY Simplified Chinese (S) 
 * and have a different corresponding Traditional Chinese (T) form.
 */
const SIMPLIFIED_BLACKLIST = '顾虑场职说对过会进让门们为个爱东发还时义证质两请谢亲师广当气节点边级样题见觉讲认书写实么应这';

function findSimplified(text) {
    const found = [];
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (SIMPLIFIED_BLACKLIST.includes(char)) {
            found.push(char);
        }
    }
    return [...new Set(found)];
}

async function runLint() {
    const patterns = [
        'frontend/src/data/**/*.wording.yml',
        'frontend/src/data/**/*.wording.yaml',
        'frontend/src/data/pages/*.yml',
    ];

    const files = [];
    for (const pattern of patterns) {
        const matched = await glob(pattern, { cwd: process.cwd(), absolute: true });
        files.push(...matched);
    }

    let hasError = false;

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            // Ignore full-line comments
            if (line.trim().startsWith('#')) return;

            const found = findSimplified(line);
            if (found.length > 0) {
                process.stdout.write(`[\x1b[31mFAIL\x1b[0m] ${path.relative(process.cwd(), file)}:${index + 1}: Found simplified Chinese: ${found.join(', ')}\n`);
                process.stdout.write(`      > ${line.trim()}\n`);
                hasError = true;
            }
        });
    }

    if (hasError) {
        console.log('\n\x1b[31mError: Simplified Chinese detected in wording files!\x1b[0m');
        console.log('Please convert them to Traditional Chinese (繁體中文).');
        process.exit(1);
    } else {
        process.stdout.write('[\x1b[32mPASS\x1b[0m] No simplified Chinese found in wording data.\n');
    }
}

runLint().catch(err => {
    console.error(err);
    process.exit(1);
});
