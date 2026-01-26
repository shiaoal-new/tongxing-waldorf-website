import { useState, useEffect } from 'react';

/**
 * useDynamicTOC - 動態生成頁面目錄 (Table of Contents)
 * 
 * 此 Hook 會：
 * 1. 立即生成基礎的 Section 標題目錄（同步，SEO 友善）
 * 2. 在頁面載入後，自動偵測各個 Block 是否提供 getTOC 函式
 * 3. 動態載入並執行這些函式，將結果合併到目錄中
 * 
 * @param {Object} page - 頁面資料物件，包含 sections 陣列
 * @param {Object} extraData - 額外的上下文資料（例如 questionnaire）
 * @returns {Array} tocSections - 目錄項目陣列
 */
export function useDynamicTOC(page, extraData = {}) {
    // 1. 初始 TOC 只包含 Section 標題 (同步且快速)
    const [tocSections, setTocSections] = useState(() => generateInitialTOC(page));

    // 2. 當頁面改變時，重置 TOC 為新頁面的初始狀態
    useEffect(() => {
        setTocSections(generateInitialTOC(page));
    }, [page]);

    // 3. 頁面載入後，非同步擴充 dynamic blocks 的 TOC
    // 自動偵測每個 Block 是否提供了 getTOC 函式
    useEffect(() => {
        let isMounted = true;

        const fetchDynamicTOCs = async () => {
            if (!page) return;
            const sections = page.sections || [];
            let updates = new Map(); // 使用 Map 暫存要插入的項目: sectionId -> items[]

            // 遍歷所有 Section，嘗試從每個 Block 動態載入 getTOC
            const promises = sections.map(async (section) => {
                const blocks = section.blocks || [];
                if (!blocks.length) return;

                for (const block of blocks) {
                    if (!block.type) continue;

                    try {
                        // 將 block.type 轉換為組件檔名 (例如: 'timeline_block' -> 'TimelineBlock')
                        const componentName = convertBlockTypeToComponentName(block.type);
                        console.log('[useDynamicTOC] Trying to load:', componentName, 'for block type:', block.type);

                        // 嘗試動態載入該組件模組
                        const module = await import(`../components/blocks/${componentName}`);
                        console.log('[useDynamicTOC] Module loaded:', componentName, 'has getTOC:', typeof module.getTOC);

                        // 檢查是否有 export getTOC 函式
                        if (typeof module.getTOC === 'function') {
                            // 準備額外資料 (Context)
                            // 不同的 Block 可能需要不同的上下文資料
                            let contextData = null;
                            if (block.type === 'questionnaire_block') {
                                contextData = extraData.questionnaire;
                            }

                            const items = module.getTOC(block, section.section_id, contextData);
                            console.log('[useDynamicTOC] getTOC returned:', items, 'for section:', section.section_id);

                            if (items && items.length) {
                                if (!updates.has(section.section_id)) {
                                    updates.set(section.section_id, []);
                                }
                                updates.get(section.section_id).push(...items);
                            }
                        }
                    } catch (e) {
                        // 靜默失敗:如果模組不存在或沒有 getTOC,就跳過
                        // 這是正常的,因為大部分 Block 都不需要提供 TOC
                        // 只在非 "Cannot find module" 錯誤時才記錄
                        if (!e.message.includes('Cannot find module')) {
                            console.warn('[useDynamicTOC] Unexpected error for:', block.type, e);
                        }
                    }
                }
            });

            await Promise.all(promises);

            if (!isMounted || updates.size === 0) return;

            // 合併邏輯：將動態項目插入到對應的 Section 之後
            setTocSections(prev => {
                const newToc = [];
                prev.forEach(item => {
                    newToc.push(item);
                    // 如果這個項目是 Section 標題，且該 Section 有子項目要插入
                    if (item.isSection && updates.has(item.id)) {
                        newToc.push(...updates.get(item.id));
                    }
                });
                return newToc;
            });
        };

        // 稍微延遲執行，確保主渲染優先
        const timer = setTimeout(fetchDynamicTOCs, 100);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [page, extraData]); // 當頁面資料改變時重新執行

    return tocSections;
}

/**
 * 生成初始 TOC（只包含 Section 標題）
 * 這個函式會在頁面首次載入和頁面切換時被呼叫
 */
function generateInitialTOC(page) {
    if (!page) return [];
    const sections = page.sections || [];
    const initialToc = [];

    sections.forEach(section => {
        const blocks = section.blocks || [];
        let title = "";
        const firstBlock = blocks[0];

        // 從第一個 text_block 提取標題
        if (firstBlock && firstBlock.type === 'text_block') {
            if (firstBlock.title) title = firstBlock.title;
            else if (firstBlock.subtitle) title = firstBlock.subtitle;
        }

        if (section.section_id) {
            initialToc.push({
                id: section.section_id,
                title: title || section.section_id || "Section",
                isSection: true // 標記為主要 Section
            });
        }
    });

    return initialToc;
}

/**
 * 將 block.type 轉換為組件檔名
 * 例如: 'timeline_block' -> 'TimelineBlock'
 *       'questionnaire_block' -> 'QuestionnaireBlock'
 */
function convertBlockTypeToComponentName(blockType) {
    // 步驟 1: 將 _block 移除
    // 'timeline_block' -> 'timeline'
    const withoutBlock = blockType.replace(/_block$/, '');

    // 步驟 2: 將下劃線後的字母轉大寫
    // 'timeline' -> 'timeline' (沒有下劃線,不變)
    // 'questionnaire_form' -> 'questionnaireForm'
    const camelCase = withoutBlock.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

    // 步驟 3: 首字母大寫並加上 Block
    // 'timeline' -> 'TimelineBlock'
    const pascalCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);

    return pascalCase + 'Block';
}
