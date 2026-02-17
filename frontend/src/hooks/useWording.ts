import { useState, useEffect } from 'react';
import { useWordingContext } from '../context/WordingContext';
import { resolveWording } from '../lib/wording';
import yaml from 'js-yaml';

/**
 * useWording Hook 
 * @param pageId 頁面 ID (例如 "index")
 * @param initialData 原始數據 (already resolved with default wording from server)
 * @param extraCategories 額外要加載的文案包 (例如 ["faq", "ui"])
 * 
 * Since getStaticProps always resolves default wordings at build time,
 * this hook only fetches and re-resolves when the user switches to a non-default style.
 */
export function useWording<T>(pageId: string, initialData: T, extraCategories: string[] = []): T {
    const { getStyle, reportMissingKeys } = useWordingContext();
    const currentStyle = getStyle(pageId);

    const [resolvedData, setResolvedData] = useState<T>(initialData);

    useEffect(() => {
        // Default style is already resolved server-side, no need to fetch again.
        if (currentStyle === 'default') {
            setResolvedData(initialData);
            return;
        }

        // Only fetch dictionary from client when user switches to non-default style.
        const loadDictionaries = async () => {
            const categories = [pageId, ...extraCategories];

            try {
                const results = await Promise.all(
                    categories.map(async (cat) => {
                        // Try API first (for dev server)
                        try {
                            const res = await fetch(`/api/wording?page=${cat}&style=${currentStyle}`);
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
                            const staticRes = await fetch(`/data/wordings/${cat}/${currentStyle}.yml`);
                            if (staticRes.ok) {
                                const text = await staticRes.text();
                                return yaml.load(text) || {};
                            }
                        } catch (staticError) {
                            console.warn(`Could not load static wording for ${cat}/${currentStyle}`, staticError);
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

                const missing: string[] = [];
                const newResolved = resolveWording(initialData, mergedDictionary, (key) => {
                    missing.push(key);
                });

                if (missing.length > 0) {
                    reportMissingKeys(missing);
                }

                setResolvedData(newResolved);
            } catch (e) {
                console.warn(`Could not load dictionaries for ${pageId}`, e);
            }
        };

        loadDictionaries();
    }, [pageId, currentStyle, JSON.stringify(extraCategories)]);

    return resolvedData;
}

