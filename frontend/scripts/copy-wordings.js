const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const SRC_DATA_DIR = path.join(__dirname, '../src/data');
const PUBLIC_WORDINGS_DIR = path.join(__dirname, '../public/data/wordings');

async function copyWordings() {
    // Find all *.wording.yml or *.wording.yaml files
    const files = await glob('**/*.wording.*', { cwd: SRC_DATA_DIR });

    console.log(`Found ${files.length} wording files.`);

    // Clear or create the target directory
    if (fs.existsSync(PUBLIC_WORDINGS_DIR)) {
        fs.rmSync(PUBLIC_WORDINGS_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(PUBLIC_WORDINGS_DIR, { recursive: true });

    for (const file of files) {
        const filename = path.basename(file);
        // Pattern: [pageId].wording.[style].yml
        const match = filename.match(/^(.+)\.wording\.(.+)\.(yml|yaml)$/);

        if (match) {
            const pageId = match[1];
            const style = match[2];

            const targetDir = path.join(PUBLIC_WORDINGS_DIR, pageId);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const srcPath = path.join(SRC_DATA_DIR, file);
            const destPath = path.join(targetDir, `${style}.yml`);

            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${file} -> public/data/wordings/${pageId}/${style}.yml`);
        } else {
            console.warn(`File ${file} does not match expected naming convention.`);
        }
    }

    // Also handle old structure fallback if it still exists (unlikely given the error)
    const oldWordingDir = path.join(SRC_DATA_DIR, 'wordings');
    if (fs.existsSync(oldWordingDir)) {
        console.log('Found old wording structure, copying as well...');
        const oldFiles = await glob('**/*.{yml,yaml}', { cwd: oldWordingDir });
        for (const file of oldFiles) {
            const srcPath = path.join(oldWordingDir, file);
            const destPath = path.join(PUBLIC_WORDINGS_DIR, file);
            const destDir = path.dirname(destPath);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied (old): wordings/${file} -> public/data/wordings/${file}`);
        }
    }

    console.log('Wording copy complete.');
}

copyWordings().catch(err => {
    console.error('Error copying wordings:', err);
    process.exit(1);
});
