import React from "react";
import Link from "next/link";

export default function Button({ href, children, className, ...props }) {
    const Component = href ? Link : "button";
    // If it's a link, we need to pass href to the Link component
    const linkProps = href ? { href } : {};

    return (
        <Component
            {...linkProps}
            className={`inline-block py-3 px-7 lg:px-10 lg:py-5 text-lg font-medium text-center rounded-md ${className}`}
            {...props}>
            {children}
        </Component>
    );
}

export function BookVisitButton(props) {
    return (
        <Button
            href="/visit"
            className="mx-auto text-white bg-primary-600"
            // w-full px-6 py-2 mt-3 text-center text-white bg-primary-600 rounded-md lg:ml-5
            {...props}>
            預約參觀
        </Button>
    );
}


