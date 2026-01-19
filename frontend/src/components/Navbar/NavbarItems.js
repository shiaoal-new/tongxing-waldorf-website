import React, { Fragment } from "react";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { ThemeList } from "../DarkSwitch";

export function NavbarActionItem({ item, active, actionHandlers, showBackgroundGrid, className = "", isMobile = false, router }) {
    const baseStyles = isMobile
        ? `block rounded-md transition-all ${active
            ? 'text-brand-accent font-semibold bg-brand-accent/10'
            : 'text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5 active:bg-brand-accent/10'
        }`
        : `flex items-center justify-between transition-colors micro-hover-link rounded-md ${active
            ? "bg-brand-accent text-brand-bg"
            : "text-brand-text dark:text-brand-bg hover:text-brand-accent"
        }`;

    const combinedClassName = `${baseStyles} ${className}`;

    if (item.action) {
        if (item.action === 'themeList') {
            return (
                <div className="w-full">
                    {isMobile ? (
                        <details className="group/theme" name="mobile-nav-main">
                            <summary className="list-none text-sm text-brand-taupe dark:text-brand-taupe hover:text-brand-accent transition-colors cursor-pointer py-2 px-2 rounded-md hover:bg-brand-accent/5 [&::-webkit-details-marker]:hidden flex justify-between items-center w-full">
                                <span>{item.title}</span>
                                <ChevronDownIcon className="w-4 h-4 group-open/theme:rotate-180 transition-transform" />
                            </summary>
                            <ul className="menu menu-compact bg-brand-bg/50 dark:bg-brand-structural/50 rounded-lg p-0 mt-1">
                                <ThemeList />
                            </ul>
                        </details>
                    ) : (
                        <div className="group/theme relative">
                            <div className={combinedClassName}>
                                <span>{item.title}</span>
                                <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                            </div>
                            <div className="absolute left-full top-0 w-48 ml-px bg-brand-bg dark:bg-brand-structural rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover/theme:opacity-100 group-hover/theme:visible transition-all duration-200">
                                <ul className="menu menu-compact p-1">
                                    <ThemeList />
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (item.action === 'toggleGrid') {
            return (
                <div className={`${combinedClassName} flex items-center justify-between w-full`}>
                    <span>{item.title}</span>
                    <div className="relative ml-2" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={showBackgroundGrid}
                            readOnly
                        />
                        <div
                            onClick={() => actionHandlers.toggleGrid(showBackgroundGrid)}
                            className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${showBackgroundGrid ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                            <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ${showBackgroundGrid ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <button
                onClick={actionHandlers[item.action]}
                className={`${combinedClassName} w-full text-left`}
            >
                {item.title}
            </button>
        );
    }

    const handleClick = (e) => {
        if (isMobile && router) {
            e.preventDefault();
            // Close the mobile menu immediately, then navigate
            const disclosureButton = document.querySelector('[aria-label="Toggle Menu"]');
            if (disclosureButton) disclosureButton.click();
            setTimeout(() => router.push(item.path || "#"), 300);
        }
    };

    return (
        <Link
            href={item.path || "#"}
            target={item.target}
            rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
            className={combinedClassName}
            onClick={isMobile ? handleClick : undefined}
        >
            <span>{item.title}</span>
            {item.children && item.children.length > 0 && !isMobile && (
                <ChevronDownIcon className="w-4 h-4 -rotate-90" />
            )}
        </Link>
    );
}

export function NavbarListItem({ item, actionHandlers, showBackgroundGrid }) {
    if (item.children && item.children.length > 0) {
        return (
            <Menu as="div" className="relative inline-block text-left group">
                {({ open }) => (
                    <>
                        <Menu.Button className="inline-flex items-center px-4 py-2 text-base font-normal text-brand-text no-underline rounded-md dark:text-brand-bg hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none group">
                            <span className="micro-hover-link">{item.title}</span>
                            <ChevronDownIcon
                                className={`${open ? "transform rotate-180" : ""
                                    } w-5 h-5 ml-1 transition-transform duration-200 group-hover:text-brand-accent`}
                                aria-hidden="true"
                            />
                        </Menu.Button>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute left-0 w-48 mt-2 origin-top-left bg-brand-bg divide-y divide-brand-taupe/10 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-brand-structural dark:divide-gray-700 overflow-hidden">
                                <div className="py-1">
                                    {item.children.map((child, idx) => (
                                        <Menu.Item key={idx}>
                                            {({ active }) => (
                                                <div className="relative group/sub">
                                                    <NavbarActionItem
                                                        item={child}
                                                        active={active}
                                                        actionHandlers={actionHandlers}
                                                        showBackgroundGrid={showBackgroundGrid}
                                                        className="text-sm px-4 py-2"
                                                    />

                                                    {child.children && child.children.length > 0 && (
                                                        <div className="absolute left-full top-0 w-48 ml-px bg-brand-bg dark:bg-brand-structural rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                                                            <div className="py-1">
                                                                {child.children.map((grandChild, gIdx) => (
                                                                    <NavbarActionItem
                                                                        key={gIdx}
                                                                        item={grandChild}
                                                                        active={false}
                                                                        actionHandlers={actionHandlers}
                                                                        showBackgroundGrid={showBackgroundGrid}
                                                                        className="text-sm px-4 py-2 block w-full text-left"
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </>
                )}
            </Menu>
        );
    }

    return (
        <NavbarActionItem
            item={item}
            active={false}
            actionHandlers={actionHandlers}
            showBackgroundGrid={showBackgroundGrid}
            className="text-base font-normal px-4 py-2"
        />
    );
}

export function MobileNavbarItem({ item, router, actionHandlers, showBackgroundGrid }) {
    const isActive = router.pathname === item.path;

    if (item.children && item.children.length > 0) {
        return (
            <li>
                <details className="group" name="mobile-nav-main">
                    <summary className="list-none font-medium text-brand-text dark:text-brand-bg hover:text-brand-accent focus:text-brand-accent transition-colors cursor-pointer py-2.5 px-3 rounded-lg hover:bg-brand-accent/5 active:bg-brand-accent/10 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 opacity-60 group-open:rotate-90 group-open:opacity-100 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {item.title}
                        </span>
                    </summary>
                    <ul className="ml-4 mt-1 space-y-0.5 border-l-2 border-brand-taupe/10 dark:border-brand-structural/30 pl-3">
                        {item.children.map((child, idx) => {
                            const childIsActive = router.pathname === child.path;
                            return (
                                <li key={idx}>
                                    {child.children && child.children.length > 0 ? (
                                        <details className="group/sub" name={`mobile-nav-sub-${item.title}`}>
                                            <summary className="list-none text-sm text-brand-taupe dark:text-brand-taupe hover:text-brand-accent focus:text-brand-accent transition-colors cursor-pointer py-2 px-2 rounded-md hover:bg-brand-accent/5 [&::-webkit-details-marker]:hidden">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-3 h-3 opacity-60 group-open/sub:rotate-90 group-open/sub:opacity-100 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    {child.title}
                                                </span>
                                            </summary>
                                            <ul className="ml-3 mt-1 space-y-0.5 border-l border-brand-taupe/10 dark:border-brand-structural/20 pl-2">
                                                {child.children.map((grandChild, gIdx) => {
                                                    const grandChildIsActive = router.pathname === grandChild.path;
                                                    return (
                                                        <li key={gIdx}>
                                                            <NavbarActionItem
                                                                item={grandChild}
                                                                active={grandChildIsActive}
                                                                actionHandlers={actionHandlers}
                                                                showBackgroundGrid={showBackgroundGrid}
                                                                className="text-xs py-1.5 px-2 mb-0.5"
                                                                isMobile
                                                                router={router}
                                                            />
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </details>
                                    ) : (
                                        <NavbarActionItem
                                            item={child}
                                            active={childIsActive}
                                            actionHandlers={actionHandlers}
                                            showBackgroundGrid={showBackgroundGrid}
                                            className="text-sm py-2 px-2 mb-0.5"
                                            isMobile
                                            router={router}
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </details>
            </li>
        );
    }

    return (
        <li>
            <NavbarActionItem
                item={item}
                active={isActive}
                actionHandlers={actionHandlers}
                showBackgroundGrid={showBackgroundGrid}
                className="font-medium py-2.5 px-3 mb-0.5"
                isMobile
                router={router}
            />
        </li>
    );
}
