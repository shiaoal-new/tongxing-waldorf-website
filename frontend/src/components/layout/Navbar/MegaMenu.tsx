import React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { NavbarItemType } from "./NavbarItems";
import { ThemeList } from "../../ui/DarkSwitch";

interface MegaMenuProps {
    items: NavbarItemType[];
    actionHandlers: Record<string, any>;
    showBackgroundGrid: boolean;
}

interface MegaMenuItemProps {
    item: NavbarItemType;
    actionHandlers: Record<string, any>;
    showBackgroundGrid: boolean;
}

const isItemActive = (item: NavbarItemType, currentPath: string): boolean => {
    if (!item.path) return false;
    if (item.path === '/') return currentPath === '/';
    return currentPath === item.path || currentPath.startsWith(item.path + '/');
};

const hasActiveChild = (item: NavbarItemType, currentPath: string): boolean => {
    if (item.children) {
        return item.children.some(child => isItemActive(child, currentPath) || hasActiveChild(child, currentPath));
    }
    return false;
};

function MegaMenuItem({ item, actionHandlers, showBackgroundGrid }: MegaMenuItemProps) {
    const router = useRouter();
    const currentPath = router.asPath.split('?')[0];
    const active = isItemActive(item, currentPath) || hasActiveChild(item, currentPath);

    // 处理 action 类型的菜单项
    if (item.action) {
        if (item.action === 'themeList') {
            return (
                <NavigationMenu.Item className="relative">
                    <NavigationMenu.Trigger
                        className={`inline-flex items-center px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300 group ${active
                            ? "text-brand-accent bg-brand-accent/5 font-medium"
                            : "text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5"
                            }`}
                    >
                        <span>{item.title}</span>
                    </NavigationMenu.Trigger>
                    <NavigationMenu.Content asChild>
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute left-0 top-full mt-2 w-48 origin-top z-50"
                        >
                            <div className="bg-brand-bg/95 dark:bg-brand-structural/95 backdrop-blur-md rounded-md shadow-lg ring-1 ring-black/5 overflow-hidden">
                                <ul className="menu menu-compact p-1">
                                    <ThemeList />
                                </ul>
                            </div>
                        </motion.div>
                    </NavigationMenu.Content>
                </NavigationMenu.Item>
            );
        }

        if (item.action === 'toggleGrid') {
            return (
                <NavigationMenu.Item>
                    <button
                        onClick={() => actionHandlers.toggleGrid(showBackgroundGrid)}
                        className={`inline-flex items-center justify-between px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300 ${active
                            ? "text-brand-accent bg-brand-accent/5 font-medium"
                            : "text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5"
                            }`}
                    >
                        <span>{item.title}</span>
                        <div className="relative ml-2" onClick={(e) => e.stopPropagation()}>
                            <div
                                className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${showBackgroundGrid ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <div
                                    className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ${showBackgroundGrid ? 'translate-x-5' : 'translate-x-0.5'
                                        } mt-0.5`}
                                />
                            </div>
                        </div>
                    </button>
                </NavigationMenu.Item>
            );
        }

        if (item.action === 'wordingStyle') {
            const { getStyle, setStyle } = actionHandlers.wordingContext;
            const rawPageId = router.asPath === '/' ? 'index' : router.asPath.split('/')[1].split('?')[0];
            const pageId = rawPageId || 'index';
            const currentStyle = getStyle(pageId);
            const [availableStyles, setAvailableStyles] = React.useState<string[]>(['default']);

            React.useEffect(() => {
                const fetchStyles = async () => {
                    try {
                        const res = await fetch(`/api/wording?page=${pageId}&action=list`);
                        if (res.ok) {
                            const styles = await res.json();
                            setAvailableStyles(styles);
                        }
                    } catch (e) {
                        setAvailableStyles(['default']);
                    }
                };
                fetchStyles();
            }, [pageId]);

            return (
                <NavigationMenu.Item className="relative">
                    <NavigationMenu.Trigger
                        className={`inline-flex items-center px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300 group ${active
                            ? "text-brand-accent bg-brand-accent/5 font-medium"
                            : "text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5"
                            }`}
                    >
                        <span>{item.title}</span>
                    </NavigationMenu.Trigger>
                    <NavigationMenu.Content asChild>
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute left-0 top-full mt-2 w-48 origin-top z-50"
                        >
                            <div className="bg-brand-bg/95 dark:bg-brand-structural/95 backdrop-blur-md rounded-md shadow-lg ring-1 ring-black/5 overflow-hidden">
                                <div className="p-2 border-b border-brand-taupe/10 text-[10px] text-brand-taupe px-3">
                                    目前頁面: {pageId}
                                </div>
                                <ul className="menu menu-compact p-1">
                                    {availableStyles.map((style: string) => (
                                        <li key={style}>
                                            <button
                                                onClick={() => setStyle(pageId, style)}
                                                className={`w-full text-left px-3 py-1.5 rounded text-xs flex justify-between items-center ${currentStyle === style
                                                    ? 'bg-brand-accent/10 text-brand-accent'
                                                    : 'hover:bg-brand-accent/5'
                                                    }`}
                                            >
                                                <span className="capitalize">{style}</span>
                                                {currentStyle === style && <span>✓</span>}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </NavigationMenu.Content>
                </NavigationMenu.Item>
            );
        }

        // 其他 action
        return (
            <NavigationMenu.Item>
                <button
                    onClick={actionHandlers[item.action]}
                    className={`inline-flex items-center px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300 ${active
                        ? "text-brand-accent bg-brand-accent/5 font-medium"
                        : "text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5"
                        }`}
                >
                    {item.title}
                </button>
            </NavigationMenu.Item>
        );
    }

    // 有子菜单的项目
    if (item.children && item.children.length > 0) {
        return (
            <NavigationMenu.Item className="relative">
                <NavigationMenu.Trigger
                    className={`inline-flex items-center px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300 group ${active
                        ? "text-brand-accent bg-brand-accent/5 font-medium"
                        : "text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5"
                        }`}
                >
                    <span>{item.title}</span>
                </NavigationMenu.Trigger>
                <NavigationMenu.Content asChild>
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-0 top-full mt-2 w-auto min-w-[200px] origin-top z-50"
                    >
                        <div className="bg-brand-bg/95 dark:bg-brand-structural/95 backdrop-blur-md rounded-md shadow-lg ring-1 ring-black/5 overflow-hidden">
                            <div className="py-1">
                                {item.children.map((child, idx) => {
                                    const childActive = isItemActive(child, currentPath) || hasActiveChild(child, currentPath);

                                    // 子菜单有孙子菜单
                                    if (child.children && child.children.length > 0) {
                                        return (
                                            <div key={idx} className="relative group/submenu">
                                                <div
                                                    className={`flex items-center justify-between px-4 py-2 text-sm transition-all cursor-pointer ${childActive
                                                        ? 'text-brand-accent bg-brand-accent/10 font-medium'
                                                        : 'text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5'
                                                        }`}
                                                >
                                                    <span>{child.title}</span>
                                                    <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                                                </div>

                                                {/* 三级菜单 */}
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileHover={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute left-full top-0 ml-1 w-48 opacity-0 invisible group-hover/submenu:opacity-100 group-hover/submenu:visible transition-all duration-200 z-50"
                                                >
                                                    <div className="bg-brand-bg/95 dark:bg-brand-structural/95 backdrop-blur-md rounded-md shadow-lg ring-1 ring-black/5 overflow-hidden">
                                                        <div className="py-1">
                                                            {child.children.map((grandChild, gIdx) => {
                                                                const grandChildActive = isItemActive(grandChild, currentPath);
                                                                return (
                                                                    <Link
                                                                        key={gIdx}
                                                                        href={grandChild.path || "#"}
                                                                        target={grandChild.target}
                                                                        rel={grandChild.target === '_blank' ? 'noopener noreferrer' : undefined}
                                                                        className={`block px-4 py-2 text-sm transition-all ${grandChildActive
                                                                            ? 'text-brand-accent bg-brand-accent/10 font-medium'
                                                                            : 'text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5'
                                                                            }`}
                                                                    >
                                                                        {grandChild.title}
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        );
                                    }

                                    // 普通子菜单项
                                    if (child.action) {
                                        if (child.action === 'themeList') {
                                            return (
                                                <div key={idx} className="relative group/submenu">
                                                    <div
                                                        className={`flex items-center justify-between px-4 py-2 text-sm transition-all cursor-pointer ${childActive
                                                            ? 'text-brand-accent bg-brand-accent/10 font-medium'
                                                            : 'text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5'
                                                            }`}
                                                    >
                                                        <span>{child.title}</span>
                                                        <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                                                    </div>
                                                    <div className="absolute left-full top-0 ml-1 w-48 opacity-0 invisible group-hover/submenu:opacity-100 group-hover/submenu:visible transition-all duration-200 z-50">
                                                        <div className="bg-brand-bg/95 dark:bg-brand-structural/95 backdrop-blur-md rounded-md shadow-lg ring-1 ring-black/5 overflow-hidden">
                                                            <ul className="menu menu-compact p-1">
                                                                <ThemeList />
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                onClick={actionHandlers[child.action]}
                                                className={`w-full text-left block px-4 py-2 text-sm transition-all ${childActive
                                                    ? 'text-brand-accent bg-brand-accent/10 font-medium'
                                                    : 'text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5'
                                                    }`}
                                            >
                                                {child.title}
                                            </button>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={idx}
                                            href={child.path || "#"}
                                            target={child.target}
                                            rel={child.target === '_blank' ? 'noopener noreferrer' : undefined}
                                            className={`block px-4 py-2 text-sm transition-all ${childActive
                                                ? 'text-brand-accent bg-brand-accent/10 font-medium'
                                                : 'text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5'
                                                }`}
                                        >
                                            {child.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </NavigationMenu.Content>
            </NavigationMenu.Item>
        );
    }

    // 普通链接项
    return (
        <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
                <Link
                    href={item.path || "#"}
                    target={item.target}
                    rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                    className={`inline-flex items-center px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300 ${active
                        ? "text-brand-accent bg-brand-accent/5 font-medium"
                        : "text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5"
                        }`}
                >
                    {item.title}
                </Link>
            </NavigationMenu.Link>
        </NavigationMenu.Item>
    );
}

export default function MegaMenu({ items, actionHandlers, showBackgroundGrid }: MegaMenuProps) {
    return (
        <NavigationMenu.Root className="relative">
            <NavigationMenu.List className="flex items-center justify-end gap-1">
                {items.map((item, index) => (
                    <MegaMenuItem
                        key={index}
                        item={item}
                        actionHandlers={actionHandlers}
                        showBackgroundGrid={showBackgroundGrid}
                    />
                ))}
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
