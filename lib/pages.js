import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const pagesDirectory = path.join(process.cwd(), 'src/data/pages');

export function getAllPages() {
    if (!fs.existsSync(pagesDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(pagesDirectory);
    const allPagesData = fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => {
            const slug = fileName.replace(/\.md$/, '');
            const fullPath = path.join(pagesDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);

            return {
                slug: matterResult.data.slug || slug,
                ...matterResult.data,
                content: matterResult.content,
            };
        });

    return allPagesData;
}

export function getPageBySlug(slug) {
    const allPages = getAllPages();
    return allPages.find(page => page.slug === slug);
}
