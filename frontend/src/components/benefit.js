import React from "react";
import { Icon } from "@iconify/react";
import ActionButtons from "./actionButtons";

export default function BenefitItem(props) {
  return (
    <>
      <div className="benefit-container flex flex-col mt-8 ">
        <div className="benefit-icon-container flex items-center justify-center flex-shrink-0 mb-3 w-16 h-16 mx-auto">
          <Icon icon={props.icon} className="w-7 h-7 text-primary-50" />
        </div>
        <div className="flex-grow text-center lg:text-left">
          <h4 className="text-brand-text dark:text-brand-bg">
            {props.title}
          </h4>
          <p className="mt-1 text-brand-taupe dark:text-brand-taupe">
            {props.children}
          </p>
          {props.buttons && props.buttons.length > 0 && (
            <div className="flex justify-center lg:justify-start">
              <ActionButtons buttons={props.buttons} align="left" className="mt-3" size="sm" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
