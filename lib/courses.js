import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const coursesDirectory = path.join(process.cwd(), 'src/data/courses');

export function getAllCourses() {
    if (!fs.existsSync(coursesDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(coursesDirectory);
    const allCoursesData = fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => {
            const id = fileName.replace(/\.md$/, '');
            const fullPath = path.join(coursesDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);

            return {
                id,
                ...matterResult.data,
                content: matterResult.content,
            };
        });

    return allCoursesData;
}
