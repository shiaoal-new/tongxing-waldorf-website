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
            className={`w-full mx-auto ${typeof props.ignorePadding === 'string'
                    ? props.ignorePadding
                    : (props.ignorePadding ? "" : "px-mobile-margin lg:px-desktop-margin")
                } ${typeof props.limit === 'string'
                    ? props.limit
                    : (props.limit ? "max-w-brand" : "")
                } ${props.className ? props.className : ""
                }`}>
            {props.children}
        </div>
    );
});

Container.displayName = "Container";

export default Container;
