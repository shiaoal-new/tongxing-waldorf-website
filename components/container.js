import React from "react";

const Container = React.forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      className={`max-w-brand mx-auto px-mobile-margin lg:px-desktop-margin ${props.className ? props.className : ""
        }`}>
      {props.children}
    </div>
  );
});

Container.displayName = "Container";

export default Container;
