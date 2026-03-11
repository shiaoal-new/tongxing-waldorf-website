import { useState, useEffect } from "react";

/**
 * Hook to fetch available wording styles for a specific page.
 */
export const useWordingStyles = (pageId: string) => {
    const [availableStyles, setAvailableStyles] = useState<string[]>(['default']);

    useEffect(() => {
        const fetchStyles = async () => {
            try {
                // Try static manifest first (works in static export)
                const manifestRes = await fetch('/data/wordings/manifest.json');
                if (manifestRes.ok) {
                    const manifest = await manifestRes.json();
                    if (manifest[pageId]) {
                        setAvailableStyles(manifest[pageId]);
                        return;
                    }
                }
            } catch { /* ignore */ }

            try {
                // Fallback to API (works in dev server)
                const res = await fetch(`/api/wording?page=${pageId}&action=list`);
                if (res.ok) {
                    const styles = await res.json();
                    setAvailableStyles(styles);
                }
            } catch {
                setAvailableStyles(['default']);
            }
        };
        fetchStyles();
    }, [pageId]);

    return availableStyles;
};
