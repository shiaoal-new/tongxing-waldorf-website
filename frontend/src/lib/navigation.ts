import { NextRouter } from "next/router";
import { NavbarItemType } from "../components/layout/Navbar/NavbarItems";
import { PageData } from "../types/content";

/**
 * Checks if a navigation item is active based on the current path
 */
export const isItemActive = (item: NavbarItemType, currentPath: string): boolean => {
    if (!item.path) return false;
    if (item.path === '/') return currentPath === '/';
    return currentPath === item.path || currentPath.startsWith(item.path + '/');
};

/**
 * Checks if any child of a navigation item is active
 */
export const hasActiveChild = (item: NavbarItemType, currentPath: string): boolean => {
    return item.children?.some(child => isItemActive(child, currentPath) || hasActiveChild(child, currentPath)) ?? false;
};

/**
 * Extracts a page ID from the router for use with wording styles
 */
export const getPageIdFromRouter = (router: NextRouter) => {
    const pathParts = router.asPath.split('?')[0].split('/').filter(Boolean);
    if (pathParts.length > 0) {
        if (pathParts[0] === 'courses' && pathParts[1]) return pathParts[1];
        if (pathParts[0].startsWith('p-')) return pathParts[0]; // Specific dynamic page pattern
        return pathParts[0];
    }
    return 'index';
};

/**
 * Resolves item title and path base on slug and matches it with page data
 */
export const resolveNavigationItem = (item: any, pages: Partial<PageData>[] = []): NavbarItemType => {
    let resolvedTitle = item.title;
    let resolvedPath = item.path;

    if (item.slug) {
        const page = pages.find(p => p.slug === item.slug);
        if (page) {
            if (!resolvedTitle) resolvedTitle = page.title;
            if (!resolvedPath) resolvedPath = item.slug === 'index' ? '/' : `/${item.slug}`;
        }
    }

    const resolvedChildren = item.children 
        ? item.children.map((child: any) => resolveNavigationItem(child, pages)) 
        : undefined;

    return {
        ...item,
        title: resolvedTitle,
        path: resolvedPath,
        children: resolvedChildren
    };
};
