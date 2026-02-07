import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * Wording API - 用於在開發環境下讀取文案 YAML
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { page, style, action } = req.query;

    if (!page) {
        return res.status(400).send('Missing page');
    }

    const searchDirs = ['pages', 'courses', 'faq'];
    const baseCwd = process.cwd();
    const possibleRoots = [baseCwd, path.join(baseCwd, 'frontend')];

    // 新增：列出該頁面所有的風格選項
    if (action === 'list') {
        let styles: string[] = [];

        // 1. Check new structure in multiple potential folders
        for (const root of possibleRoots) {
            for (const dir of searchDirs) {
                const dirPath = path.join(root, `src/data/${dir}`);
                if (fs.existsSync(dirPath)) {
                    const files = fs.readdirSync(dirPath);
                    const newStyles = files
                        .filter(f => f.startsWith(`${page}.wording.`) && (f.endsWith('.yml') || f.endsWith('.yaml')))
                        .map(f => f.replace(`${page}.wording.`, '').replace(/\.(yml|yaml)$/, ''));
                    styles = [...styles, ...newStyles];
                }
            }
        }

        // 2. Check old structure fallback
        for (const root of possibleRoots) {
            const oldPageDirRoot = path.join(root, `src/data/wordings/${page}`);
            if (fs.existsSync(oldPageDirRoot)) {
                try {
                    const files = fs.readdirSync(oldPageDirRoot);
                    const oldStyles = files
                        .filter(f => f.endsWith('.yml') || f.endsWith('.json'))
                        .map(f => f.replace(/\.(yml|json)$/, ''));
                    styles = [...styles, ...oldStyles];
                } catch (e) {
                    console.error('Error listing old styles');
                }
            }
        }

        // 確保 default 永遠在前面且唯一
        const uniqueStyles = Array.from(new Set(['default', ...styles]));
        return res.status(200).json(uniqueStyles);
    }

    if (!style) {
        return res.status(400).send('Missing style');
    }

    // Try new paths first
    let wordingPath: string | null = null;

    for (const root of possibleRoots) {
        if (wordingPath) break;
        for (const dir of searchDirs) {
            const p1 = path.join(root, `src/data/${dir}/${page}.wording.${style}.yml`);
            const p2 = path.join(root, `src/data/${dir}/${page}.wording.${style}.yaml`);
            if (fs.existsSync(p1)) {
                wordingPath = p1;
                break;
            }
            if (fs.existsSync(p2)) {
                wordingPath = p2;
                break;
            }
        }
    }

    // Fallback to old path
    if (!wordingPath) {
        for (const root of possibleRoots) {
            const oldPath = path.join(root, `src/data/wordings/${page}/${style}.yml`);
            if (fs.existsSync(oldPath)) {
                wordingPath = oldPath;
                break;
            }
        }
    }

    if (!wordingPath || !fs.existsSync(wordingPath)) {
        // 如果 yml 不存在，嘗試回退到 json (相容過渡期)
        for (const root of possibleRoots) {
            const jsonPath = path.join(root, `src/data/wordings/${page}/${style}.json`);
            if (fs.existsSync(jsonPath)) {
                const content = fs.readFileSync(jsonPath, 'utf8');
                return res.status(200).send(content);
            }
        }
        return res.status(404).send('Wording file not found');
    }

    try {
        const content = fs.readFileSync(wordingPath, 'utf8');
        res.status(200).send(content);
    } catch (error) {
        res.status(500).send('Error reading wording file');
    }
}
