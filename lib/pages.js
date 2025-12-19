import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

const pagesDirectory = path.join(process.cwd(), 'src/data/pages');

export function getAllPages() {
    if (!fs.existsSync(pagesDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(pagesDirectory);
    const allPagesData = fileNames
        .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.yml') || fileName.endsWith('.yaml'))
        .map(fileName => {
            const extension = path.extname(fileName);
            const slug = fileName.replace(new RegExp(`\\${extension}$`), '');
            const fullPath = path.join(pagesDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            let data = {};
            let content = '';

            if (extension === '.yml' || extension === '.yaml') {
                data = yaml.load(fileContents) || {};
            } else {
                const matterResult = matter(fileContents);
                data = matterResult.data;
                content = matterResult.content;
            }

            return {
                slug: data.slug || slug,
                ...data,
                content: content,
            };
        });

    return allPagesData;
}

export function getPageBySlug(slug) {
    const allPages = getAllPages();
    return allPages.find(page => page.slug === slug);
}
