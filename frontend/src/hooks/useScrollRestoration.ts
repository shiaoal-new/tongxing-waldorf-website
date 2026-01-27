import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

/**
 * Global state that persists across component remounts during client-side navigation.
 */
let isPopStateGlobal = false;
let isFirstLoad = true; // Track if this is the very first time the hook/app is loading

if (typeof window !== 'undefined') {
    // Listen for back/forward navigation
    window.addEventListener('popstate', () => {
        isPopStateGlobal = true;
    });
}

/**
 * Hook to manually handle scroll restoration.
 * Correctly distinguishes between:
 * 1. Initial page load (Check if reload)
 * 2. Back/Forward navigation (Restore position)
 * 3. New navigation (Scroll to top)
 */
export function useScrollRestoration() {
    const router = useRouter();
    const scrollPositions = useRef<{ [key: string]: number }>({});
    const isRestoring = useRef(false);

    useEffect(() => {
        // Disable browser's default scroll restoration
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        const saveScrollPos = (url: string) => {
            if (isRestoring.current) return;

            const scrollY = window.scrollY;
            if (scrollY < 0) return; // iOS bounce

            scrollPositions.current[url] = scrollY;
            try {
                sessionStorage.setItem(`scrollPos:${url}`, scrollY.toString());
            } catch (e) { }
        };

        const restoreScrollPos = (url: string) => {
            let pos = 0;
            if (scrollPositions.current[url] !== undefined) {
                pos = scrollPositions.current[url];
            } else {
                try {
                    const sessionPos = sessionStorage.getItem(`scrollPos:${url}`);
                    if (sessionPos) pos = parseInt(sessionPos, 10);
                } catch (e) { }
            }

            if (pos > 0) {
                isRestoring.current = true;
                window.scrollTo(0, pos);

                // iOS and dynamic content handling
                const attempts = [10, 50, 100, 200, 400];
                attempts.forEach(delay => {
                    setTimeout(() => {
                        // Re-verify if we are still where we should be
                        // If user has manually scrolled a lot, we stop forcing
                        if (Math.abs(window.scrollY - pos) > 50 && window.scrollY > 100) {
                            return;
                        }
                        if (Math.abs(window.scrollY - pos) > 10) {
                            window.scrollTo(0, pos);
                        }
                    }, delay);
                });

                setTimeout(() => {
                    isRestoring.current = false;
                }, 500);
            }
        };

        const scrollToTop = () => {
            isRestoring.current = true;
            window.scrollTo(0, 0);

            // Repeat to ensure we win against any internal scroll restoration
            [10, 50, 100].forEach(delay => {
                setTimeout(() => {
                    if (window.scrollY > 0) {
                        window.scrollTo(0, 0);
                    }
                }, delay);
            });

            setTimeout(() => {
                isRestoring.current = false;
            }, 150);
        };

        let scrollTimeout: NodeJS.Timeout;
        const handleScroll = () => {
            if (isRestoring.current) return;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                saveScrollPos(router.asPath);
            }, 150);
        };

        const handleRouteChangeStart = () => {
            saveScrollPos(router.asPath);
        };

        const handleRouteChangeComplete = (url: string) => {
            if (isPopStateGlobal) {
                restoreScrollPos(url);
            } else {
                scrollToTop();
            }
            isPopStateGlobal = false;
        };

        const handleBeforeUnload = () => {
            saveScrollPos(router.asPath);
        };

        // Listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handleBeforeUnload);

        router.events.on('routeChangeStart', handleRouteChangeStart);
        router.events.on('routeChangeComplete', handleRouteChangeComplete);

        // Logic for current page hit (Initial mount or Route change)
        if (isFirstLoad) {
            // Check if actual document reload
            const navigationEntries = performance.getEntriesByType('navigation');
            const isReload = navigationEntries.length > 0 &&
                (navigationEntries[0] as PerformanceNavigationTiming).type === 'reload';

            if (isReload) {
                restoreScrollPos(router.asPath);
            } else {
                scrollToTop();
            }
            isFirstLoad = false;
        } else if (isPopStateGlobal) {
            // This case handles when the component mounts DUE to a popstate transition
            // (if it wasn't already handled by handleRouteChangeComplete)
            restoreScrollPos(router.asPath);
            isPopStateGlobal = false;
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handleBeforeUnload);
            router.events.off('routeChangeStart', handleRouteChangeStart);
            router.events.off('routeChangeComplete', handleRouteChangeComplete);
            clearTimeout(scrollTimeout);
        };
    }, [router]);
}
