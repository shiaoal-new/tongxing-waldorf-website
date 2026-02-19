import path from 'path';
import { PageData } from '../types/content';
import { loadAllData } from './dataLoader';

/**
 * 取得所有頁面
 */
export function getAllPages(): PageData[] {
    return loadAllData<PageData>('pages', {
        excludeWording: true,
        transform: (item, fullPath, rawContent) => {
            const data = item as any;
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
                    const sectionLineNumbers = findSectionLineNumbers(rawContent);
                    data.sections = data.sections.map((section: any, idx: number) => {
                        if (section._sourceFile) return section; // 已有來源（例如透過 !include）

                        const sectionLine = sectionLineNumbers[idx] ?? 1;

                        if (Array.isArray(section.blocks)) {
                            const blockLineNumbers = findBlockLineNumbers(lines, sectionLine - 1);
                            section.blocks = section.blocks.map((block: any, bIdx: number) => {
                                const blockLine = blockLineNumbers[bIdx] ?? sectionLine;
                                const newBlock = {
                                    ...block,
                                    _sourceFile: fullPath,
                                    _sourceLine: blockLine,
                                };

                                if (Array.isArray(block.items)) {
                                    const itemLineNumbers = findItemLineNumbers(lines, blockLine - 1);
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
 * 扫描 YAML 文本，找到 sections 数组中每个 section 条目的起始行号（1-indexed）。
 * 策略：先找到 "sections:" 行，然后找该缩进级别下每个 "  - " 开头的行。
 */
function findSectionLineNumbers(yamlText: string): number[] {
    const lines = yamlText.split('\n');
    const lineNumbers: number[] = [];

    let inSections = false;
    let sectionsIndent = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trimStart();

        // 找到 "sections:" 行
        if (!inSections && /^sections\s*:/.test(trimmed)) {
            inSections = true;
            sectionsIndent = line.length - trimmed.length;
            continue;
        }

        if (inSections) {
            const indent = line.length - trimmed.length;

            // 如果缩进回退到 sections 同级或更少，说明 sections 块结束
            if (trimmed.length > 0 && indent <= sectionsIndent && !/^\s*$/.test(line)) {
                break;
            }

            // sections 数组的直接子项：缩进比 sections 多2，且以 "- " 开头
            if (indent === sectionsIndent + 2 && trimmed.startsWith('- ')) {
                lineNumbers.push(i + 1); // 1-indexed
            }
        }
    }

    return lineNumbers;
}

/**
 * 从指定的 block 起始行开始，扫描 items: 数组中每个 item 的起始行号（1-indexed）。
 * @param lines YAML 文本按行分割的数组
 * @param blockStartIdx block 起始行的 0-indexed 索引
 */
function findItemLineNumbers(lines: string[], blockStartIdx: number): number[] {
    const lineNumbers: number[] = [];

    let inItems = false;
    let itemsIndent = -1;

    for (let i = blockStartIdx; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trimStart();

        if (trimmed.length === 0) continue;

        const indent = line.length - trimmed.length;

        // 找到 "items:" 行（在当前 block 范围内）
        if (!inItems && /^items\s*:/.test(trimmed)) {
            inItems = true;
            itemsIndent = indent;
            continue;
        }

        if (inItems) {
            // 如果缩进回退到 items 同级或更少，说明 items 块结束
            if (indent <= itemsIndent) break;

            // items 数组的直接子项：缩进比 items 多2，且以 "- " 开头
            if (indent === itemsIndent + 2 && trimmed.startsWith('- ')) {
                lineNumbers.push(i + 1); // 1-indexed
            }
        }
    }

    return lineNumbers;
}
/**
 * 从指定的 section 起始行开始，扫描 blocks: 数组中每个 block 的起始行号（1-indexed）。
 * @param lines YAML 文本按行分割的数组
 * @param sectionStartIdx section 起始行的 0-indexed 索引
 */
function findBlockLineNumbers(lines: string[], sectionStartIdx: number): number[] {
    const lineNumbers: number[] = [];

    let inBlocks = false;
    let blocksIndent = -1;

    for (let i = sectionStartIdx; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trimStart();

        if (trimmed.length === 0) continue;

        const indent = line.length - trimmed.length;

        // 找到 "blocks:" 行（在当前 section 范围内）
        if (!inBlocks && /^blocks\s*:/.test(trimmed)) {
            inBlocks = true;
            blocksIndent = indent;
            continue;
        }

        if (inBlocks) {
            // 如果缩进回退到 blocks 同级或更少，说明 blocks 块结束
            if (indent <= blocksIndent) break;

            // blocks 数组的直接子项：缩进比 blocks 多2，且以 "- " 开头
            if (indent === blocksIndent + 2 && trimmed.startsWith('- ')) {
                lineNumbers.push(i + 1); // 1-indexed
            }
        }
    }

    return lineNumbers;
}

/**
 * 查找指定字段名的行号。
 * @param lines YAML 文本行数组
 * @param startLineIdx 起始查找行索引 (0-indexed)
 * @param fieldName 字段名
 * @param checkIndent 是否检查缩进（必须比 startLine 的缩进大）
 */
function findFieldLineNumber(lines: string[], startLineIdx: number, fieldName: string, checkIndent: boolean = false): number {
    let parentIndent = -1;

    // 如果启用缩进检查，且起始行有效，先确定父级缩进
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

        // 如果开启了缩进检查，且当前行缩进 <= 父级，说明父级块结束了，停止查找
        if (checkIndent && indent <= parentIndent) {
            return -1;
        }

        if (regex.test(line)) {
            return i + 1; // 1-indexed
        }
    }
    return -1;
}
