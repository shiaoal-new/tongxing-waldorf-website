import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

const facultyDirectory = path.join(process.cwd(), 'src/data/faculty');

export function getAllFaculty() {
    // 检查目录是否存在
    if (!fs.existsSync(facultyDirectory)) {
        return [];
    }

    // 获取所有相关文件
    const fileNames = fs.readdirSync(facultyDirectory);
    const allFacultyData = fileNames
        .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.yml') || fileName.endsWith('.yaml'))
        .map(fileName => {
            const extension = path.extname(fileName);
            const id = fileName.replace(new RegExp(`\\${extension}$`), '');
            const fullPath = path.join(facultyDirectory, fileName);
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

            // 合并数据
            return {
                id,
                ...data,
                content: content,
            };
        });

    // 按照 order 字段排序
    return allFacultyData.sort((a, b) => {
        const orderA = a.order || 999;
        const orderB = b.order || 999;
        return orderA - orderB;
    });
}
