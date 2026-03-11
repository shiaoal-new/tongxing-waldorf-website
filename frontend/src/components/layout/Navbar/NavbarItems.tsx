import { NavigationItem } from '../../../types/content';

/**
 * Navbar 導覽列共用組件與類型
 * 此文件已被模組化，實際組件位於同目錄下的獨立文件中
 */

// --- Types ---

export interface NavbarItemType extends NavigationItem {
    title: string;
    path?: string;
    children?: NavbarItemType[];
    action?: string;
    debugOnly?: boolean;
    image?: string;
    target?: string;
    description?: string;
    featuredItems?: NavbarItemType[];
    layout?: 'megamenu' | 'standard';
}

// --- Re-exports ---

export { NavbarActionItem } from './NavbarActionItem';
export { NavbarListItem } from './NavbarListItem';
export { MobileNavbarItem } from './MobileNavbarItem';
