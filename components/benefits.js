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
    <>
      <Container className="flex flex-wrap mb-20 lg:gap-10 lg:flex-nowrap ">
        <motion.div
          initial={{ opacity: 0, x: props.imgPos === "right" ? 100 : -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className={`flex items-center justify-center w-full lg:w-1/2 ${props.imgPos === "right" ? "lg:order-1" : ""
            }`}>
          <div className="w-full">
            <MediaRenderer
              media={mediaData}
              className="w-full h-[300px] lg:h-[482px]"
              imgClassName="object-contain"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: props.imgPos === "right" ? -100 : 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className={`flex flex-wrap items-center w-full lg:w-1/2 ${props.imgPos === "right" ? "lg:justify-end" : ""
            }`}>
          <div>
            <div className="flex flex-col w-full mt-4">
              <h3 className="max-w-2xl mt-3 text-brand-text dark:text-brand-bg">
                {data.title}
              </h3>

              <p className="max-w-2xl py-4 text-lg text-brand-taupe lg:text-xl xl:text-xl dark:text-brand-taupe">
                {data.desc}
              </p>
            </div>

            <div className="w-full mt-5">
              {data.bullets?.map((item, index) => (
                <Benefit key={index} title={item.title} icon={item.icon}>
                  {item.desc}
                </Benefit>
              ))}
            </div>

            <ActionButtons buttons={data.buttons} align="left" className="mt-8" />
          </div>
        </motion.div>
      </Container>
    </>
  );
}

function Benefit(props) {
  return (
    <>
      <div className="flex items-start mt-8 space-x-3">
        <div className="flex items-center justify-center flex-shrink-0 mt-1 bg-brand-accent/100 rounded-md w-11 h-11 ">
          <Icon icon={props.icon} className="w-7 h-7 text-primary-50" />
        </div>
        <div>
          <h4 className="text-brand-text dark:text-brand-bg">
            {props.title}
          </h4>
          <p className="mt-1 text-brand-taupe dark:text-brand-taupe">
            {props.children}
          </p>
        </div>
      </div>
    </>
  );
}


