import React, { useRef, useState, useEffect } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { NavbarItemType } from "./NavbarItems";
import { ThemeList } from "../../ui/DarkSwitch";

// --- Types ---

interface MegaMenuProps {
    items: NavbarItemType[];
    actionHandlers: Record<string, any>;
    showBackgroundGrid: boolean;
    scroll: boolean;
}

interface CommonItemProps {
    item: NavbarItemType;
    styles: string;
    actionHandlers?: Record<string, any>;
}

// --- Hooks ---

const useSubMenuPosition = (ref: React.RefObject<HTMLDivElement>) => {
    const [flipLeft, setFlipLeft] = useState(false);

    useEffect(() => {
        const checkOverflow = () => {
            if (!ref.current) return;
            const parent = ref.current.parentElement;
            if (!parent) return;

            const parentRect = parent.getBoundingClientRect();
            const submenuWidth = 192; // 12rem

            setFlipLeft(parentRect.right + submenuWidth > window.innerWidth - 20);
        };

        const parent = ref.current?.parentElement;
        if (parent) {
            parent.addEventListener('mouseenter', checkOverflow);
            window.addEventListener('resize', checkOverflow);
            checkOverflow();
            return () => {
                parent.removeEventListener('mouseenter', checkOverflow);
                window.removeEventListener('resize', checkOverflow);
            };
        }
    }, [ref]);

    return flipLeft;
};

const useWordingStyles = (pageId: string) => {
    const [availableStyles, setAvailableStyles] = useState<string[]>(['default']);

    useEffect(() => {
        const fetchStyles = async () => {
            try {
                const res = await fetch(`/api/wording?page=${pageId}&action=list`);
                if (res.ok) setAvailableStyles(await res.json());
            } catch {
                setAvailableStyles(['default']);
            }
        };
        fetchStyles();
    }, [pageId]);

    return availableStyles;
};

// --- Helpers ---

const isItemActive = (item: NavbarItemType, currentPath: string): boolean => {
    if (!item.path) return false;
    if (item.path === '/') return currentPath === '/';
    return currentPath === item.path || currentPath.startsWith(item.path + '/');
};

const hasActiveChild = (item: NavbarItemType, currentPath: string): boolean => {
    return item.children?.some(child => isItemActive(child, currentPath) || hasActiveChild(child, currentPath)) ?? false;
};

const getPageIdFromRouter = (router: ReturnType<typeof useRouter>) => {
    const pathParts = router.asPath.split('?')[0].split('/').filter(Boolean);
    if (pathParts.length > 0) {
        if (pathParts[0] === 'courses' && pathParts[1]) return pathParts[1];
        return pathParts[0];
    }
    return 'index';
};

const getItemStyles = (active: boolean, scroll: boolean) => {
    const base = "inline-flex items-center px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300";
    if (active) {
        return `${base} text-brand-accent bg-brand-accent/5 font-medium`;
    }
    const inactiveColor = scroll
        ? "text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5"
        : "text-white/50 dark:text-white group-hover/navbar:text-brand-text dark:group-hover/navbar:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5";
    return `${base} ${inactiveColor}`;
};

const getSubItemStyles = (active: boolean) => {
    const base = "flex items-center justify-between px-4 py-2 text-sm transition-all cursor-pointer";
    if (active) return `${base} text-brand-accent bg-brand-accent/10 font-medium`;
    return `${base} text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5`;
};

// --- Sub-Components ---

const MenuCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-brand-bg/95 dark:bg-brand-structural/95 backdrop-blur-md rounded-md shadow-lg ring-1 ring-black/5 ${className}`}>
        {children}
    </div>
);

const SideSubMenu = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const flipLeft = useSubMenuPosition(containerRef);

    return (
        <div
            ref={containerRef}
            className={`absolute top-0 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto ${flipLeft ? 'right-full pr-1' : 'left-full pl-1'} ${className}`}
        >
            {children}
        </div>
    );
};

const WordingStyleContent = ({ actionHandlers, pageId }: { actionHandlers: any, pageId: string }) => {
    const { getStyle, setStyle } = actionHandlers.wordingContext;
    const currentStyle = getStyle(pageId);
    const availableStyles = useWordingStyles(pageId);

    return (
        <MenuCard className="overflow-hidden">
            <div className="p-2 border-b border-brand-taupe/10 text-[10px] text-brand-taupe px-3">
                目前頁面: {pageId}
            </div>
            <ul className="menu menu-compact p-1">
                {availableStyles.map((style) => (
                    <li key={style}>
                        <button
                            onClick={() => setStyle(pageId, style)}
                            className={`w-full text-left px-3 py-1.5 rounded text-xs flex justify-between items-center ${currentStyle === style ? 'bg-brand-accent/10 text-brand-accent' : 'hover:bg-brand-accent/5'}`}
                        >
                            <span className="capitalize">{style}</span>
                            {currentStyle === style && <span>✓</span>}
                        </button>
                    </li>
                ))}
            </ul>
        </MenuCard>
    );
};

// Renamed from DropdownContentWrapper and removed overflow-hidden and styling
const DropdownTransition = ({ children, shakeKey = 0 }: { children: React.ReactNode, shakeKey?: number }) => {
    const controls = useAnimation();
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Skip the animation on the very first render (when the menu first opens via hover)
        // This prevents the menu from "jumping" every time it is opened if shakeKey > 0
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (shakeKey > 0) {
            controls.start({
                y: [0, -10, 0, -5, 0],
                transition: { duration: 0.4, ease: "easeInOut" }
            });
        }
    }, [shakeKey, controls]);

    return (
        <NavigationMenu.Content asChild>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-0 top-full pt-2 w-auto min-w-[200px] origin-top z-50 pointer-events-none"
            >
                <div className="pointer-events-auto">
                    <motion.div animate={controls}>
                        {children}
                    </motion.div>
                </div>
            </motion.div>
        </NavigationMenu.Content>
    );
};

// --- Menu Item Types ---

const ThemeListItem = ({ item, styles }: CommonItemProps) => {
    const [shakeKey, setShakeKey] = useState(0);
    return (
        <NavigationMenu.Item className="relative">
            <NavigationMenu.Trigger
                className={`${styles} group`}
                onPointerDown={(e) => {
                    setShakeKey(prev => prev + 1);
                    e.preventDefault(); // 阻止 Radix UI 的切換行為
                }}
                onClick={(e) => e.preventDefault()}
            >
                <span>{item.title}</span>
            </NavigationMenu.Trigger>
            <DropdownTransition shakeKey={shakeKey}>
                <MenuCard className="overflow-hidden">
                    <ul className="menu menu-compact p-1">
                        <ThemeList />
                    </ul>
                </MenuCard>
            </DropdownTransition>
        </NavigationMenu.Item>
    );
};

const GridToggleItem = ({ item, styles, showGrid, onToggle }: CommonItemProps & { showGrid: boolean, onToggle: (v: boolean) => void }) => (
    <NavigationMenu.Item>
        <button onClick={() => onToggle(showGrid)} className={`justify-between ${styles}`}>
            <span>{item.title}</span>
            <div className="relative ml-2" onClick={(e) => e.stopPropagation()}>
                <div className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${showGrid ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ${showGrid ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
                </div>
            </div>
        </button>
    </NavigationMenu.Item>
);

const WordingStyleItem = ({ item, styles, actionHandlers }: CommonItemProps) => {
    const router = useRouter();
    const pageId = getPageIdFromRouter(router);
    const [shakeKey, setShakeKey] = useState(0);

    return (
        <NavigationMenu.Item className="relative">
            <NavigationMenu.Trigger
                className={`${styles} group`}
                onPointerDown={(e) => {
                    setShakeKey(prev => prev + 1);
                    e.preventDefault(); // 阻止 Radix UI 的切換行為
                }}
                onClick={(e) => e.preventDefault()}
            >
                <span>{item.title}</span>
            </NavigationMenu.Trigger>
            <DropdownTransition shakeKey={shakeKey}>
                <WordingStyleContent actionHandlers={actionHandlers} pageId={pageId} />
            </DropdownTransition>
        </NavigationMenu.Item>
    );
};

const SubMenuItem = ({ item, currentPath, actionHandlers }: { item: NavbarItemType, currentPath: string, actionHandlers: any }) => {
    const router = useRouter();
    const active = isItemActive(item, currentPath) || hasActiveChild(item, currentPath);
    const styles = getSubItemStyles(active);

    // Has Grandchildren
    if (item.children?.length) {
        return (
            <div className="relative group">
                <div className={styles}>
                    <span>{item.title}</span>
                    <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                </div>
                <SideSubMenu>
                    <MenuCard className="py-1">
                        {item.children.map((grandChild, idx) => {
                            const gcActive = isItemActive(grandChild, currentPath);
                            const gcStyles = getSubItemStyles(gcActive).replace('flex items-center justify-between', 'block');
                            return (
                                <NavigationMenu.Link asChild key={idx}>
                                    <Link
                                        href={grandChild.path || "#"}
                                        target={grandChild.target}
                                        rel={grandChild.target === '_blank' ? 'noopener noreferrer' : undefined}
                                        className={gcStyles}
                                    >
                                        {grandChild.title}
                                    </Link>
                                </NavigationMenu.Link>
                            );
                        })}
                    </MenuCard>
                </SideSubMenu>
            </div>
        );
    }

    // Special Actions in SubMenu
    if (item.action === 'themeList') {
        return (
            <div className="relative group">
                <div className={styles}>
                    <span>{item.title}</span>
                    <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                </div>
                <SideSubMenu>
                    <MenuCard>
                        <ul className="menu menu-compact p-1"><ThemeList /></ul>
                    </MenuCard>
                </SideSubMenu>
            </div>
        );
    }

    if (item.action === 'wordingStyle') {
        return (
            <div className="relative group">
                <div className={styles}>
                    <span>{item.title}</span>
                    <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                </div>
                <SideSubMenu>
                    <WordingStyleContent actionHandlers={actionHandlers} pageId={getPageIdFromRouter(router)} />
                </SideSubMenu>
            </div>
        );
    }

    if (item.action) {
        return (
            <NavigationMenu.Link asChild>
                <button
                    onClick={actionHandlers[item.action]}
                    className={`w-full text-left block px-4 py-2 text-sm transition-all ${active ? 'text-brand-accent bg-brand-accent/10 font-medium' : 'text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5'}`}
                >
                    {item.title}
                </button>
            </NavigationMenu.Link>
        );
    }

    return (
        <NavigationMenu.Link asChild>
            <Link
                href={item.path || "#"}
                target={item.target}
                rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                className={`block px-4 py-2 text-sm transition-all ${active ? 'text-brand-accent bg-brand-accent/10 font-medium' : 'text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5'}`}
            >
                {item.title}
            </Link>
        </NavigationMenu.Link>
    );
};

const StandardDropdownItem = ({ item, styles, currentPath, actionHandlers }: CommonItemProps & { currentPath: string }) => {
    const [shakeKey, setShakeKey] = useState(0);

    return (
        <NavigationMenu.Item className="relative">
            <NavigationMenu.Trigger
                className={`${styles} group`}
                onPointerDown={(e) => {
                    if (!item.path) {
                        setShakeKey(prev => prev + 1);
                        e.preventDefault(); // 阻止 Radix UI 的切換行為
                    }
                }}
                onClick={(e) => {
                    if (!item.path) e.preventDefault();
                }}
            >
                <span>{item.title}</span>
            </NavigationMenu.Trigger>
            <DropdownTransition shakeKey={shakeKey}>
                <MenuCard>
                    <div className="py-1">
                        {item.children?.map((child, idx) => (
                            <SubMenuItem key={idx} item={child} currentPath={currentPath} actionHandlers={actionHandlers} />
                        ))}
                    </div>
                </MenuCard>
            </DropdownTransition>
        </NavigationMenu.Item>
    );
};

const SimpleLinkItem = ({ item, styles, actionHandlers }: CommonItemProps) => {
    if (item.action) {
        return (
            <NavigationMenu.Item>
                <NavigationMenu.Link asChild>
                    <button onClick={actionHandlers?.[item.action]} className={styles}>
                        {item.title}
                    </button>
                </NavigationMenu.Link>
            </NavigationMenu.Item>
        );
    }
    return (
        <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
                <Link
                    href={item.path || "#"}
                    target={item.target}
                    rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                    className={styles}
                >
                    {item.title}
                </Link>
            </NavigationMenu.Link>
        </NavigationMenu.Item>
    );
};

// --- Main Components ---

function MegaMenuItem({ item, actionHandlers, showBackgroundGrid, scroll }: { item: NavbarItemType } & MegaMenuProps) {
    const router = useRouter();
    const currentPath = router.asPath.split('?')[0];
    const active = isItemActive(item, currentPath) || hasActiveChild(item, currentPath);
    const styles = getItemStyles(active, scroll);

    if (item.action === 'themeList') return <ThemeListItem item={item} styles={styles} />;
    if (item.action === 'toggleGrid') return <GridToggleItem item={item} styles={styles} showGrid={showBackgroundGrid} onToggle={actionHandlers.toggleGrid} />;
    if (item.action === 'wordingStyle') return <WordingStyleItem item={item} styles={styles} actionHandlers={actionHandlers} />;

    // Items with children
    if (item.children?.length) {
        return <StandardDropdownItem item={item} styles={styles} currentPath={currentPath} actionHandlers={actionHandlers} />;
    }

    // Standard items or generic actions
    return <SimpleLinkItem item={item} styles={styles} actionHandlers={actionHandlers} />;
}

export default function MegaMenu({ items, actionHandlers, showBackgroundGrid, scroll }: MegaMenuProps) {
    return (
        <NavigationMenu.Root className="relative">
            <NavigationMenu.List className="flex items-center justify-end gap-1">
                {items.map((item, index) => (
                    <MegaMenuItem
                        key={index}
                        item={item}
                        items={items} // Pass full props just to satisfy types if needed, although mostly unused in child
                        actionHandlers={actionHandlers}
                        showBackgroundGrid={showBackgroundGrid}
                        scroll={scroll}
                    />
                ))}
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
