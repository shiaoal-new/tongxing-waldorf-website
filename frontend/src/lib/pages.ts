import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml, { Schema, Type } from 'js-yaml';
import { PageData } from '../types/content';

// Define the !include custom type
const createIncludeType = (basePath: string) => {
    return new Type('!include', {
        kind: 'scalar',
        construct: (data) => {
            const fullPath = path.isAbsolute(data) ? data : path.join(basePath, data);
            if (!fs.existsSync(fullPath)) {
                console.warn(`Included file not found: ${fullPath}`);
                return null;
            }
            const content = fs.readFileSync(fullPath, 'utf8');
            // Recursively load with its own base path
            return loadYamlWithIncludes(fullPath);
        }
    });
};

function loadYamlWithIncludes(fullPath: string) {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const basePath = path.dirname(fullPath);
    // js-yaml v4 uses DEFAULT_SCHEMA.extend instead of Schema.create
    const schema = yaml.DEFAULT_SCHEMA.extend([createIncludeType(basePath)]);
    return yaml.load(fileContents, { schema }) || {};
}

function getPagesDirectory() {
    const baseCwd = process.cwd();
    const p1 = path.join(baseCwd, 'src/data/pages');
    const p2 = path.join(baseCwd, 'frontend/src/data/pages');

    if (fs.existsSync(p1)) return p1;
    if (fs.existsSync(p2)) return p2;
    return p1; // Fallback
}

const pagesDirectory = getPagesDirectory();

export function getAllPages(): PageData[] {
    if (!fs.existsSync(pagesDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(pagesDirectory);
    const allPagesData = fileNames
        .filter(fileName => (fileName.endsWith('.md') || fileName.endsWith('.yml') || fileName.endsWith('.yaml')) && !fileName.includes('.wording.'))
        .map(fileName => {
            const extension = path.extname(fileName);
            const slug = fileName.replace(new RegExp(`\\${extension}$`), '');
            const fullPath = path.join(pagesDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            let data: any = {};
            let content = '';

            if (extension === '.yml' || extension === '.yaml') {
                data = loadYamlWithIncludes(fullPath);
            } else {
                const matterResult = matter(fileContents);
                data = matterResult.data;
                content = matterResult.content;
            }

            return {
                slug: data.slug || slug,
                ...data,
                content: content,
            } as PageData;
        });

    return allPagesData;
}

export function getPageBySlug(slug: string): PageData | undefined {
    const allPages = getAllPages();
    return allPages.find(page => page.slug === slug);
}
