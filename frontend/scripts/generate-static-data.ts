import fs from 'fs';
import path from 'path';
import { loadAllData, getDataDirectory } from '../src/lib/dataLoader';
import { getWordingDictionaryFromData, resolveWording } from '../src/lib/wording.server';

/**
 * 靜態資料導出腳本
 * 用於將 YAML 內容預先解析為 JSON，以支援靜態部署環境下的懶加載
 *
 * 改進：
 * 1. 自動掃描 data 目錄偵測所有 wording style，無需手動維護 STYLES 清單
 * 2. 過濾 _sourceFile，避免本機路徑洩漏至生產環境
 * 3. 生成後驗證完整性，確保每個 type+style 組合都有資料
 */

const DATA_TYPES = ['faq', 'faculty'] as const;

/**
 * 自動掃描指定目錄，偵測所有可用的 wording style 名稱
 * 例如 adapt.wording.default.yml → 'default'
 *      adapt.wording.funny.yml   → 'funny'
 */
function discoverStyles(dataType: string): string[] {
    const dataDir = getDataDirectory(dataType as any);
    if (!fs.existsSync(dataDir)) return ['default'];

    const styleSet = new Set<string>(['default']); // 預設包含 default
    const files = fs.readdirSync(dataDir);
    const wordingPattern = /\.wording\.([^.]+)\.ya?ml$/;

    for (const file of files) {
        const match = file.match(wordingPattern);
        if (match) styleSet.add(match[1]);
    }

    return Array.from(styleSet).sort();
}

/**
 * 遞迴移除物件中的 _sourceFile 欄位（避免本機路徑進入生產 JSON）
 */
function stripSourceFile<T>(data: T): T {
    if (Array.isArray(data)) {
        return data.map(stripSourceFile) as unknown as T;
    }
    if (data && typeof data === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
            if (key === '_sourceFile' || key === '_sourceLine') continue;
            result[key] = stripSourceFile(value);
        }
        return result as T;
    }
    return data;
}

async function generateStaticData() {
    console.log('🚀 Starting static data export...');

    // 確保目標目錄存在
    const outputBaseDir = path.join(process.cwd(), 'public/data-api');
    if (!fs.existsSync(outputBaseDir)) {
        fs.mkdirSync(outputBaseDir, { recursive: true });
    }

    const results: { type: string; style: string; count: number }[] = [];
    let hasError = false;

    for (const type of DATA_TYPES) {
        const styles = discoverStyles(type);
        console.log(`\n📦 Processing type: ${type} (styles: ${styles.join(', ')})`);

        const typeDir = path.join(outputBaseDir, type);
        if (!fs.existsSync(typeDir)) {
            fs.mkdirSync(typeDir, { recursive: true });
        }

        try {
            const rawData = loadAllData(type as any, { excludeWording: true });

            for (const style of styles) {
                // 針對每個項目單獨進行文字解析，以確保能找到對應的零散 wording 檔案
                const resolvedData = rawData.map(item => {
                    const dictionary = getWordingDictionaryFromData(item, type, style);
                    return resolveWording(item, dictionary);
                });

                // 移除 _sourceFile / _sourceLine，避免洩漏本機路徑
                const cleanData = stripSourceFile(resolvedData);

                const outputPath = path.join(typeDir, `${style}.json`);
                fs.writeFileSync(outputPath, JSON.stringify(cleanData, null, 2));
                console.log(`   ✅ ${style}.json — ${cleanData.length} items`);
                results.push({ type, style, count: cleanData.length });
            }
        } catch (error) {
            console.error(`   ❌ Failed to export ${type}:`, error);
            hasError = true;
        }
    }

    // 完整性驗證
    console.log('\n🔍 Verifying generated files...');
    let verifyFailed = false;
    for (const { type, style, count } of results) {
        const filePath = path.join(outputBaseDir, type, `${style}.json`);
        if (!fs.existsSync(filePath)) {
            console.error(`   ❌ Missing: ${type}/${style}.json`);
            verifyFailed = true;
        } else if (count === 0) {
            console.warn(`   ⚠️  Empty: ${type}/${style}.json (0 items — is this expected?)`);
        } else {
            console.log(`   ✅ ${type}/${style}.json (${count} items)`);
        }
    }

    if (hasError || verifyFailed) {
        console.error('\n❌ Static data export finished with errors. Build may be incomplete.');
        process.exit(1);
    }

    console.log('\n✨ Static data export completed successfully!');
}

generateStaticData().catch(err => {
    console.error('Fatal error during static data generation:', err);
    process.exit(1);
});
