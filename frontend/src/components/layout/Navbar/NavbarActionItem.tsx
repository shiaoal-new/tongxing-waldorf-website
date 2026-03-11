import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { NavbarItemType } from './NavbarItems';
import { WordingStyleMenuContent } from './actions/WordingStyleMenuContent';
import { getPageIdFromRouter } from '../../../lib/navigation';

interface NavbarActionItemProps {
    item: NavbarItemType;
    active: boolean;
    actionHandlers: Record<string, any>;
    showBackgroundGrid: boolean;
    className?: string;
    isMobile?: boolean;
    isSubMenu?: boolean;
}

export function NavbarActionItem({
    item,
    active,
    actionHandlers,
    className = "",
    isMobile = false,
    isSubMenu = false
}: NavbarActionItemProps) {
    const router = useRouter();
    const pageId = getPageIdFromRouter(router);

    const combinedClassName = `${className} ${active
        ? "text-brand-accent bg-brand-accent/5 font-medium"
        : isSubMenu
            ? "text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5"
            : "text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5"
        } transition-all duration-300 rounded-md flex items-center justify-between group`;

    if (item.action === 'themeList') {
        // ... themeList implementation if needed, though it's usually handled by children or MegaMenu
    }

    if (item.action === 'wordingStyle') {
        return (
            <div className="w-full">
                {isMobile ? (
                    <details className="w-full group/details">
                        <summary className={`${combinedClassName} cursor-pointer list-none appearance-none [&::-webkit-details-marker]:hidden`}>
                            <span>{item.title}</span>
                            <ChevronDownIcon className="w-4 h-4 transition-transform group-open/details:rotate-180" />
                        </summary>
                        <div className="bg-brand-bg/50 dark:bg-brand-structural/50 rounded-lg mt-1 overflow-hidden">
                            <WordingStyleMenuContent 
                                actionHandlers={actionHandlers as any} 
                                pageId={pageId} 
                            />
                        </div>
                    </details>
                ) : (
                    <div className="group/wording relative">
                        <div className={combinedClassName}>
                            <span>{item.title}</span>
                            <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                        </div>
                        <div className="absolute left-full top-0 w-48 pl-2 opacity-0 invisible group-hover/wording:opacity-100 group-hover/wording:visible transition-all duration-200">
                            <div className="bg-brand-bg dark:bg-brand-structural rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                                <WordingStyleMenuContent actionHandlers={actionHandlers as any} pageId={pageId} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const handleClick = (e: React.MouseEvent) => {
        if (item.action && actionHandlers[item.action]) {
            e.preventDefault();
            actionHandlers[item.action](item.action === 'toggleGrid' ? (e.target as any).checked : undefined);
        } else if (isMobile && item.path) {
            e.preventDefault();
            const disclosureButton = document.querySelector('[aria-label="Toggle Menu"]') as HTMLButtonElement;
            if (disclosureButton) disclosureButton.click();
            setTimeout(() => router.push(item.path || "#"), 300);
        }
    };

    if (item.action) {
        return (
            <button onClick={handleClick} className={`${combinedClassName} w-full text-left`}>
                {item.title}
            </button>
        );
    }

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
