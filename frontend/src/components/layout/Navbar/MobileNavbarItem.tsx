import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { NavbarItemType } from './NavbarItems';
import { NavbarActionItem } from './NavbarActionItem';
import { ThemeList } from '../../ui/DarkSwitch';
import { isItemActive, hasActiveChild } from '../../../lib/navigation';
import { NextRouter } from 'next/router';

const DisButton = Disclosure.Button as any;
const DisPanel = Disclosure.Panel as any;

interface MobileNavbarItemProps {
    item: NavbarItemType;
    router: NextRouter;
    actionHandlers: Record<string, any>;
    showBackgroundGrid: boolean;
}

export function MobileNavbarItem({ item, router, actionHandlers, showBackgroundGrid }: MobileNavbarItemProps) {
    const currentPath = router.asPath.split('?')[0];
    const active = isItemActive(item, currentPath) || hasActiveChild(item, currentPath);

    if (item.children && item.children.length > 0) {
        return (
            <Disclosure as="li" className="w-full">
                {({ open }) => (
                    <>
                        <DisButton className="w-full">
                            <div className={`flex items-center justify-between w-full px-4 py-3 text-base font-normal rounded-lg transition-all duration-300 ${active ? 'text-brand-accent bg-brand-accent/5 font-medium' : 'text-brand-text dark:text-brand-bg hover:bg-brand-accent/5'}`}>
                                <span>{item.title}</span>
                                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                            </div>
                        </DisButton>
                        <DisPanel className="px-4 pb-2 pt-1">
                            <ul className="space-y-1 border-l-2 border-brand-taupe/10 ml-2 pl-3">
                                {item.children.map((child, idx) => (
                                    <li key={idx} className="w-full">
                                        <NavbarActionItem
                                            item={child}
                                            active={isItemActive(child, currentPath) || hasActiveChild(child, currentPath)}
                                            actionHandlers={actionHandlers}
                                            showBackgroundGrid={showBackgroundGrid}
                                            isMobile={true}
                                            isSubMenu={true}
                                            className="px-3 py-2 text-sm"
                                        />
                                        {child.children && child.children.length > 0 && (
                                            <ul className="space-y-1 border-l border-brand-taupe/10 ml-3 pl-3 mt-1">
                                                {child.children.map((grandChild, gIdx) => (
                                                    <li key={gIdx} className="w-full">
                                                        <NavbarActionItem
                                                            item={grandChild}
                                                            active={isItemActive(grandChild, currentPath)}
                                                            actionHandlers={actionHandlers}
                                                            showBackgroundGrid={showBackgroundGrid}
                                                            isMobile={true}
                                                            isSubMenu={true}
                                                            className="px-3 py-2 text-xs"
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </DisPanel>
                    </>
                )}
            </Disclosure>
        );
    }

    if (item.action === 'themeList') {
        return (
            <Disclosure as="li" className="w-full">
                {({ open }) => (
                    <>
                        <DisButton className="w-full">
                            <div className="flex items-center justify-between w-full px-4 py-3 text-base text-brand-text dark:text-brand-bg rounded-lg transition-all">
                                <span>{item.title}</span>
                                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                            </div>
                        </DisButton>
                        <DisPanel className="px-4 pb-2">
                            <div className="bg-brand-bg/50 dark:bg-brand-structural/50 rounded-lg p-2">
                                <ThemeList />
                            </div>
                        </DisPanel>
                    </>
                )}
            </Disclosure>
        );
    }

    return (
        <li className="w-full">
            <NavbarActionItem
                item={item}
                active={active}
                actionHandlers={actionHandlers}
                showBackgroundGrid={showBackgroundGrid}
                isMobile={true}
                className="px-4 py-3 text-base"
            />
        </li>
    );
}
