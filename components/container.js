import React from "react";

const Container = React.forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      className={`w-full mx-auto px-mobile-margin lg:px-desktop-margin 3xl:px-ultrawide-margin ${props.limit ? "max-w-brand" : ""
        } ${props.className ? props.className : ""
        }`}>
      {props.children}
    </div>
  );
});

Container.displayName = "Container";

export default Container;
