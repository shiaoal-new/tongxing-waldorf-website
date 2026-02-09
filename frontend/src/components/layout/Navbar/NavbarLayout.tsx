import React, { useEffect, useRef, ReactNode } from "react";

interface ScrollLockProps {
    isOpen: boolean;
}

export function ScrollLock({ isOpen }: ScrollLockProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, [isOpen]);
    return null;
}

interface NavBarContainerProps {
    children: ReactNode;
    open: boolean;
    scroll: boolean;
    onClick?: (e: React.MouseEvent) => void;
}

export function NavBarContainer({ children, open, scroll, onClick }: NavBarContainerProps) {
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (open || scroll) return;

        // Match Tailwind's lg breakpoint (64rem = 1024px)
        const isDesktop = window.matchMedia('(min-width: 64rem)');

        const handleMouseMove = (e: MouseEvent) => {
            if (!headerRef.current) return;
            // Only apply on desktop (lg breakpoint and above)
            if (!isDesktop.matches) return;

            const rect = headerRef.current.getBoundingClientRect();
            // Calculate vertical distance from the bottom of the navbar
            // If mouse is above the bottom edge (inside navbar), distance is 0
            const distance = Math.max(0, e.clientY - rect.bottom);

            let opacity = 0;
            if (distance === 0) {
                opacity = 1;
            } else if (distance > 100) {
                opacity = 0;
            } else {
                // Interpolate: 0 distance -> 1 opacity, 100 distance -> 0 opacity
                opacity = 1 - (distance / 100);
            }

            headerRef.current.style.setProperty('--navbar-bg-opacity', opacity.toString());
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [open, scroll]);

    return (
        <header
            ref={headerRef}
            style={{ '--navbar-bg-opacity': 0 } as React.CSSProperties}
            onClick={onClick}
            className={`navbar-container fixed w-full z-50 left-0 top-0 transition-all duration-500 group/navbar ${(open || scroll) ? "navbar--active" : "navbar--top"
                } ${open ? "navbar--open" : ""} hover:navbar--hover`}>
            {children}
        </header>
    );
}
