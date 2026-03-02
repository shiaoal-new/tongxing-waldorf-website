import fs from 'fs';
import path from 'path';
import { loadYamlWithIncludes } from './yaml-loader';
import { deepMerge } from './utils';
import { resolveWording } from './wording';
import { CONFIG } from './config';

export { resolveWording };

/**
 * 伺服器端獲取文案字典 (用於 getStaticProps)
 * 此檔案僅在 Node.js 環境中使用
 */
export function getWordingDictionary(pageId: string, style: string = CONFIG.UI.DEFAULT_STYLE, extraCategories: string[] = []) {
    const categories = [pageId, ...extraCategories];
    let mergedDictionary = {};

    const searchDirs = CONFIG.DATA.SEARCH_DIRS;
    const baseCwd = process.cwd();
    const possibleRoots = [baseCwd, path.join(baseCwd, 'frontend')];

    categories.forEach(cat => {
        let filePath: string | null = null;
        let folderFiles: string[] = [];

        // 1. Check new structure in multiple potential folders
        for (const root of possibleRoots) {
            for (const dir of searchDirs) {
                // Check for single file
                const newPath = path.join(root, `src/data/${dir}/${cat}.wording.${style}.yml`);
                if (fs.existsSync(newPath)) {
                    filePath = newPath;
                    // Note: If we find a single file, we stop checking other root/dirs for THE MAIN file, 
                    // but we will still check for folder-based aggregation below.
                    break;
                }
            }
            if (filePath) break;
        }

        // Check if there is a folder named 'cat' inside any of the search dirs
        // This allows aggregating all *.wording.style.yml files in e.g. src/data/faq/
        for (const root of possibleRoots) {
            for (const dir of searchDirs) {
                const potentialFolder = path.join(root, `src/data/${dir}`);
                if (fs.existsSync(potentialFolder) && potentialFolder.endsWith(`/${cat}`)) {
                    try {
                        const files = fs.readdirSync(potentialFolder);
                        const matching = files
                            .filter(f => f.includes(`.wording.${style}.`) && (f.endsWith('.yml') || f.endsWith('.yaml')))
                            .map(f => path.join(potentialFolder, f));
                        folderFiles = [...folderFiles, ...matching];
                    } catch (e) {
                        console.error(`Error reading folder for wording aggregation: ${potentialFolder}`, e);
                    }
                }
            }
        }

        // 2. Fallback to old path: src/data/wordings/cat/style.yml
        if (!filePath && folderFiles.length === 0) {
            for (const root of possibleRoots) {
                const oldPath = path.join(root, `src/data/${CONFIG.DATA.WORDING_FALLBACK_DIR}/${cat}/${style}.yml`);
                if (fs.existsSync(oldPath)) {
                    filePath = oldPath;
                    break;
                }
            }
        }

        // Merge main file
        if (filePath && fs.existsSync(filePath)) {
            try {
                const data = loadYamlWithIncludes(filePath);
                mergedDictionary = deepMerge(mergedDictionary, data);
            } catch (e) {
                console.error(`Error loading wording for ${cat}:`, e);
            }
        }

        // Merge folder files
        folderFiles.forEach(f => {
            try {
                const data = loadYamlWithIncludes(f);
                mergedDictionary = deepMerge(mergedDictionary, data);
            } catch (e) {
                console.error(`Error loading aggregate wording for ${cat} from ${f}:`, e);
            }
        });
    });

    return mergedDictionary;
}

/**
 * 根據傳入的 data (包含 _sourceFile)，自動掃描並載入相關的 wording 檔案
 * 用於在伺服器端自動加載被 include 進來的模組其對應的 wording 檔
 */
export function getWordingDictionaryFromData(data: any, pageId: string, style: string = CONFIG.UI.DEFAULT_STYLE, extraCategories: string[] = []) {
    let mergedDictionary = getWordingDictionary(pageId, style, extraCategories);

    const sourceFiles = new Set<string>();

    const extractSourceFiles = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        if (obj._sourceFile) {
            sourceFiles.add(obj._sourceFile as string);
        }
        if (Array.isArray(obj)) {
            obj.forEach(extractSourceFiles);
        } else {
            for (const key in obj) {
                if (key !== '_sourceFile') {
                    extractSourceFiles(obj[key]);
                }
            }
        }
    };

    extractSourceFiles(data);

    sourceFiles.forEach(sourcePath => {
        const dir = path.dirname(sourcePath);
        const ext = path.extname(sourcePath);
        const baseName = path.basename(sourcePath, ext);

        const wordingPath = path.join(dir, `${baseName}.wording.${style}.yml`);

        if (fs.existsSync(wordingPath)) {
            try {
                const wordingData = loadYamlWithIncludes(wordingPath);
                mergedDictionary = deepMerge(mergedDictionary, wordingData);
            } catch (e) {
                console.error(`Error loading auto wording from ${wordingPath}:`, e);
            }
        }
    });

    return mergedDictionary;
}
