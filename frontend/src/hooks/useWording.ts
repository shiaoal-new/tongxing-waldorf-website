import { useState, useEffect } from 'react';
import { useWordingContext } from '../context/WordingContext';
import { resolveWording } from '../lib/wording';
import { isDevEnvironment } from '../lib/env';
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
            const styleToLoad = !isDevEnvironment() ? 'default' : currentStyle;
            const categories = [pageId, ...extraCategories];

            try {
                const results = await Promise.all(
                    categories.map(async (cat) => {
                        // Try API first (for dev server)
                        try {
                            const res = await fetch(`/api/wording?page=${cat}&style=${styleToLoad}`);
                            if (res.ok) {
                                const text = await res.text();
                                return yaml.load(text) || {};
                            }
                        } catch (apiError) {
                            // API not available, try static file (for static hosting)
                            console.log(`API not available for ${cat}, trying static file...`);
                        }

                        // Fallback to static file
                        try {
                            const staticRes = await fetch(`/data/wordings/${cat}/${styleToLoad}.yml`);
                            if (staticRes.ok) {
                                const text = await staticRes.text();
                                return yaml.load(text) || {};
                            }
                        } catch (staticError) {
                            console.warn(`Could not load static wording for ${cat}/${styleToLoad}`, staticError);
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
