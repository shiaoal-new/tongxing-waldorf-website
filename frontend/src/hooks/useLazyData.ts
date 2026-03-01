import { useState, useEffect, useRef, useCallback } from 'react';

export interface LazyDataOptions<T> {
    /** API 端點 URL */
    endpoint: string;
    /** Intersection Observer 的根邊界 (default: "200px") */
    rootMargin?: string;
    /** 是否在元素進入視口時自動獲取數據 (default: true) */
    autoFetch?: boolean;
    /** 初始數據（如果有） */
    initialData?: T | null;
}

export interface LazyDataState<T> {
    /** 數據 */
    data: T | null;
    /** 是否正在加載 */
    isLoading: boolean;
    /** 是否發生錯誤 */
    error: Error | null;
    /** 是否可見（進入視口） */
    isVisible: boolean;
    /** 手動觸發獲取數據 */
    fetchData: () => Promise<void>;
}

/**
 * useLazyData - 懶加載數據 Hook
 * 
 * 使用 Intersection Observer 監聽元素進入視口，
 * 當元素可見時才發起 API 請求獲取數據。
 * 
 * 用於優化首頁加載性能，減少初始頁面數據大小。
 * 
 * @example
 * ```tsx
 * function FacultySection() {
 *     const { ref, data, isLoading, error, isVisible } = useLazyData<Member[]>({
 *         endpoint: '/api/data/faculty',
 *         rootMargin: '300px'
 *     });
 * 
 *     return (
 *         <section ref={ref}>
 *             {isLoading && <LoadingSpinner />}
 *             {error && <ErrorMessage error={error} />}
 *             {data && <FacultyList members={data} />}
 *         </section>
 *     );
 * }
 * ```
 */
export function useLazyData<T>({
    endpoint,
    rootMargin = '200px',
    autoFetch = true,
    initialData = null,
}: LazyDataOptions<T>): LazyDataState<T> & { ref: React.RefObject<HTMLDivElement> } {
    const [data, setData] = useState<T | null>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // 獲取數據的函數
    const fetchData = useCallback(async () => {
        // 如果已經有數據，不再重複獲取
        if (hasFetched && data !== null) {
            return;
        }

        // 取消之前的請求
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setIsLoading(true);
        setError(null);

        const startTime = performance.now();

        try {
            const response = await fetch(endpoint, {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            const endTime = performance.now();

            if (process.env.NODE_ENV === 'development') {
                const size = JSON.stringify(result).length;
                console.log(
                    `[useLazyData] Loaded ${endpoint} in ${(endTime - startTime).toFixed(2)}ms ` +
                    `(${size.toLocaleString()} bytes)`
                );
            }

            setData(result);
            setHasFetched(true);
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                // 請求被取消，不設置錯誤狀態
                return;
            }
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
            console.error('[useLazyData] Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [endpoint, hasFetched, data]);

    // 設置 Intersection Observer
    useEffect(() => {
        if (!autoFetch) {
            return;
        }

        const element = containerRef.current;
        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // 當元素可見時自動獲取數據
                    fetchData();
                    // 一旦可見，斷開觀察器
                    observer.disconnect();
                }
            },
            {
                rootMargin,
                threshold: 0,
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [autoFetch, rootMargin, fetchData]);

    // 組件卸載時取消進行中的請求
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        ref: containerRef,
        data,
        isLoading,
        error,
        isVisible,
        fetchData,
    };
}

export default useLazyData;
