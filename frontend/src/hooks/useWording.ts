import { useState, useEffect } from 'react';
import { useWordingContext } from '../context/WordingContext';
import { resolveWording } from '../lib/wording';
import yaml from 'js-yaml';

/**
 * useWording Hook 
 * @param pageId 頁面 ID (例如 "index")
 * @param initialData 原始數據
 * @param extraCategories 額外要加載的文案包 (例如 ["faq", "ui"])
 */
export function useWording<T>(pageId: string, initialData: T, extraCategories: string[] = []): T {
    const { getStyle } = useWordingContext();
    const currentStyle = getStyle(pageId);

    const [dictionary, setDictionary] = useState<any>(null);
    const [resolvedData, setResolvedData] = useState<T>(initialData);

    useEffect(() => {
        const loadDictionaries = async () => {
            const styleToLoad = process.env.NODE_ENV === 'production' ? 'default' : currentStyle;
            const categories = [pageId, ...extraCategories];

            try {
                const results = await Promise.all(
                    categories.map(async (cat) => {
                        const res = await fetch(`/api/wording?page=${cat}&style=${styleToLoad}`);
                        if (res.ok) {
                            const text = await res.ok ? await res.text() : '';
                            return yaml.load(text) || {};
                        }
                        return {};
                    })
                );

                // 深層合併字典 (Deep Merge)
                const deepMerge = (target: any, source: any) => {
                    for (const key in source) {
                        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                            if (!target[key]) target[key] = {};
                            deepMerge(target[key], source[key]);
                        } else {
                            target[key] = source[key];
                        }
                    }
                    return target;
                };

                const mergedDictionary = results.reduce((acc, curr) => deepMerge(acc, curr), {});
                setDictionary(mergedDictionary);
            } catch (e) {
                console.warn(`Could not load dictionaries for ${pageId}`, e);
                setDictionary({});
            }
        };

        loadDictionaries();
    }, [pageId, currentStyle, JSON.stringify(extraCategories)]);

    useEffect(() => {
        if (!dictionary) {
            setResolvedData(initialData);
            return;
        }

        const newResolved = resolveWording(initialData, dictionary);
        setResolvedData(newResolved);
    }, [initialData, dictionary]);

    return resolvedData;
}
