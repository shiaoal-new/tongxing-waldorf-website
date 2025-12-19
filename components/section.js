import React from "react";
import Container from "./container";
import { motion } from "framer-motion";

export default function Section(props) {
    const {
        layout,
        pretitle,
        title,
        description,
        children,
        align,
        direction,
        anchor,
        buttons,
        ...rest
    } = props;

    // Use classes from layout if provided, otherwise use defaults
    const classes = layout || {};
    const container_class = classes.container_class || "";
    const wrapper_class = classes.wrapper_class || "";
    const pretitle_class = classes.pretitle_class || "text-sm font-bold tracking-wider text-primary-600 uppercase";
    const title_class = classes.title_class || "max-w-2xl mt-3 text-3xl font-bold leading-snug tracking-tight text-gray-800 lg:leading-tight lg:text-4xl dark:text-white";
    const description_class = classes.description_class || "max-w-2xl py-4 text-lg leading-normal text-gray-500 lg:text-xl xl:text-xl dark:text-gray-300";

    // Define animation variants based on direction
    const variants = {
        hidden: {
            opacity: 0,
            x: direction === "left" ? -100 : direction === "right" ? 100 : 0,
            y: direction ? 0 : 20
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

    // Determine if children should be treated as description text
    const isChildrenDescription = !description && typeof children === "string";
    const effectiveDescription = description || (isChildrenDescription ? children : null);
    const bodyContent = isChildrenDescription ? null : children;

    const alignmentClasses = align === "left" ? "items-start text-left" : "items-center text-center";

    return (
        <section
            id={anchor}
            className={`w-full section_container ${container_class}`}
            {...rest}
        >
            <Container
                className={`flex w-full flex-col mt-4 ${align === "left" ? "" : "items-center justify-center text-center"}`}>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={variants}
                    className={`w-full flex flex-col wrapper_class ${alignmentClasses} ${wrapper_class}`}
                >
                    {pretitle && (
                        <div className={`pretitle_class ${pretitle_class} ${align === "left" ? "self-start" : ""}`}>
                            {pretitle}
                        </div>
                    )}

                    {title && (
                        <h2 className={`title_class ${title_class} ${align === "left" ? "self-start" : ""}`}>
                            {title}
                        </h2>
                    )}

                    {effectiveDescription && (
                        <div className={`description_class ${description_class} ${align === "left" ? "self-start" : ""}`}>
                            {effectiveDescription}
                        </div>
                    )}

                    {buttons && buttons.length > 0 && (
                        <div className={`mt-6 flex flex-wrap gap-4 ${align === "left" ? "justify-start" : "justify-center text-center"}`}>
                            {buttons.map((btn, idx) => {
                                const isPrimary = btn.style === "primary";
                                const isWhite = btn.style === "white";
                                return (
                                    <a
                                        key={idx}
                                        href={btn.link}
                                        target={btn.link?.startsWith("http") ? "_blank" : "_self"}
                                        rel="noopener noreferrer"
                                        className={`px-8 py-3 text-lg font-medium text-center rounded-md transition-all ${isPrimary
                                            ? "bg-primary-600 text-white hover:bg-primary-700"
                                            : isWhite
                                                ? "bg-white text-primary-600 hover:bg-gray-50"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {btn.text}
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </Container>

            {bodyContent && (
                <div className={`w-full content_class ${classes.content_class || ""}`}>
                    {bodyContent}
                </div>
            )}
        </section>
    );
}
