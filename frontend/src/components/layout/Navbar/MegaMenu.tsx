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
    scroll: boolean;
}

interface MegaMenuItemProps {
    item: NavbarItemType;
    actionHandlers: Record<string, any>;
    showBackgroundGrid: boolean;
    scroll: boolean;
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

const SideSubMenu = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [flipLeft, setFlipLeft] = React.useState(false);

    React.useEffect(() => {
        const checkOverflow = () => {
            if (!containerRef.current) return;
            const parent = containerRef.current.parentElement;
            if (!parent) return;

            const parentRect = parent.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const submenuWidth = 192; // w-48 is 12rem = 192px (approx)

            // If showing to the right would go off-screen, flip to left
            if (parentRect.right + submenuWidth > viewportWidth - 20) {
                setFlipLeft(true);
            } else {
                setFlipLeft(false);
            }
        };

        const parent = containerRef.current?.parentElement;
        if (parent) {
            parent.addEventListener('mouseenter', checkOverflow);
            window.addEventListener('resize', checkOverflow);
            // Initial check
            checkOverflow();
            return () => {
                parent.removeEventListener('mouseenter', checkOverflow);
                window.removeEventListener('resize', checkOverflow);
            };
        }
    }, []);

    return (
        <div
            ref={containerRef}
            className={`absolute top-0 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto ${flipLeft ? 'right-full -translate-x-1' : 'left-full translate-x-1'
                } ${className}`}
        >
            {children}
        </div>
    );
};

const WordingStyleContent = ({ actionHandlers, pageId }: { actionHandlers: any, pageId: string }) => {
    const { getStyle, setStyle } = actionHandlers.wordingContext;
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
    );
};

function MegaMenuItem({ item, actionHandlers, showBackgroundGrid, scroll }: MegaMenuItemProps) {
    const router = useRouter();
    const currentPath = router.asPath.split('?')[0];
    const active = isItemActive(item, currentPath) || hasActiveChild(item, currentPath);

    const textColorClass = active
        ? "text-brand-accent bg-brand-accent/5 font-medium"
        : `${scroll ? "text-brand-text dark:text-brand-bg" : "text-white/50 dark:text-white group-hover/navbar:text-brand-text dark:group-hover/navbar:text-brand-bg"} hover:text-brand-accent hover:bg-brand-accent/5`;

    // 处理 action 类型的菜单项
    if (item.action) {
        if (item.action === 'themeList') {
            return (
                <NavigationMenu.Item className="relative">
                    <NavigationMenu.Trigger
                        className={`inline-flex items-center px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300 group ${textColorClass}`}
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
                        className={`inline-flex items-center justify-between px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300 ${textColorClass}`}
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
            const pathParts = router.asPath.split('?')[0].split('/').filter(Boolean);
            let pageId = 'index';
            if (pathParts.length > 0) {
                if (pathParts[0] === 'courses' && pathParts[1]) {
                    pageId = pathParts[1];
                } else {
                    pageId = pathParts[0];
                }
            }

            return (
                <NavigationMenu.Item className="relative">
                    <NavigationMenu.Trigger
                        className={`inline-flex items-center px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300 group ${textColorClass}`}
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
                            <WordingStyleContent actionHandlers={actionHandlers} pageId={pageId} />
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
                    className={`inline-flex items-center px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300 ${textColorClass}`}
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
                    className={`inline-flex items-center px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300 group ${textColorClass}`}
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
                        <div className="bg-brand-bg/95 dark:bg-brand-structural/95 backdrop-blur-md rounded-md shadow-lg ring-1 ring-black/5">
                            <div className="py-1">
                                {item.children.map((child, idx) => {
                                    const childActive = isItemActive(child, currentPath) || hasActiveChild(child, currentPath);

                                    // 子菜单有孙子菜单
                                    if (child.children && child.children.length > 0) {
                                        return (
                                            <div key={idx} className="relative group">
                                                <div
                                                    className={`flex items-center justify-between px-4 py-2 text-sm transition-all cursor-pointer ${childActive
                                                        ? 'text-brand-accent bg-brand-accent/10 font-medium'
                                                        : 'text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5'
                                                        }`}
                                                >
                                                    <span>{child.title}</span>
                                                    <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                                                </div>

                                                {/* 三級菜單 */}
                                                <SideSubMenu>
                                                    <div className="bg-brand-bg/95 dark:bg-brand-structural/95 backdrop-blur-md rounded-md shadow-lg ring-1 ring-black/5">
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
                                                </SideSubMenu>
                                            </div>
                                        );
                                    }

                                    // 普通子菜单项
                                    if (child.action) {
                                        if (child.action === 'themeList') {
                                            return (
                                                <div key={idx} className="relative group">
                                                    <div
                                                        className={`flex items-center justify-between px-4 py-2 text-sm transition-all cursor-pointer ${childActive
                                                            ? 'text-brand-accent bg-brand-accent/10 font-medium'
                                                            : 'text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5'
                                                            }`}
                                                    >
                                                        <span>{child.title}</span>
                                                        <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                                                    </div>
                                                    <SideSubMenu>
                                                        <div className="bg-brand-bg/95 dark:bg-brand-structural/95 backdrop-blur-md rounded-md shadow-lg ring-1 ring-black/5">
                                                            <ul className="menu menu-compact p-1">
                                                                <ThemeList />
                                                            </ul>
                                                        </div>
                                                    </SideSubMenu>
                                                </div>
                                            );
                                        }

                                        if (child.action === 'wordingStyle') {
                                            const pathParts = router.asPath.split('?')[0].split('/').filter(Boolean);
                                            let pageId = 'index';
                                            if (pathParts.length > 0) {
                                                if (pathParts[0] === 'courses' && pathParts[1]) {
                                                    pageId = pathParts[1];
                                                } else {
                                                    pageId = pathParts[0];
                                                }
                                            }

                                            return (
                                                <div key={idx} className="relative group">
                                                    <div
                                                        className={`flex items-center justify-between px-4 py-2 text-sm transition-all cursor-pointer ${childActive
                                                            ? 'text-brand-accent bg-brand-accent/10 font-medium'
                                                            : 'text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5'
                                                            }`}
                                                    >
                                                        <span>{child.title}</span>
                                                        <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                                                    </div>
                                                    <SideSubMenu>
                                                        <WordingStyleContent actionHandlers={actionHandlers} pageId={pageId} />
                                                    </SideSubMenu>
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
                    className={`inline-flex items-center px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300 ${textColorClass}`}
                >
                    {item.title}
                </Link>
            </NavigationMenu.Link>
        </NavigationMenu.Item>
    );
}

export default function MegaMenu({ items, actionHandlers, showBackgroundGrid, scroll }: MegaMenuProps) {
    return (
        <NavigationMenu.Root className="relative">
            <NavigationMenu.List className="flex items-center justify-end gap-1">
                {items.map((item, index) => (
                    <MegaMenuItem
                        key={index}
                        item={item}
                        actionHandlers={actionHandlers}
                        showBackgroundGrid={showBackgroundGrid}
                        scroll={scroll}
                    />
                ))}
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
