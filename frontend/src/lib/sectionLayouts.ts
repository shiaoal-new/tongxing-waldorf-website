import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

const layoutsDirectory = path.join(process.cwd(), 'src/data/section_layouts');

export function parseCssClasses(cssString: string): Record<string, string> {
    if (!cssString) return {};
    const styles: Record<string, string> = {};
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

export function getAllSectionLayouts(): any[] {
    if (!fs.existsSync(layoutsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(layoutsDirectory);
    const allLayouts = fileNames
        .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.yml') || fileName.endsWith('.yaml'))
        .map(fileName => {
            const extension = path.extname(fileName);
            const id = fileName.replace(new RegExp(`\\${extension}$`), '');
            const fullPath = path.join(layoutsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            let data: any = {};

            if (extension === '.yml' || extension === '.yaml') {
                data = yaml.load(fileContents) || {};
            } else {
                const matterResult = matter(fileContents);
                data = matterResult.data;
            }

            const result: any = {
                id,
                ...data,
            };

            if (result.css_classes) {
                const parsed = parseCssClasses(result.css_classes);
                Object.assign(result, parsed);
            }

            return result;
        });

    return allLayouts;
}

export function getSectionLayoutByTitle(title: string): any | undefined {
    const allLayouts = getAllSectionLayouts();
    return allLayouts.find(layout => layout.title === title);
}
