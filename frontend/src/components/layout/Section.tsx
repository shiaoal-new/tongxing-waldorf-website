import React, { ReactNode, useState, useEffect, useRef } from 'react';
import Container from "../ui/Container";
import { motion, useScroll, useTransform } from "framer-motion";
import BackgroundCarousel from "../BackgroundCarousel";
import ActionButtons from "../ui/ActionButtons";
import SectionDivider from "../SectionDivider";
import MarkdownContent from "../ui/MarkdownContent";

import { CTAButton, MediaItem, Divider } from "../../types/content";
import dynamic from 'next/dynamic';

// Helper function to determine if a color is light
function isLightColor(color: string): boolean {
    if (!color) return false;
    let r, g, b;

    // Handle hex colors
    if (color.startsWith('#')) {
        let hex = color.replace('#', '');
        // Expand shorthand forms (e.g. #f00 -> #ff0000, #f00a -> #ff0000aa)
        if (hex.length === 3 || hex.length === 4) {
            hex = hex.split('').map(c => c + c).join('');
        }

        if (hex.length >= 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            return false;
        }
    } else if (color.startsWith('rgb')) {
        // Handle rgb() and rgba()
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            r = parseInt(match[1]);
            g = parseInt(match[2]);
            b = parseInt(match[3]);
        } else {
            return false;
        }
    } else {
        return false;
    }

    // Calculate relative luminance: 0.2126*R + 0.7152*G + 0.0722*B
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b);
    return luminance > 128;
}

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
    overlay_color?: string;
    className?: string;
    limit?: boolean | number;
    divider?: Divider;
    shader_gradient?: boolean;
    silk_background?: boolean;
    full_height?: boolean;
    ignore_padding?: boolean;
    content_inside_wrapper?: boolean;
    entry_animation?: boolean | { delay?: number; duration?: number };
    background_scroll_fade?: boolean;
    disable_content_animation?: boolean;
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
        full_height,
        className,
        divider, // { type, position, color, flip }
        shader_gradient,
        silk_background,
        ignore_padding,
        content_inside_wrapper,
        entry_animation,
        overlay_color,
        limit = 10,
        background_scroll_fade,
        disable_content_animation,
        ...rest
    } = props;



    const [isInView, setIsInView] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"]
    });

    const bgOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const backgroundOpacity = background_scroll_fade ? bgOpacity : 1;

    // Use classes from layout if provided, otherwise use defaults
    const classes = layout || {};
    const container_class = classes.container_class || "";
    const wrapper_class = classes.wrapper_class || "";
    // If background media or shader gradient is present, default to white text for better visibility
    const hasSpecialBg = (media_list && media_list.length > 0) || shader_gradient || silk_background;

    // Determine default colors based on overlay_color or background type
    let defaultTitleColor = "text-brand-text dark:text-brand-bg";
    let defaultDescColor = "text-brand-taupe dark:text-brand-taupe";
    let defaultSubtitleColor = "text-brand-accent";

    if (overlay_color) {
        if (isLightColor(overlay_color)) {
            // Light overlay -> Dark text (force dark to ensure contrast)
            defaultTitleColor = "text-gray-900";
            defaultDescColor = "text-gray-700";
            defaultSubtitleColor = "text-brand-accent";
        } else {
            // Dark overlay -> White text
            defaultTitleColor = "text-white drop-shadow-md";
            defaultDescColor = "text-stone-100/90";
            defaultSubtitleColor = "text-brand-accent brightness-125 drop-shadow-sm";
        }
    } else if (hasSpecialBg) {
        defaultTitleColor = "text-white drop-shadow-md";
        defaultDescColor = "text-stone-100/90";
        defaultSubtitleColor = "text-brand-accent brightness-125 drop-shadow-sm";
    }


    /**
     * Helper to resolve classes. 
     * If a custom class is provided but lacks a color (text-*), it appends the default color.
     */
    const resolveClass = (custom: string | undefined, defaults: string, color: string) => {
        if (!custom) return `${defaults} ${color}`;

        // Smarter check: ignore text-size, text-alignment and other utility classes
        // Only consider it "having a color" if it has a text- color class that isn't one of the excluded ones
        const tokens = custom.split(/\s+/);
        const hasColor = tokens.some(token => {
            if (!token.startsWith('text-')) return false;

            // Check if this token matches any of the non-color patterns
            // Use simple string checks where possible for performance, regex for patterns
            const isSize = /^text-(xs|sm|base|lg|([2-9])?xl)$/.test(token);
            const isAlign = ['text-left', 'text-center', 'text-right', 'text-justify', 'text-start', 'text-end'].includes(token);
            const isWrap = ['text-clip', 'text-ellipsis', 'text-wrap', 'text-nowrap', 'text-balance'].includes(token);

            return !(isSize || isAlign || isWrap);
        });

        if (hasColor) return custom;
        return `${custom} ${color}`;
    };


    const subtitle_class = resolveClass(classes.subtitle_class, "text-sm font-bold tracking-brand uppercase", defaultSubtitleColor);
    const title_class = resolveClass(classes.title_class, "max-w-2xl mt-component", defaultTitleColor);
    const content_class_default = resolveClass(classes.content_class, `max-w-4xl py-component text-lg lg:text-xl xl:text-xl ${hasSpecialBg ? 'prose-invert' : ''}`, defaultDescColor);



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
            ref={sectionRef}
            id={anchor}
            className={`w-full relative section_container py-section ${full_height ? 'min-h-[100lvh] flex flex-col justify-center' : ''} ${container_class} ${className || ""}`}
            style={{
                backgroundColor: silk_background ? "rgb(var(--color-brand-taupe))" : undefined,
                ...rest.style
            }}
            data-special-bg={hasSpecialBg}
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

            {(media_list && media_list.length > 0 || rest.bg_images || rest.bg_video) && (
                <motion.div style={{ opacity: backgroundOpacity }} className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                    <BackgroundCarousel
                        media_list={media_list}
                        bg_images={rest.bg_images}
                        bg_video={rest.bg_video}
                        bg_video_mobile={rest.bg_video_mobile}
                        transition_type={rest.transition_type}
                        parallax_ratio={parallax_ratio}
                        overlay_color={overlay_color}
                        entry_animation={entry_animation}
                    />
                </motion.div>
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
                    variants={disable_content_animation ? undefined : variants}
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
                    <div className={`relative content_class z-10 ${classes.content_body_class || ""}`}>
                        {bodyContent}
                    </div>
                )
            }
        </section >
    );
}
