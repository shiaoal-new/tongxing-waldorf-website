import React from "react";
import Container from "./Container";
import { motion } from "framer-motion";
import BackgroundCarousel from "./BackgroundCarousel";
import ActionButtons from "./ActionButtons";
import SectionDivider from "./SectionDivider";

export default function Section(props) {
    const {
        layout,
        subtitle,
        title,
        content,
        children,
        align,
        direction,
        anchor,
        buttons,
        media_list,
        parallax_ratio,
        className,
        limit,
        divider, // { type, position, color, flip }
        ...rest
    } = props;

    // Use classes from layout if provided, otherwise use defaults
    const classes = layout || {};
    const container_class = classes.container_class || "";
    const wrapper_class = classes.wrapper_class || "";
    // If background media is present, default to white text for better visibility
    const defaultTitleColor = media_list?.length > 0 ? "text-brand-bg" : "text-brand-text dark:text-brand-bg";
    const defaultDescColor = media_list?.length > 0 ? "text-brand-bg" : "text-brand-taupe dark:text-brand-taupe";
    const defaultSubtitleColor = media_list?.length > 0 ? "text-brand-accent/40" : "text-brand-accent";

    const subtitle_class = classes.subtitle_class || `text-sm font-bold tracking-brand ${defaultSubtitleColor} uppercase`;
    const title_class = classes.title_class || `max-w-2xl mt-component ${defaultTitleColor}`;
    const content_class_default = classes.content_class || `max-w-4xl py-component text-lg ${defaultDescColor} lg:text-xl xl:text-xl`;

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
    const isChildrenContent = !content && typeof children === "string";
    const effectiveContent = content || (isChildrenContent ? children : null);
    const bodyContent = isChildrenContent ? null : children;

    const alignmentClasses = align === "left" ? "items-start text-left" : "items-center text-center";

    return (
        <section
            id={anchor}
            className={`w-full relative section_container py-section ${container_class} ${className || ""}`}
            {...rest}
        >
            {/* SVG Divider */}
            {divider && (
                <SectionDivider
                    type={divider.type}
                    position={divider.position}
                    color={divider.color}
                    flip={divider.flip}
                />
            )}

            {media_list && media_list.length > 0 && (
                <BackgroundCarousel media_list={media_list} parallax_ratio={parallax_ratio} />
            )}

            <Container
                limit
                className={`flex w-full flex-col relative ${align === "left" ? "" : "items-center justify-center text-center"}`}>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={variants}
                    className={`w-full flex flex-col wrapper_class ${alignmentClasses} ${wrapper_class}`}
                >
                    {subtitle && (
                        <div className={`subtitle_class ${subtitle_class} ${align === "left" ? "self-start" : ""}`}>
                            {subtitle}
                        </div>
                    )}

                    {title && (
                        <h2 className={`title_class ${title_class} ${align === "left" ? "self-start" : ""}`}>
                            {title}
                        </h2>
                    )}

                    {effectiveContent && (
                        <div className={`description_class ${content_class_default} ${align === "left" ? "self-start" : ""}`}>
                            {effectiveContent}
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
                <Container limit={limit} className={`relative content_class ${classes.content_body_class || ""}`}>
                    {bodyContent}
                </Container>
            )}
        </section>
    );
}
