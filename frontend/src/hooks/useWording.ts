import { useState, useEffect } from 'react';
import { useWordingContext } from '../context/WordingContext';
import { deepMerge } from '../lib/utils';
import { resolveWording } from '../lib/wording';
import yaml from 'js-yaml';

/**
 * useWording Hook 
 * @param pageId 頁面 ID (例如 "index")
 * @param initialData 原始數據 (already resolved with default wording from server)
 * @param rawDataOrExtraCategories (Optional) Raw data with keys OR extra categories array (backward compatibility)
 * @param extraCategoriesArgs (Optional) Extra categories array if rawData is provided
 * 
 * Since getStaticProps always resolves default wordings at build time,
 * this hook only fetches and re-resolves when the user switches to a non-default style.
 */
export function useWording<T>(
    pageId: string,
    initialData: T,
    rawDataOrExtraCategories?: T | string[],
    extraCategoriesArgs: string[] = []
): T {
    const { getStyle, reportMissingKeys } = useWordingContext();
    const currentStyle = getStyle(pageId);

    // Determine arguments
    let rawData: T = initialData;
    let extraCategories: string[] = extraCategoriesArgs;

    if (Array.isArray(rawDataOrExtraCategories)) {
        // Case: useWording(pageId, initialData, ["faq"])
        extraCategories = rawDataOrExtraCategories;
    } else if (rawDataOrExtraCategories) {
        // Case: useWording(pageId, initialData, rawData, ["faq"])
        rawData = rawDataOrExtraCategories;
    }

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

                const mergedDictionary = results.reduce((acc, curr) => deepMerge(acc, curr), {});

                const missing: string[] = [];
                // Use rawData for resolution to ensure keys are available
                const newResolved = resolveWording(rawData, mergedDictionary, (key) => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageId, currentStyle, JSON.stringify(extraCategories)]);

    return resolvedData;
}
