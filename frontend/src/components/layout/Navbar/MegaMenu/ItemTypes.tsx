import React, { useState } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { NavbarItemType } from "../NavbarItems";
import { ThemeList } from "../../../ui/DarkSwitch";
import { isItemActive, hasActiveChild, getPageIdFromRouter } from "../../../../lib/navigation";
import { WordingStyleMenuContent } from "../actions/WordingStyleMenuContent";
import { GridToggle } from "../actions/GridToggle";
import { getSubItemStyles } from "./utils";
import { MenuCard, SideSubMenu, DropdownTransition } from "./components";

interface CommonItemProps {
    item: NavbarItemType;
    styles: string;
    actionHandlers?: Record<string, any>;
}

export const ThemeListItem = ({ item, styles }: CommonItemProps) => {
    const [shakeKey, setShakeKey] = useState(0);
    return (
        <NavigationMenu.Item className="relative">
            <NavigationMenu.Trigger
                className={`${styles} group`}
                onPointerDown={(e) => {
                    setShakeKey(prev => prev + 1);
                    e.preventDefault();
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

export const GridToggleItem = ({ item, styles, showGrid, actionHandlers }: CommonItemProps & { showGrid: boolean }) => (
    <NavigationMenu.Item>
        <GridToggle 
            showGrid={showGrid} 
            onToggle={actionHandlers?.toggleGrid} 
            title={item.title} 
            className={styles} 
        />
    </NavigationMenu.Item>
);

export const WordingStyleItem = ({ item, styles, actionHandlers }: CommonItemProps) => {
    const router = useRouter();
    const pageId = getPageIdFromRouter(router);
    const [shakeKey, setShakeKey] = useState(0);

    return (
        <NavigationMenu.Item className="relative">
            <NavigationMenu.Trigger
                className={`${styles} group`}
                onPointerDown={(e) => {
                    setShakeKey(prev => prev + 1);
                    e.preventDefault();
                }}
                onClick={(e) => e.preventDefault()}
            >
                <span>{item.title}</span>
            </NavigationMenu.Trigger>
            <DropdownTransition shakeKey={shakeKey}>
                <MenuCard>
                    <WordingStyleMenuContent actionHandlers={actionHandlers as any} pageId={pageId} />
                </MenuCard>
            </DropdownTransition>
        </NavigationMenu.Item>
    );
};

export const SubMenuItem = ({ item, currentPath, actionHandlers }: { item: NavbarItemType, currentPath: string, actionHandlers: any }) => {
    const router = useRouter();
    const active = isItemActive(item, currentPath) || hasActiveChild(item, currentPath);
    const styles = getSubItemStyles(active);

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
                    <MenuCard>
                        <WordingStyleMenuContent actionHandlers={actionHandlers} pageId={getPageIdFromRouter(router)} />
                    </MenuCard>
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

export const StandardDropdownItem = ({ item, styles, currentPath, actionHandlers }: CommonItemProps & { currentPath: string }) => {
    const [shakeKey, setShakeKey] = useState(0);

    return (
        <NavigationMenu.Item className="relative">
            <NavigationMenu.Trigger
                className={`${styles} group`}
                onPointerDown={(e) => {
                    if (!item.path) {
                        setShakeKey(prev => prev + 1);
                        e.preventDefault();
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

export const SimpleLinkItem = ({ item, styles, actionHandlers }: CommonItemProps) => {
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

export const MegaMenuLinksColumn = ({ item, currentPath }: { item: NavbarItemType, currentPath: string }) => {
    if (!item.children || item.children.length === 0) {
        const active = isItemActive(item, currentPath);
        const activeStyles = active ? "text-brand-accent bg-brand-accent/10 font-medium" : "text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5";

        return (
            <div className="mb-0.5">
                <NavigationMenu.Link asChild>
                    <Link
                        href={item.path || "#"}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all group/link ${activeStyles}`}
                    >
                        {item.image && (
                            <div className="relative w-10 h-10 rounded-md shrink-0 overflow-hidden shadow-sm outline outline-1 outline-brand-taupe/10 bg-brand-bg/50">
                                <Image src={item.image} alt={item.title} fill sizes="40px" className="object-cover transition-transform duration-500 group-hover/link:scale-110" />
                            </div>
                        )}
                        <span className="font-medium whitespace-nowrap text-sm flex-1">{item.title}</span>
                    </Link>
                </NavigationMenu.Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col mb-4 break-inside-avoid">
            <h5 className="text-xs font-semibold tracking-widest text-brand-taupe/70 dark:text-brand-taupe/50 mb-2 px-3 uppercase">{item.title}</h5>
            <div className="flex flex-col gap-0.5 border-l-2 border-brand-taupe/10 ml-3 pl-3">
                {item.children.map((child, idx) => {
                    const active = isItemActive(child, currentPath);
                    const activeStyles = active ? "text-brand-accent bg-brand-accent/10 font-medium" : "text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5";

                    return (
                        <NavigationMenu.Link asChild key={idx}>
                            <Link
                                href={child.path || "#"}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all group/link ${activeStyles}`}
                            >
                                {child.image && (
                                    <div className="relative w-10 h-10 rounded-md shrink-0 overflow-hidden shadow-sm outline outline-1 outline-brand-taupe/10 bg-brand-bg/50">
                                        <Image src={child.image} alt={child.title} fill sizes="40px" className="object-cover transition-transform duration-500 group-hover/link:scale-110" />
                                    </div>
                                )}
                                <span className="text-sm whitespace-nowrap flex-1">{child.title}</span>
                            </Link>
                        </NavigationMenu.Link>
                    )
                })}
            </div>
        </div>
    )
}

export const MegaDropdownItem = ({ item, styles, currentPath, actionHandlers }: CommonItemProps & { currentPath: string }) => {
    const [shakeKey, setShakeKey] = useState(0);

    const featuredCount = item.featuredItems?.length || 0;
    const featuredGridCols = featuredCount >= 3 ? 'grid-cols-3' : featuredCount === 2 ? 'grid-cols-2' : 'grid-cols-1';

    const totalLinksCount = item.children?.reduce((acc, child) => {
        return acc + (child.children ? child.children.length + 1 : 1);
    }, 0) || 0;

    const useColumns = totalLinksCount > 6;

    let leftSectionLinks: NavbarItemType[] = [];
    let rightSectionLinks: NavbarItemType[] = [];

    if (item.children) {
        if (useColumns) {
            const splitIndex = Math.ceil(item.children.length / 2);
            leftSectionLinks = item.children.slice(0, splitIndex);
            rightSectionLinks = item.children.slice(splitIndex);
        } else {
            leftSectionLinks = item.children;
        }
    }

    const linksWidthRem = useColumns ? 30 : 15;
    const menuWidthRem = (featuredCount > 0)
        ? (useColumns ? 60 : 47.5)
        : linksWidthRem;

    return (
        <NavigationMenu.Item className="relative">
            <NavigationMenu.Trigger
                className={`${styles} group`}
                onPointerDown={(e) => {
                    if (!item.path) {
                        setShakeKey(prev => prev + 1);
                        e.preventDefault();
                    }
                }}
                onClick={(e) => {
                    if (!item.path) e.preventDefault();
                }}
            >
                <span>{item.title}</span>
            </NavigationMenu.Trigger>
            <DropdownTransition shakeKey={shakeKey} wrapperClass="absolute right-0 lg:-right-4 top-full pt-2 origin-top z-50 pointer-events-none !left-auto">
                <MenuCard className={`max-w-[calc(100vw-2rem)] p-6 flex flex-col md:flex-row gap-8 max-h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden custom-scrollbar`} style={{ width: `${menuWidthRem}rem` }}>
                    {item.featuredItems && item.featuredItems.length > 0 && (
                        <div className={`flex flex-col md:grid ${featuredGridCols} gap-4 border-b md:border-b-0 md:border-r border-brand-taupe/10 pb-4 md:pb-0 md:pr-8 w-full shrink-0`} style={{ width: '30rem' }}>
                            {item.featuredItems.map((featured, idx) => (
                                <NavigationMenu.Link asChild key={idx}>
                                    <Link
                                        href={featured.path || '#'}
                                        className="block group/featured overflow-hidden"
                                    >
                                        {featured.image && (
                                            <div className="relative w-full aspect-video rounded-md overflow-hidden bg-brand-bg/50 mb-3 ml-1 outline outline-1 outline-brand-taupe/10 shadow-sm">
                                                <Image src={featured.image} alt={featured.title} fill sizes="(max-width: 768px) 100vw, 30vw" className="object-cover transition-transform duration-500 group-hover/featured:scale-105" />
                                            </div>
                                        )}
                                        <h4 className="font-medium text-brand-text dark:text-brand-bg mb-1 group-hover/featured:text-brand-accent transition-colors ml-1">
                                            {featured.title}
                                        </h4>
                                        {featured.description && <p className="text-xs text-brand-taupe line-clamp-2 ml-1">{featured.description}</p>}
                                    </Link>
                                </NavigationMenu.Link>
                            ))}
                        </div>
                    )}

                    <div className="shrink-0" style={{ width: `${linksWidthRem}rem` }}>
                        <div className={`py-1 ${useColumns ? 'flex gap-6 w-full' : ''}`}>
                            <div className="flex-1 flex flex-col w-full">
                                {leftSectionLinks.map((child, idx) => (
                                    <MegaMenuLinksColumn key={idx} item={child} currentPath={currentPath} />
                                ))}
                            </div>
                            {useColumns && (
                                <div className="flex-1 flex flex-col w-full border-l border-brand-taupe/10 pl-6">
                                    {rightSectionLinks.map((child, idx) => (
                                        <MegaMenuLinksColumn key={`right-${idx}`} item={child} currentPath={currentPath} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </MenuCard>
            </DropdownTransition>
        </NavigationMenu.Item>
    );
};
