import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

const coursesDirectory = path.join(process.cwd(), 'src/data/courses');

export function getAllCourses() {
    if (!fs.existsSync(coursesDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(coursesDirectory);
    const allCoursesData = fileNames
        .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.yml') || fileName.endsWith('.yaml'))
        .map(fileName => {
            const extension = path.extname(fileName);
            const slug = fileName.replace(new RegExp(`\\${extension}$`), '');
            const fullPath = path.join(coursesDirectory, fileName);
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
                id: data.slug || slug, // keep id for backward compatibility if needed
                ...data,
                content: content,
            };
        });

    return allCoursesData;
}

export function getCourseBySlug(slug) {
    const allCourses = getAllCourses();
    return allCourses.find(course => course.slug === slug);
}
