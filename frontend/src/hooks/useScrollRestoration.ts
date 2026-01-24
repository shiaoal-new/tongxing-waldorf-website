import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Hook to manually handle scroll restoration.
 * Especially useful when Next.js built-in scroll restoration fails due to dynamic content.
 */
export function useScrollRestoration() {
    const router = useRouter();

    useEffect(() => {
        if (!('scrollRestoration' in window.history)) return;

        // Manual scroll restoration
        window.history.scrollRestoration = 'manual';

        const saveScrollPos = (url: string) => {
            sessionStorage.setItem(`scrollPos:${url}`, window.scrollY.toString());
        };

        const restoreScrollPos = (url: string) => {
            const scrollPos = sessionStorage.getItem(`scrollPos:${url}`);
            if (scrollPos) {
                // Use a small timeout to ensure content is rendered
                setTimeout(() => {
                    window.scrollTo(0, parseInt(scrollPos));
                }, 100);
            }
        };

        const handleRouteChangeStart = () => {
            saveScrollPos(router.asPath);
        };

        const handleRouteChangeComplete = (url: string) => {
            restoreScrollPos(url);
        };

        // Save scroll position on refresh/unload
        const handleBeforeUnload = () => {
            saveScrollPos(router.asPath);
        };

        // Initial restoration on mount
        restoreScrollPos(router.asPath);

        router.events.on('routeChangeStart', handleRouteChangeStart);
        router.events.on('routeChangeComplete', handleRouteChangeComplete);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            router.events.off('routeChangeStart', handleRouteChangeStart);
            router.events.off('routeChangeComplete', handleRouteChangeComplete);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [router]);
}
