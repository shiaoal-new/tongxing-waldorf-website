import React, { ReactNode } from "react";
import Container from "../ui/Container";
import { motion } from "framer-motion";
import BackgroundCarousel from "../BackgroundCarousel";
import ActionButtons from "../ui/ActionButtons";
import SectionDivider from "../SectionDivider";
import MarkdownContent from "../ui/MarkdownContent";

import { CTAButton, MediaItem, Divider } from "../../types/content";
import dynamic from 'next/dynamic';
import { useState } from 'react';

const ShaderGradientBackgroundDynamic = dynamic(
    () => import('../ShaderGradientBackground'),
    { ssr: false }
);

const SilkBackgroundDynamic = dynamic(
    () => import('../SilkBackground'),
    { ssr: false }
);

interface SectionProps {
    layout?: any;
    subtitle?: string;
    title?: string;
    content?: string;
    children?: ReactNode;
    align?: 'left' | 'center' | 'right';
    direction?: 'left' | 'right' | 'up' | 'down';
    anchor?: string;
    buttons?: CTAButton[];
    media_list?: MediaItem[];
    parallax_ratio?: number;
    className?: string;
    limit?: boolean | number;
    divider?: Divider;
    shader_gradient?: boolean;
    silk_background?: boolean;
    ignore_padding?: boolean;
    content_inside_wrapper?: boolean;
    [key: string]: any;
}

export default function Section(props: SectionProps) {
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
        shader_gradient,
        silk_background,
        ignore_padding,
        content_inside_wrapper,
        ...rest
    } = props;

    const [isInView, setIsInView] = useState(false);

    // Use classes from layout if provided, otherwise use defaults
    const classes = layout || {};
    const container_class = classes.container_class || "";
    const wrapper_class = classes.wrapper_class || "";
    // If background media or shader gradient is present, default to white text for better visibility
    const hasSpecialBg = (media_list && media_list.length > 0) || shader_gradient || silk_background;
    const defaultTitleColor = hasSpecialBg ? "text-brand-bg" : "text-brand-text dark:text-brand-bg";
    const defaultDescColor = hasSpecialBg ? "text-brand-bg" : "text-brand-taupe dark:text-brand-taupe";
    const defaultSubtitleColor = hasSpecialBg ? "text-brand-accent/40" : "text-brand-accent";

    const subtitle_class = classes.subtitle_class || `text-sm font-bold tracking-brand ${defaultSubtitleColor} uppercase`;
    const title_class = classes.title_class || `max-w-2xl mt-component ${defaultTitleColor}`;
    const content_class_default = classes.content_class || `max-w-4xl py-component text-lg ${defaultDescColor} lg:text-xl xl:text-xl`;

    // Define animation variants based on direction
    const variants: any = {
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
            style={{
                backgroundColor: silk_background ? "rgb(var(--color-brand-taupe))" : undefined,
                ...rest.style
            }}
            {...rest}
        >
            {/* Moved shader gradient inside motion.div for contained effect if content_inside_wrapper is true, 
                otherwise keep it here for full-section effect. 
                Actually, the user wants it to be a billboard, so it should be inside the wrapper. */}
            {shader_gradient && !content_inside_wrapper && isInView && (
                <ShaderGradientBackgroundDynamic />
            )}
            {/* SVG Divider */}
            {divider && (
                <SectionDivider
                    type={divider.type as any}
                    position={divider.position}
                    color={divider.color}
                    flip={divider.flip}
                />
            )}

            {media_list && media_list.length > 0 && (
                <BackgroundCarousel media_list={media_list} parallax_ratio={parallax_ratio} />
            )}

            {silk_background && isInView && (
                <SilkBackgroundDynamic color="rgb(var(--color-brand-taupe))" />
            )}

            <Container
                limit={limit !== false}
                ignorePadding={ignore_padding}
                className={`flex w-full flex-col relative ${align === "left" ? "" : "items-center justify-center text-center"}`}>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    onViewportEnter={() => setIsInView(true)}
                    variants={variants}
                    className={`w-full flex flex-col wrapper_class ${alignmentClasses} ${wrapper_class}`}
                >
                    {shader_gradient && content_inside_wrapper && isInView && (
                        <ShaderGradientBackgroundDynamic />
                    )}
                    {subtitle && (
                        <div className={`subtitle_class ${subtitle_class} relative z-10 ${align === "left" ? "self-start" : ""}`}>
                            {subtitle}
                        </div>
                    )}

                    {title && (
                        <h2 className={`title_class ${title_class} relative z-10 ${align === "left" ? "self-start" : ""}`}>
                            <MarkdownContent content={title} isInline />
                        </h2>
                    )}

                    {effectiveContent && (
                        <div className={`description_class ${content_class_default} relative z-10 ${align === "left" ? "self-start" : ""}`}>
                            <MarkdownContent content={effectiveContent} />
                        </div>
                    )}

                    {buttons && buttons.length > 0 && (
                        <ActionButtons
                            buttons={buttons}
                            align={align === "left" ? "left" : "center"}
                            className="mt-6 relative z-10"
                        />
                    )}

                    {content_inside_wrapper && bodyContent && (
                        <div className="w-full relative z-10">
                            {bodyContent}
                        </div>
                    )}
                </motion.div>
            </Container>

            {
                !content_inside_wrapper && bodyContent && (
                    <Container limit={!!limit} ignorePadding={ignore_padding} className={`relative content_class z-10 ${classes.content_body_class || ""}`}>
                        {bodyContent}
                    </Container>
                )
            }
        </section >
    );
}
