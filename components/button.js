import React from "react";
import Link from "next/link";

export default function Button({ href, children, className, size = "lg", ...props }) {
    const Component = href ? Link : "button";
    const linkProps = href ? { href } : {};

    // Base layout styles
    const baseLayout = "inline-flex items-center justify-center font-bold text-center cursor-pointer";

    // Size variants (Padding & Font size)
    const sizeClasses = size === "sm"
        ? "py-2 px-5 text-sm"
        : "py-4 px-8 lg:px-10 text-lg";

    // Determine the final style class
    // If className already includes a btn- class, we use it as is.
    // Otherwise, we default to btn-primary.
    const hasBrandClass = /btn-(primary|secondary|white|outline-primary)/.test(className);
    const finalStyleClass = hasBrandClass ? "" : "btn-primary";

    return (
        <Component
            {...linkProps}
            {...props}
            className={`${baseLayout} ${sizeClasses} ${finalStyleClass} ${className}`}
        >
            {children}
        </Component>
    );
}
