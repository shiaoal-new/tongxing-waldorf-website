import React from "react";

const Container = React.forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      className={`container p-8 mx-auto xl:px-0 ${props.className ? props.className : ""
        }`}>
      {props.children}
    </div>
  );
});

Container.displayName = "Container";

export default Container;
