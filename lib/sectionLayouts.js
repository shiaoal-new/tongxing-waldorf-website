import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const layoutsDirectory = path.join(process.cwd(), 'src/data/section_layouts');

export function parseCssClasses(cssString) {
    if (!cssString) return {};
    const styles = {};
    // Regex to match .class_name { content } or .class_name { content }
    const regex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;
    let match;
    while ((match = regex.exec(cssString)) !== null) {
        const key = match[1];
        const value = match[2].trim();
        styles[key] = value;
    }
    return styles;
}

export function getAllSectionLayouts() {
    if (!fs.existsSync(layoutsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(layoutsDirectory);
    const allLayouts = fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => {
            const fullPath = path.join(layoutsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);

            const data = {
                id: fileName.replace(/\.md$/, ''),
                ...matterResult.data,
            };

            if (data.css_classes) {
                const parsed = parseCssClasses(data.css_classes);
                Object.assign(data, parsed);
            }

            return data;
        });

    return allLayouts;
}

export function getSectionLayoutByTitle(title) {
    const allLayouts = getAllSectionLayouts();
    return allLayouts.find(layout => layout.title === title);
}
