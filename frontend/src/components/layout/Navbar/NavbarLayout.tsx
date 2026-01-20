import React, { useEffect, ReactNode } from "react";

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
    return (
        <header
            onClick={onClick}
            className={`navbar-container fixed w-full z-50 left-0 top-0 transition-all duration-300 ${!open && scroll ? "bg-transparent" : "bg-transparent"
                }`}>
            {children}
        </header>
    );
}
