import React from "react";
import Link from "next/link";

export default function Button({ href, children, className, size = "lg", ...props }) {
    const Component = href ? Link : "Button";
    const linkProps = href ? { href } : {};

    // Base layout styles
    const baseLayout = "btn rounded-full transition-all duration-200 active:scale-95";

    // Size variants (DaisyUI sizes)
    const sizeClasses = size === "sm"
        ? "btn-sm px-6"
        : "btn-lg px-8 lg:px-10";

    // Determine the final style class
    // If className already includes a btn- class, we use it as is.
    // Otherwise, we default to btn-primary.
    const hasBrandClass = /btn-(primary|secondary|white|outline-primary|ghost|link|info|success|warning|error)/.test(className);
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
