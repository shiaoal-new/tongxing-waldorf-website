import React from "react";
import Container from "./container";
import { motion } from "framer-motion";

export default function SectionTitle(props) {
  // Define animation variants based on direction
  const variants = {
    hidden: {
      opacity: 0,
      x: props.direction === "left" ? -100 : props.direction === "right" ? 100 : 0,
      y: props.direction ? 0 : 20
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <Container
      className={`flex w-full flex-col mt-4 ${props.align === "left" ? "" : "items-center justify-center text-center"
        }`}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={variants}
        className="w-full flex flex-col items-center"
      >
        {props.pretitle && (
          <div className={`text-sm font-bold tracking-wider text-indigo-600 uppercase ${props.align === "left" ? "self-start" : ""}`}>
            {props.pretitle}
          </div>
        )}

        {props.title && (
          <h2 className={`max-w-2xl mt-3 text-3xl font-bold leading-snug tracking-tight text-gray-800 lg:leading-tight lg:text-4xl dark:text-white ${props.align === "left" ? "self-start" : ""}`}>
            {props.title}
          </h2>
        )}

        {props.children && (
          <p className={`max-w-2xl py-4 text-lg leading-normal text-gray-500 lg:text-xl xl:text-xl dark:text-gray-300 ${props.align === "left" ? "self-start" : ""}`}>
            {props.children}
          </p>
        )}
      </motion.div>
    </Container>
  );
}
