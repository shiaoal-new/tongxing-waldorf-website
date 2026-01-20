import React, { useEffect } from "react";

export function ScrollLock({ isOpen }) {
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

export function NavBarContainer({ children, open, scroll, onClick }) {
    return (
        <header
            onClick={onClick}
            className={`navbar-container fixed w-full z-50 left-0 top-0 transition-all duration-300 ${!open && scroll ? "bg-transparent" : "bg-transparent"
                }`}>
            {children}
        </header>
    );
}
