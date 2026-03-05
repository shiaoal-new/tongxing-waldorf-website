import { useEffect, useRef } from 'react';

interface UseVisibilityTriggerOptions {
    rootMargin?: string;
    /** 設為 false 時不啟動 Observer（例如資料已載入，不需觀察） */
    enabled?: boolean;
}

/**
 * 當 ref 元素進入視口時，觸發一次 onVisible callback。
 * 純觀察職責 — 不處理任何 UI 或資料邏輯。
 */
export function useVisibilityTrigger(
    ref: React.RefObject<HTMLElement | null>,
    onVisible: () => void,
    { rootMargin = '300px', enabled = true }: UseVisibilityTriggerOptions = {}
) {
    const hasTriggeredRef = useRef(false);
    // 用 ref 追蹤最新 callback，避免 observer 閉包舊值
    const onVisibleRef = useRef(onVisible);
    useEffect(() => { onVisibleRef.current = onVisible; }, [onVisible]);

    useEffect(() => {
        if (!enabled || hasTriggeredRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasTriggeredRef.current) {
                    hasTriggeredRef.current = true;
                    onVisibleRef.current();
                    observer.disconnect();
                }
            },
            { rootMargin, threshold: 0 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref, rootMargin, enabled]);
}
