import { getAllFaculty } from './faculty';
import { getAllFaq } from './faq';
import { getAllCourses } from './courses';
import { PageData, Section, Block, ListBlock as ListBlockType } from '../types/content';

/**
 * 数据依赖映射表
 * 定义每种 block 类型需要的全局数据
 */
const BLOCK_DATA_DEPENDENCIES: Record<string, string[]> = {
    'member_block': ['facultyList'],
    'faq_item': ['faqList'],
    'list_block': [], // list_block 需要进一步检查其 item_type
};

/**
 * 检测 list_block 的数据依赖
 */
function getListBlockDependencies(block: ListBlockType): string[] {
    const dependencies: string[] = [];
    const itemType = block.item_type;

    // 如果 list_block 包含 faq_ids,需要 faqList
    if (block.faq_ids && block.faq_ids.length > 0) {
        dependencies.push('faqList');
    }

    // 根据 item_type 判断依赖
    if (itemType === 'faq_item') {
        dependencies.push('faqList');
    }

    return dependencies;
}

/**
 * 递归分析 blocks 中的数据依赖
 */
function analyzeBlockDependencies(blocks: Block[]): Set<string> {
    const dependencies = new Set<string>();

    for (const block of blocks) {
        const blockType = (block as any).type || (block as any).item_type;

        // 检查直接的 block 类型依赖
        if (BLOCK_DATA_DEPENDENCIES[blockType]) {
            BLOCK_DATA_DEPENDENCIES[blockType].forEach(dep => dependencies.add(dep));
        }

        // 特殊处理 list_block
        if (blockType === 'list_block') {
            const listBlock = block as ListBlockType;
            const listDeps = getListBlockDependencies(listBlock);
            listDeps.forEach(dep => dependencies.add(dep));

            // 递归检查 list_block 中的 items
            if (listBlock.items && Array.isArray(listBlock.items)) {
                const itemDeps = analyzeBlockDependencies(listBlock.items as Block[]);
                itemDeps.forEach(dep => dependencies.add(dep));
            }
        }
    }

    return dependencies;
}

/**
 * 分析页面配置,确定需要加载的数据
 */
export function analyzePageDataDependencies(page: PageData | null): Set<string> {
    const dependencies = new Set<string>();

    if (!page) {
        return dependencies;
    }

    // 分析 sections 中的 blocks
    if (page.sections && Array.isArray(page.sections)) {
        for (const section of page.sections) {
            if (section.blocks && Array.isArray(section.blocks)) {
                const sectionDeps = analyzeBlockDependencies(section.blocks);
                sectionDeps.forEach(dep => dependencies.add(dep));
            }
        }
    }

    return dependencies;
}

/**
 * 按需加载数据
 * 只加载页面实际需要的数据,减少不必要的开销
 */
export function loadPageData(dependencies: Set<string>) {
    const data: {
        facultyList?: any[];
        faqList?: any[];
        coursesList?: any[];
    } = {};

    if (dependencies.has('facultyList')) {
        data.facultyList = getAllFaculty();
    }

    if (dependencies.has('faqList')) {
        data.faqList = getAllFaq();
    }

    if (dependencies.has('coursesList')) {
        data.coursesList = getAllCourses();
    }

    return data;
}

/**
 * 一站式函数:分析并加载页面数据
 */
export function getPageDataOptimized(page: PageData | null) {
    const dependencies = analyzePageDataDependencies(page);
    return loadPageData(dependencies);
}
