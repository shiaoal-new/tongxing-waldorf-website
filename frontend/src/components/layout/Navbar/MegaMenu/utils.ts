import { useState, useEffect } from "react";

export const useSubMenuPosition = (ref: React.RefObject<HTMLDivElement>) => {
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

export const getItemStyles = (active: boolean, scroll: boolean) => {
    const base = "inline-flex items-center px-4 py-2 text-base font-normal no-underline rounded-md transition-all duration-300";
    if (active) {
        return `${base} text-brand-accent bg-brand-accent/5 font-medium`;
    }
    const inactiveColor = scroll
        ? "text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5"
        : "text-white/50 dark:text-white group-hover/navbar:text-brand-text dark:group-hover/navbar:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5";
    return `${base} ${inactiveColor}`;
};

export const getSubItemStyles = (active: boolean) => {
    const base = "flex items-center justify-between px-4 py-2 text-sm transition-all cursor-pointer";
    if (active) return `${base} text-brand-accent bg-brand-accent/10 font-medium`;
    return `${base} text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5`;
};
