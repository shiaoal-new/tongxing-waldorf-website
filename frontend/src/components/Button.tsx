import React from "react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
    href?: string;
    className?: string;
    size?: 'sm' | 'lg' | string;
    children: React.ReactNode;
    target?: string;
    rel?: string;
}

export default function Button({ href, children, className, size = "lg", ...props }: ButtonProps) {
    const Component: any = href ? Link : "button";
    const linkProps = href ? { href } : {};

    // Base layout styles
    const baseLayout = "btn rounded-full transition-all duration-200 active:scale-95";

    // Size variants (DaisyUI sizes)
    const sizeClasses = size === "sm"
        ? "btn-sm px-6"
        : "btn-lg px-8 lg:px-10";

    // Determine the final style class
    const hasBrandClass = /btn-(primary|secondary|white|outline-primary|ghost|link|info|success|warning|error)/.test(className || "");
    const finalStyleClass = hasBrandClass ? "" : "btn-primary";

    return (
        <Component
            {...linkProps}
            {...props}
            className={`${baseLayout} ${sizeClasses} ${finalStyleClass} ${className || ""}`}
        >
            {children}
        </Component>
    );
}
