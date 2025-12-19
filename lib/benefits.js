import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

const benefitsDirectory = path.join(process.cwd(), 'src/data/benefits');

export function getAllBenefits() {
    if (!fs.existsSync(benefitsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(benefitsDirectory);
    const allBenefitsData = fileNames
        .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.yml') || fileName.endsWith('.yaml'))
        .map(fileName => {
            const extension = path.extname(fileName);
            const id = fileName.replace(new RegExp(`\\${extension}$`), '');
            const fullPath = path.join(benefitsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            let data = {};

            if (extension === '.yml' || extension === '.yaml') {
                data = yaml.load(fileContents) || {};
            } else {
                const matterResult = matter(fileContents);
                data = matterResult.data;
            }

            return {
                id,
                ...data,
            };
        });

    return allBenefitsData.sort((a, b) => {
        const orderA = a.order || 999;
        const orderB = b.order || 999;
        return orderA - orderB;
    });
}
