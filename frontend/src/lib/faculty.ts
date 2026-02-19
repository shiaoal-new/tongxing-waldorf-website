import { Member } from '../types/content';
import { loadAllData } from './dataLoader';

/**
 * 取得所有師資
 */
export function getAllFaculty(): Member[] {
    return loadAllData<Member>('faculty', {
        excludeWording: true,
        sortBy: 'order',
    }) as Member[];
}
