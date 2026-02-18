import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PageData } from '../types/content';
import { loadYamlWithIncludes } from './yaml-loader';

function getPagesDirectory() {
    const baseCwd = process.cwd();
    const p1 = path.join(baseCwd, 'src/data/pages');
    const p2 = path.join(baseCwd, 'frontend/src/data/pages');

    if (fs.existsSync(p1)) return p1;
    if (fs.existsSync(p2)) return p2;
    return p1; // Fallback
}

const pagesDirectory = getPagesDirectory();

export function getAllPages(): PageData[] {
    if (!fs.existsSync(pagesDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(pagesDirectory);
    const allPagesData = fileNames
        .filter(fileName => (fileName.endsWith('.md') || fileName.endsWith('.yml') || fileName.endsWith('.yaml')) && !fileName.includes('.wording.'))
        .map(fileName => {
            const extension = path.extname(fileName);
            const slug = fileName.replace(new RegExp(`\\${extension}$`), '');
            const fullPath = path.join(pagesDirectory, fileName);
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

            // 处理 Hero 字段的精确行号
            if (data.hero && (extension === '.yml' || extension === '.yaml')) {
                const lines = fileContents.split('\n');
                // 找到 hero: 的起始行
                const heroStartLine = findFieldLineNumber(lines, 0, 'hero');

                if (heroStartLine > 0) {
                    const fields = ['title', 'subtitle', 'badge', 'content', 'buttons', 'video', 'image', 'background_image'];
                    const fieldLines: Record<string, number> = {};

                    fields.forEach(field => {
                        // 在 hero 块内查找字段，假设 hero 块大约 50 行内（简单启发式，或者可以改进查找逻辑）
                        // 为简单起见，我们从 heroStartLine 开始往下找，由于 YAML 顺序不确定，我们可能需要更严谨的范围控制
                        // 但通常字段会在 hero 下方。
                        // 修正：我们需要限制查找范围，或者检查缩进。
                        // 简化版：从 heroStartLine 开始找，只要缩进比 hero 大。
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

            // 处理 Hero 字段的精确行号
            if (data.hero && (extension === '.yml' || extension === '.yaml')) {
                const lines = fileContents.split('\n');
                // 找到 hero: 的起始行
                const heroStartLine = findFieldLineNumber(lines, 0, 'hero');

                if (heroStartLine > 0) {
                    const fields = ['title', 'subtitle', 'badge', 'content', 'buttons', 'video', 'image', 'background_image'];
                    const fieldLines: Record<string, number> = {};

                    fields.forEach(field => {
                        // 在 hero 块内查找字段，假设 hero 块大约 50 行内（简单启发式，或者可以改进查找逻辑）
                        // 为简单起见，我们从 heroStartLine 开始往下找，由于 YAML 顺序不确定，我们可能需要更严谨的范围控制
                        // 但通常字段会在 hero 下方。
                        // 修正：我们需要限制查找范围，或者检查缩进。
                        // 简化版：从 heroStartLine 开始找，只要缩进比 hero 大。
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


            // 处理 Hero 字段的精确行号
            if (data.hero && (extension === '.yml' || extension === '.yaml')) {
                const lines = fileContents.split('\n');
                // 找到 hero: 的起始行
                const heroStartLine = findFieldLineNumber(lines, 0, 'hero');

                if (heroStartLine > 0) {
                    const fields = ['title', 'subtitle', 'badge', 'content', 'buttons', 'video', 'image', 'background_image'];
                    const fieldLines: Record<string, number> = {};

                    fields.forEach(field => {
                        // 从 heroStartLine 开始找，只要缩进比 hero 大。
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

            // 给每个 section 注入源文件路径和行号，用于 YML Locator 功能
            if (Array.isArray(data.sections) && (extension === '.yml' || extension === '.yaml')) {
                // 扫描 YAML 文本，找到 sections 数组下每个 section 的起始行号
                const sectionLineNumbers = findSectionLineNumbers(fileContents);
                const lines = fileContents.split('\n');

                data.sections = data.sections.map((section: any, idx: number) => {
                    // 如果 section 是通过 !include 加载的，它可能已经有自己的 _sourceFile
                    if (section._sourceFile) return section;

                    const sectionLine = sectionLineNumbers[idx] ?? 1;

                    // 扫描该 section 内 blocks 的行号
                    let blocksWithLines = section.blocks;
                    if (Array.isArray(section.blocks)) {
                        const blockLineNumbers = findBlockLineNumbers(lines, sectionLine - 1);
                        blocksWithLines = section.blocks.map((block: any, bIdx: number) => {
                            const blockLine = blockLineNumbers[bIdx] ?? sectionLine;

                            // 准备要返回的 block 对象
                            const newBlock = {
                                ...block,
                                _sourceFile: fullPath,
                                _sourceLine: blockLine,
                            };

                            // 仅当 items 是数组时才处理并覆盖
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
                        blocks: blocksWithLines,
                        _sourceFile: fullPath,
                        _sourceLine: sectionLine,
                    };
                });
            }

            return {
                slug: data.slug || slug,
                ...data,
                _sourceFile: fullPath, // 直接注入路径，确保 spread 后不丢失
                content: content,
            } as PageData;
        });

    return allPagesData;
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
