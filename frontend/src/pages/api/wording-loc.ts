import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { srcFile, srcLine, wordingFile } = req.query;
    
    if (!srcFile || typeof srcFile !== 'string') return res.status(400).json({ error: 'Missing srcFile' });
    if (!srcLine || typeof srcLine !== 'string') return res.status(400).json({ error: 'Missing srcLine' });
    if (!wordingFile || typeof wordingFile !== 'string') return res.status(400).json({ error: 'Missing wordingFile' });

    const root = process.cwd();
    const tryPaths = [
        path.join(root, srcFile),
        path.join(root, 'frontend', srcFile),
        path.join(root, srcFile.replace(/^frontend\//, '')),
        path.join(root, '..', srcFile),
        srcFile.startsWith('/') ? srcFile : ''
    ].filter(Boolean);

    let absSrcPath = tryPaths.find(p => fs.existsSync(p));
    
    if (!absSrcPath) {
        return res.status(404).json({ error: 'Source file not found: ' + srcFile });
    }

    const tryWordingPaths = [
        path.join(root, wordingFile),
        path.join(root, 'frontend', wordingFile),
        path.join(root, wordingFile.replace(/^frontend\//, '')),
        path.join(root, '..', wordingFile),
        wordingFile.startsWith('/') ? wordingFile : ''
    ].filter(Boolean);

    let absWordingPath = tryWordingPaths.find(p => fs.existsSync(p));

    if (!absWordingPath) {
        return res.status(404).json({ error: 'Wording file not found' });
    }

    const lineNum = parseInt(srcLine, 10);
    const srcLines = fs.readFileSync(absSrcPath, 'utf8').split('\n');
    let startLine = Math.max(0, lineNum - 1);
    
    let blockIndent = -1;
    let wordingId = null;

    // Search downwards for the first wording ID in the block
    for (let i = startLine; i < srcLines.length; i++) {
        const line = srcLines[i];
        if (line.trim().length === 0) continue;
        
        const indent = line.length - line.trimStart().length;
        if (blockIndent === -1) {
            blockIndent = indent;
        } else if (indent < blockIndent) {
            break; // Exited the block
        }
        
        const match = line.match(/:\s*(?:"|')?\$?([a-z][a-z0-9_-]*(?:\.[a-z0-9_-]+)+)(?:"|')?/i);
        if (match) {
            wordingId = match[1];
            break;
        }
    }

    if (!wordingId) {
        // Fallback search upwards
        for (let i = startLine - 1; i >= 0; i--) {
            const line = srcLines[i];
            if (line.trim().length === 0) continue;
            
            const indent = line.length - line.trimStart().length;
            if (indent < blockIndent) break; 
            
            const match = line.match(/:\s*(?:"|')?\$?([a-z][a-z0-9_-]*(?:\.[a-z0-9_-]+)+)(?:"|')?/i);
            if (match) {
                wordingId = match[1];
                break;
            }
        }
    }

    if (!wordingId) {
        return res.json({ file: absWordingPath, line: 1 });
    }

    const wContent = fs.readFileSync(absWordingPath, 'utf8');
    let foundLine = 1;

    try {
        // Attempt to use `yaml` parser AST if available
        const { parseDocument } = require('yaml');
        const doc = parseDocument(wContent);
        
        // Custom getter for arrays and objects
        function findNodeByPath(node: any, pathParts: string[]): any {
            if (pathParts.length === 0) return node;
            const part = pathParts[0];

            if (node && node.type === 'MAP') {
                const item = node.items.find((i: any) => i.key && i.key.value === part);
                if (item) return findNodeByPath(item.value, pathParts.slice(1)) || item.key;
            } else if (node && node.type === 'SEQ') {
                const index = parseInt(part, 10);
                if (node.items[index]) {
                    return findNodeByPath(node.items[index], pathParts.slice(1));
                }
            } else if (node && typeof node.get === 'function') {
                const child = node.get(part, true);
                if (child) return findNodeByPath(child, pathParts.slice(1));
            }

            return null;
        }

        const pathArr = wordingId.split('.');
        const targetNode = findNodeByPath(doc.contents, pathArr);

        if (targetNode && targetNode.range) {
            const startObj = targetNode.range[0];
            const textUpToStart = wContent.substring(0, startObj);
            foundLine = textUpToStart.split('\n').length;
            return res.json({ file: absWordingPath, line: foundLine, wordingId });
        }
    } catch (err) {
        // Ignore and fallback to manual parsing if yaml package missing or failed
    }

    // Fallback manual parser for array indexing and object indexing
    const wLines = wContent.split('\n');
    const parts = wordingId.split('.');
    let currentPartIdx = 0;
    
    let currentIndent = -1;
    let listIndexCounter = -1;

    for (let i = 0; i < wLines.length; i++) {
        const line = wLines[i];
        if (line.trim().startsWith('#') || line.trim().length === 0) continue;
        
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1].length : 0;
        
        const key = parts[currentPartIdx];
        const isArraySymbol = /^\d+$/.test(key);

        if (isArraySymbol) {
            if (line.trim().startsWith('-')) {
                 if (currentIndent === -1) {
                     currentIndent = indent;
                 }
                 // Handle list symbol indenting logic
                 if (indent === currentIndent || indent === currentIndent - 2 || indent === currentIndent + 2) {
                     listIndexCounter++;
                     if (listIndexCounter === parseInt(key, 10)) {
                         currentPartIdx++;
                         if (currentPartIdx === parts.length) {
                             foundLine = i + 1;
                             break;
                         } else {
                             const nextKey = parts[currentPartIdx];
                             const nextKeyRegex = new RegExp(`^\\s*-\\s+${nextKey}\\s*:`);
                             if (nextKeyRegex.test(line)) {
                                 currentPartIdx++;
                                 if (currentPartIdx === parts.length) {
                                     foundLine = i + 1;
                                     break;
                                 }
                             }
                             listIndexCounter = -1;
                             currentIndent = -1;
                         }
                     }
                 }
            }
        } else {
            const keyRegex = new RegExp(`^\\s*(?:-\\s+)?${key}\\s*:`);
            if (keyRegex.test(line)) {
                currentPartIdx++;
                if (currentPartIdx === parts.length) {
                    foundLine = i + 1;
                    break;
                }
                listIndexCounter = -1;
                currentIndent = -1;
            }
        }
    }

    return res.json({ file: absWordingPath, line: foundLine, wordingId });
}
