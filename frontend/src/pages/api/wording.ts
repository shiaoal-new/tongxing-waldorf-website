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

    const pageDir = path.join(process.cwd(), `src/data/wordings/${page}`);

    // 新增：列出該頁面所有的風格選項
    if (action === 'list') {
        if (!fs.existsSync(pageDir)) {
            return res.status(200).json(['default']); // 最少會有個預設
        }
        try {
            const files = fs.readdirSync(pageDir);
            const styles = files
                .filter(f => f.endsWith('.yml') || f.endsWith('.json'))
                .map(f => f.replace(/\.(yml|json)$/, ''));
            // 確保 default 永遠在前面
            const uniqueStyles = Array.from(new Set(['default', ...styles]));
            return res.status(200).json(uniqueStyles);
        } catch (e) {
            return res.status(500).send('Error listing styles');
        }
    }

    if (!style) {
        return res.status(400).send('Missing style');
    }

    const wordingPath = path.join(pageDir, `${style}.yml`);

    if (!fs.existsSync(wordingPath)) {
        // 如果 yml 不存在，嘗試回退到 json (相容過渡期)
        const jsonPath = path.join(pageDir, `${style}.json`);
        if (fs.existsSync(jsonPath)) {
            const content = fs.readFileSync(jsonPath, 'utf8');
            return res.status(200).send(content);
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
