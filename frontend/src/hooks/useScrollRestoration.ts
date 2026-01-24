import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

/**
 * Hook to manually handle scroll restoration.
 * Enhanced for iOS Safari compatibility.
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
            if (isRestoring.current) return; // Don't save 0 while restoring

            const scrollY = window.scrollY;
            if (scrollY < 0) return; // Ignore iOS overscroll bounce

            scrollPositions.current[url] = scrollY;
            try {
                sessionStorage.setItem(`scrollPos:${url}`, scrollY.toString());
            } catch (e) {
                // Ignore storage errors
            }
        };

        const restoreScrollPos = (url: string) => {
            let pos = 0;
            // First check memory cache (fastest)
            if (scrollPositions.current[url] !== undefined) {
                pos = scrollPositions.current[url];
            } else {
                // Fallback to session storage (persistence)
                try {
                    const sessionPos = sessionStorage.getItem(`scrollPos:${url}`);
                    if (sessionPos) pos = parseInt(sessionPos, 10);
                } catch (e) { }
            }

            if (pos > 0) {
                isRestoring.current = true;

                // Immediate restoration
                window.scrollTo(0, pos);

                // Multiple checks for iOS/laggy content
                // iOS Safari sometimes ignores the first scrollTo if layout isn't ready
                const attempts = [10, 50, 100, 200];
                attempts.forEach(delay => {
                    setTimeout(() => {
                        // Only force if we haven't scrolled manually away
                        // Allow small variance (browser quirks)
                        if (Math.abs(window.scrollY - pos) > 20) {
                            // User moved? or Failed restoration?
                            // We re-force only if still near top (failed restore)
                            if (window.scrollY < 50) {
                                window.scrollTo(0, pos);
                            }
                        }
                    }, delay);
                });

                // Cleanup flag
                setTimeout(() => {
                    isRestoring.current = false;
                }, 250);
            }
        };

        // Save scroll on scroll event (throttled) - essential for Mobile Safari
        // which might kill the page before 'routeChangeStart' or 'beforeunload' completes
        let scrollTimeout: NodeJS.Timeout;
        const handleScroll = () => {
            if (isRestoring.current) return;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                saveScrollPos(router.asPath);
            }, 100);
        };

        const handleRouteChangeStart = () => {
            saveScrollPos(router.asPath);
        };

        const handleRouteChangeComplete = (url: string) => {
            restoreScrollPos(url);
        };

        const handleBeforeUnload = () => {
            saveScrollPos(router.asPath);
        };

        // Listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handleBeforeUnload); // iOS workaround

        router.events.on('routeChangeStart', handleRouteChangeStart);
        router.events.on('routeChangeComplete', handleRouteChangeComplete);

        // Initial restore
        restoreScrollPos(router.asPath);

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
