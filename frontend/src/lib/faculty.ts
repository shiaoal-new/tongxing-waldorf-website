import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Member } from '../types/content';
import { loadYamlWithIncludes } from './yaml-loader';

function getFacultyDirectory() {
    const baseCwd = process.cwd();
    const p1 = path.join(baseCwd, 'src/data/faculty');
    const p2 = path.join(baseCwd, 'frontend/src/data/faculty');

    if (fs.existsSync(p1)) return p1;
    if (fs.existsSync(p2)) return p2;
    return p1;
}

const facultyDirectory = getFacultyDirectory();

export function getAllFaculty(): Member[] {
    // 檢查目錄是否存在
    if (!fs.existsSync(facultyDirectory)) {
        return [];
    }

    // 獲取所有相關文件
    const fileNames = fs.readdirSync(facultyDirectory);
    const allFacultyData = fileNames
        .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.yml') || fileName.endsWith('.yaml'))
        .map(fileName => {
            const extension = path.extname(fileName);
            const id = fileName.replace(new RegExp(`\\${extension}$`), '');
            const fullPath = path.join(facultyDirectory, fileName);
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

            // 合併數據
            const memberData = {
                id,
                ...data,
                content: content,
            } as Member;

            if (memberData.title === '連涓妏') {
                console.log('Loaded 連涓妏 data:', JSON.stringify(memberData, null, 2));
            }

            return memberData;
        });

    // 按照 order 字段排序
    return allFacultyData.sort((a, b) => {
        const orderA = a.order || 999;
        const orderB = b.order || 999;
        return orderA - orderB;
    });
}
