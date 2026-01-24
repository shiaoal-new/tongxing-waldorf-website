import React from "react";

interface ContainerProps {
    children?: React.ReactNode;
    className?: string;
    limit?: boolean;
    ignorePadding?: boolean;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>((props, ref) => {
    return (
        <div
            ref={ref}
            className={`w-full mx-auto ${props.ignorePadding ? "" : "px-mobile-margin lg:px-desktop-margin"} ${props.limit ? "max-w-brand" : ""
                } ${props.className ? props.className : ""
                }`}>
            {props.children}
        </div>
    );
});

Container.displayName = "Container";

export default Container;
