import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const facultyDirectory = path.join(process.cwd(), 'src/data/faculty');

export function getAllFaculty() {
    // 检查目录是否存在
    if (!fs.existsSync(facultyDirectory)) {
        return [];
    }

    // 获取所有 .md 文件
    const fileNames = fs.readdirSync(facultyDirectory);
    const allFacultyData = fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => {
            // 移除 ".md" 扩展名获取 id
            const id = fileName.replace(/\.md$/, '');

            // 读取 markdown 文件内容
            const fullPath = path.join(facultyDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            // 使用 gray-matter 解析 frontmatter
            const matterResult = matter(fileContents);

            // 合并数据
            return {
                id,
                ...matterResult.data,
                content: matterResult.content,
            };
        });

    // 按照 order 字段排序
    return allFacultyData.sort((a, b) => {
        const orderA = a.order || 999;
        const orderB = b.order || 999;
        return orderA - orderB;
    });
}
