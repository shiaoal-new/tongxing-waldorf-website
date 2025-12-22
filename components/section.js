import React from "react";
import Container from "./container";
import { motion } from "framer-motion";
import BackgroundCarousel from "./backgroundCarousel";
import ActionButtons from "./actionButtons";

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
        media_list,
        parallax_ratio,
        className,
        ...rest
    } = props;

    // Use classes from layout if provided, otherwise use defaults
    const classes = layout || {};
    const container_class = classes.container_class || "";
    const wrapper_class = classes.wrapper_class || "";
    // If background media is present, default to white text for better visibility
    const defaultTitleColor = media_list?.length > 0 ? "text-brand-bg" : "text-brand-text dark:text-brand-bg";
    const defaultDescColor = media_list?.length > 0 ? "text-brand-bg" : "text-brand-taupe dark:text-brand-taupe";
    const defaultPretitleColor = media_list?.length > 0 ? "text-brand-accent/40" : "text-brand-accent";

    const pretitle_class = classes.pretitle_class || `text-sm font-bold tracking-brand ${defaultPretitleColor} uppercase`;
    const title_class = classes.title_class || `max-w-2xl mt-component ${defaultTitleColor}`;
    const description_class = classes.description_class || `max-w-2xl py-component text-lg ${defaultDescColor} lg:text-xl xl:text-xl`;

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
            className={`w-full relative overflow-hidden section_container py-section ${container_class} ${className || ""}`}
            {...rest}
        >
            {media_list && media_list.length > 0 && (
                <BackgroundCarousel media_list={media_list} parallax_ratio={parallax_ratio} />
            )}

            <Container
                className={`flex w-full flex-col relative z-10 ${align === "left" ? "" : "items-center justify-center text-center"}`}>
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
                        <ActionButtons
                            buttons={buttons}
                            align={align === "left" ? "left" : "center"}
                            className="mt-6"
                        />
                    )}
                </motion.div>
            </Container>

            {bodyContent && (
                <Container className={`relative z-10 content_class ${classes.content_class || ""}`}>
                    {bodyContent}
                </Container>
            )}
        </section>
    );
}
