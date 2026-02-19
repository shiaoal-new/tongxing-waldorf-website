import path from 'path';
import { PageData } from '../types/content';
import { loadAllData } from './dataLoader';
import { findListLineNumbers } from './utils';

/**
 * 取得所有頁面
 */
export function getAllPages(): PageData[] {
    return loadAllData<PageData>('pages', {
        excludeWording: true,
        transform: (item, fullPath, rawContent) => {
            const data = item as PageData;
            const extension = path.extname(fullPath);
            const isYaml = extension === '.yml' || extension === '.yaml';

            // 注入源文件路徑
            data._sourceFile = fullPath;

            if (isYaml) {
                const lines = rawContent.split('\n');

                // 處理 Hero 欄位的精確行號
                if (data.hero) {
                    const heroStartLine = findFieldLineNumber(lines, 0, 'hero');
                    if (heroStartLine > 0) {
                        const fields = ['title', 'subtitle', 'badge', 'content', 'buttons', 'video', 'image', 'background_image'];
                        const fieldLines: Record<string, number> = {};

                        fields.forEach(field => {
                            const line = findFieldLineNumber(lines, heroStartLine - 1, field, true);
                            if (line > 0) fieldLines[field] = line;
                        });

                        data.hero = {
                            ...data.hero,
                            _sourceFile: fullPath,
                            _sourceLines: fieldLines,
                            _sourceLine: heroStartLine
                        };
                    }
                }

                // 注入 section/block/item 的行號
                if (Array.isArray(data.sections)) {
                    const sectionLineNumbers = findListLineNumbers(lines, 0, 'sections');
                    data.sections = data.sections.map((section: any, idx: number) => {
                        if (section._sourceFile) return section; // 已有來源（例如透過 !include）

                        const sectionLine = sectionLineNumbers[idx] ?? 1;

                        if (Array.isArray(section.blocks)) {
                            const blockLineNumbers = findListLineNumbers(lines, sectionLine - 1, 'blocks');
                            section.blocks = section.blocks.map((block: any, bIdx: number) => {
                                const blockLine = blockLineNumbers[bIdx] ?? sectionLine;
                                const newBlock = {
                                    ...block,
                                    _sourceFile: fullPath,
                                    _sourceLine: blockLine,
                                };

                                if (Array.isArray(block.items)) {
                                    const itemLineNumbers = findListLineNumbers(lines, blockLine - 1, 'items');
                                    newBlock.items = block.items.map((item: any, iIdx: number) => ({
                                        ...item,
                                        _sourceFile: fullPath,
                                        _sourceLine: itemLineNumbers[iIdx] ?? blockLine,
                                    }));
                                }
                                return newBlock;
                            });
                        }

                        return {
                            ...section,
                            _sourceFile: fullPath,
                            _sourceLine: sectionLine,
                        };
                    });
                }
            }

            return data as PageData;
        }
    });
}

export function getPageBySlug(slug: string): PageData | undefined {
    const allPages = getAllPages();
    return allPages.find(page => page.slug === slug);
}


/**
 * 查找指定字段名的行號。
 * @param lines YAML 文本行数组
 * @param startLineIdx 起始查找行索引 (0-indexed)
 * @param fieldName 字段名
 * @param checkIndent 是否检查缩进（必须比 startLine 的缩进大）
 */
function findFieldLineNumber(lines: string[], startLineIdx: number, fieldName: string, checkIndent: boolean = false): number {
    let parentIndent = -1;

    // 如果启用缩进检查，且起始行有效，先确定父級缩进
    if (checkIndent && startLineIdx >= 0 && startLineIdx < lines.length) {
        const startLineContent = lines[startLineIdx];
        parentIndent = startLineContent.length - startLineContent.trimStart().length;
    }

    const regex = new RegExp(`^\\s*${fieldName}\\s*:`);

    // 从起始行的下一行开始查找
    for (let i = startLineIdx + 1; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trimStart();

        if (trimmed.length === 0) continue;

        const indent = line.length - trimmed.length;

        // 如果开启了缩进檢查，且当前行缩进 <= 父級，说明父級块结束了，停止查找
        if (checkIndent && indent <= parentIndent) {
            return -1;
        }

        if (regex.test(line)) {
            return i + 1; // 1-indexed
        }
    }
    return -1;
}
