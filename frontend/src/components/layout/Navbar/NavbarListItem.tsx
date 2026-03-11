import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { NavbarItemType } from './NavbarItems';
import { NavbarActionItem } from './NavbarActionItem';
import { isItemActive, hasActiveChild } from '../../../lib/navigation';

const MenuButton = Menu.Button as any;
const MenuItems = Menu.Items as any;
const MenuItem = Menu.Item as any;

interface NavbarListItemProps {
    item: NavbarItemType;
    actionHandlers: Record<string, any>;
    showBackgroundGrid: boolean;
}

export function NavbarListItem({ item, actionHandlers, showBackgroundGrid }: NavbarListItemProps) {
    const router = useRouter();
    const currentPath = router.asPath.split('?')[0]; // Ignore query params
    const active = isItemActive(item, currentPath) || hasActiveChild(item, currentPath);

    if (item.children && item.children.length > 0) {
        return (
            <Menu as="div" className="relative inline-block text-left group">
                {({ open }: { open: boolean }) => (
                    <>
                        <MenuButton className={`inline-flex items-center px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300 group ${active
                            ? "text-brand-accent bg-brand-accent/5 font-medium"
                            : "text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5 focus:text-brand-accent focus:bg-primary-100 focus:outline-none"
                            }`}>
                            <span>{item.title}</span>
                            <ChevronDownIcon
                                className={`${open ? "transform rotate-180" : ""
                                    } w-5 h-5 ml-1 transition-transform duration-200 group-hover:text-brand-accent`}
                                aria-hidden="true"
                            />
                        </MenuButton>
                        <Transition
                            as="div"
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <MenuItems className="absolute left-0 w-48 mt-2 origin-top-left bg-brand-bg divide-y divide-brand-taupe/10 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-brand-structural dark:divide-gray-700">
                                <div className="py-1">
                                    {item.children?.map((child, idx) => {
                                        const childActive = isItemActive(child, currentPath) || hasActiveChild(child, currentPath);
                                        return (
                                            <MenuItem key={idx}>
                                                {({ active: hoverActive }: { active: boolean }) => (
                                                    <div className="relative group/sub">
                                                        <NavbarActionItem
                                                            item={child}
                                                            active={childActive || hoverActive}
                                                            actionHandlers={actionHandlers}
                                                            showBackgroundGrid={showBackgroundGrid}
                                                            className="text-sm px-4 py-2"
                                                            isSubMenu
                                                        />

                                                        {child.children && child.children.length > 0 && (
                                                            <div className="absolute left-full top-0 w-48 ml-px bg-brand-bg dark:bg-brand-structural rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                                                                <div className="py-1">
                                                                    {child.children.map((grandChild, gIdx) => {
                                                                        const grandChildActive = isItemActive(grandChild, currentPath);
                                                                        return (
                                                                            <NavbarActionItem
                                                                                key={gIdx}
                                                                                item={grandChild}
                                                                                active={grandChildActive}
                                                                                actionHandlers={actionHandlers}
                                                                                showBackgroundGrid={showBackgroundGrid}
                                                                                className="text-sm px-4 py-2 block w-full text-left"
                                                                                isSubMenu
                                                                            />
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </MenuItem>
                                        );
                                    })}
                                </div>
                            </MenuItems>
                        </Transition>
                    </>
                )}
            </Menu>
        );
    }

    return (
        <NavbarActionItem
            item={item}
            active={active}
            actionHandlers={actionHandlers}
            showBackgroundGrid={showBackgroundGrid}
            className="text-base font-normal px-4 py-2 relative"
        />
    );
}
