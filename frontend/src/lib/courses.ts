import { Course } from '../types/content';
import { loadAllData, getDataBySlug } from './dataLoader';

/**
 * 取得所有課程
 */
export function getAllCourses(): Course[] {
    return loadAllData<Course>('courses', {
        excludeWording: true,
    });
}

/**
 * 根據 slug 取得課程
 */
export function getCourseBySlug(slug: string): Course | undefined {
    return getDataBySlug<Course>('courses', slug);
}
