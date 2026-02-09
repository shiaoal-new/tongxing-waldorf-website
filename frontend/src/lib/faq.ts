import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { FaqItem } from '../types/content';

function getFaqDirectory() {
    const baseCwd = process.cwd();
    const p1 = path.join(baseCwd, 'src/data/faq');
    const p2 = path.join(baseCwd, 'frontend/src/data/faq');

    if (fs.existsSync(p1)) return p1;
    if (fs.existsSync(p2)) return p2;
    return p1;
}

const faqDirectory = getFaqDirectory();

export function getAllFaq(): FaqItem[] {
    if (!fs.existsSync(faqDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(faqDirectory);
    const allFaqData = fileNames
        .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.yml') || fileName.endsWith('.yaml'))
        .map(fileName => {
            const extension = path.extname(fileName);
            const id = fileName.replace(new RegExp(`\\${extension}$`), '');
            const fullPath = path.join(faqDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            let data: any = {};
            let content = '';

            if (extension === '.yml' || extension === '.yaml') {
                data = yaml.load(fileContents) || {};
                // 如果是 YAML 文件，内容可能在 data.content 中
                if (data.content) {
                    content = data.content;
                }
            } else {
                const matterResult = matter(fileContents);
                data = matterResult.data;
                content = matterResult.content;
            }

            return {
                id,
                ...data,
                content: content,
            } as FaqItem;
        });

    return allFaqData;
}
