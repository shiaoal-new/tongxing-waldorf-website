import { TimelineBlock as TimelineBlockType, TimelineItem } from '../../../types/content';
import { BlockPolicy } from '../interfaces';

// Helper to parse date strings (e.g., "2012", "2012.10", "2013.05.26")
export const parseYearStr = (str: string) => {
    if (!str) return 0;
    const parts = str.split('.').map(p => parseInt(p, 10));
    if (parts.length === 1 && !isNaN(parts[0])) return new Date(parts[0], 0, 1).getTime();
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return new Date(parts[0], parts[1] - 1, 1).getTime();
    if (parts.length >= 3 && !isNaN(parts[0])) return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
    return 0;
};

// Helper to format timestamp back to "YYYY.MM"
export const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}.${month < 10 ? '0' + month : month}.${day < 10 ? '0' + day : day}`;
};

export function getTOC(block: TimelineBlockType, sectionId?: string) {
    if (!block?.items) {
        return [];
    }

    if (!Array.isArray(block.items)) {
        return [];
    }

    let headerCount = 0;
    const result: { id: string; title: string }[] = [];

    block.items.forEach((item) => {
        if (item.type === 'header' && item.title) {
            const id = sectionId || 'timeline';
            // Match the ID generation logic in the render function (phaseIndex)
            const tocItem = {
                id: `${id}-header-${headerCount}`,
                title: `${item.title}`
            };
            result.push(tocItem);
            headerCount++;
        }
    });

    return result;
}

export const timelinePolicy: BlockPolicy = {
    shouldIgnorePadding: () => true,
    isSectionWide: () => true
};
