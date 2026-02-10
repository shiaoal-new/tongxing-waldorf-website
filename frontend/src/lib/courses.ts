import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Course } from '../types/content';
import { loadYamlWithIncludes } from './yaml-loader';

function getCoursesDirectory() {
    const baseCwd = process.cwd();
    const p1 = path.join(baseCwd, 'src/data/courses');
    const p2 = path.join(baseCwd, 'frontend/src/data/courses');

    if (fs.existsSync(p1)) return p1;
    if (fs.existsSync(p2)) return p2;
    return p1;
}

const coursesDirectory = getCoursesDirectory();

export function getAllCourses(): Course[] {
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

            let data: any = {};
            let content = '';

            if (extension === '.yml' || extension === '.yaml') {
                data = loadYamlWithIncludes(fullPath);
            } else {
                const matterResult = matter(fileContents);
                data = matterResult.data;
                content = matterResult.content;
            }

            return {
                slug: data.slug || slug,
                ...data,
                content: content,
            } as Course;
        });

    return allCoursesData;
}

export function getCourseBySlug(slug: string): Course | undefined {
    const courses = getAllCourses();
    return courses.find(course => course.slug === slug);
}
