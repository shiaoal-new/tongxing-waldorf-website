import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const benefitsDirectory = path.join(process.cwd(), 'src/data/benefits');

export function getAllBenefits() {
    if (!fs.existsSync(benefitsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(benefitsDirectory);
    const allBenefitsData = fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => {
            const id = fileName.replace(/\.md$/, '');
            const fullPath = path.join(benefitsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);

            return {
                id,
                ...matterResult.data,
            };
        });

    return allBenefitsData.sort((a, b) => {
        const orderA = a.order || 999;
        const orderB = b.order || 999;
        return orderA - orderB;
    });
}
