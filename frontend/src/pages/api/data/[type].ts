import type { NextApiRequest, NextApiResponse } from 'next';
import { loadAllData, DataType } from '../../../lib/dataLoader';
import { getWordingDictionary, resolveWording } from '../../../lib/wording.server';

const ALLOWED_TYPES: DataType[] = ['faq', 'faculty'];
const SORT_BY: Partial<Record<DataType, string>> = {
    faculty: 'order',
};
const CACHE_HEADER = 'public, max-age=300, stale-while-revalidate=600';

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<unknown[] | { error: string }>
) {
    const { type, style = 'default' } = req.query;

    if (typeof type !== 'string' || !(ALLOWED_TYPES as string[]).includes(type)) {
        return res.status(400).json({ error: `Invalid type. Allowed: ${ALLOWED_TYPES.join(', ')}` });
    }

    try {
        const data = loadAllData(type as DataType, {
            excludeWording: true,
            sortBy: SORT_BY[type as DataType],
        });

        // 進行文字解析 (Wording Resolution)
        const dictionary = getWordingDictionary(type, style as string);
        const resolvedData = data.map(item => resolveWording(item, dictionary));

        res.setHeader('Cache-Control', CACHE_HEADER);
        return res.status(200).json(resolvedData);
    } catch (error) {
        console.error(`[/api/data/${type}] Error:`, error);
        return res.status(500).json({ error: `Failed to load ${type} data` });
    }
}
