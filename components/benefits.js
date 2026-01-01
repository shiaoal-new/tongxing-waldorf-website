import MediaRenderer from "./mediaRenderer";
import React from "react";
import Container from "./container";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import ActionButtons from "./actionButtons";

export default function Benefits(props) {
  const { data } = props;

  // Media data normalization
  const mediaData = data.media || (data.lottie ? { type: 'lottie', url: data.lottie } : (data.image ? { type: 'image', image: data.image } : null));

  return (
    <div className="flex flex-col mb-20">
      <div className="w-full mb-8">
        <h3 className="mt-3 text-brand-text dark:text-brand-bg">
          {data.title}
        </h3>

        <p className="py-4 text-lg text-brand-taupe lg:text-xl xl:text-xl dark:text-brand-taupe">
          {data.desc}
        </p>
      </div>

      <div className="w-full mx-auto flex flex-wrap lg:gap-10 lg:flex-nowrap ">

        <motion.div
          className={`flex flex-wrap items-start w-full ${props.imgPos === "right" ? "lg:justify-end" : ""
            }`}>
          <div>
            <div className="flex lg:grid overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none lg:grid-cols-3 lg:gap-6 -mx-4 lg:mx-0">
              {/* Spacer for first item to center */}
              {/* <div className="min-w-[7.5%] flex-shrink-0 lg:hidden"></div> */}

              {data.bullets?.map((item, index) => (
                <div key={index} id={`benefit-${index}`} className="min-w-[85%] lg:min-w-0 w-[85%] lg:w-auto px-4 lg:px-0 snap-center flex-shrink-0">
                  <div className="w-full">
                    <Benefit title={item.title} icon={item.icon} buttons={item.buttons}>
                      {item.desc}
                    </Benefit>
                  </div>
                </div>
              ))}

              {/* Spacer for last item to center */}
              {/* <div className="min-w-[7.5%] flex-shrink-0 lg:hidden"></div> */}
            </div>

            <ActionButtons buttons={data.buttons} align="center" className="mt-8" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Benefit(props) {
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


