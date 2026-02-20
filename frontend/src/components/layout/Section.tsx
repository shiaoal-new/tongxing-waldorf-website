import React, { ReactNode, useState, useEffect, useRef, useMemo } from 'react';
import Container from "../ui/Container";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import BackgroundCarousel from "../BackgroundCarousel";
import ActionButtons from "../ui/ActionButtons";
import SectionDivider from "../SectionDivider";
import MarkdownContent from "../ui/MarkdownContent";

import { CTAButton, MediaItem, Divider } from "../../types/content";
import dynamic from 'next/dynamic';

// Helper function to determine if a color is light using relative luminance
function isLightColor(color: string): boolean {
    if (!color) return false;

    let r = 0, g = 0, b = 0;

    if (color.startsWith('#')) {
        let hex = color.replace('#', '');
        if (hex.length === 3 || hex.length === 4) {
            hex = hex.split('').map(c => c + c).join('');
        }
        if (hex.length >= 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else return false;
    } else if (color.startsWith('rgb')) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return false;
        r = parseInt(match[1]);
        g = parseInt(match[2]);
        b = parseInt(match[3]);
    } else return false;

    // Relative luminance: 0.2126*R + 0.7152*G + 0.0722*B
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 128;
}

const ShaderGradientBackgroundDynamic = dynamic(() => import('../ShaderGradientBackground'), { ssr: false });
const SilkBackgroundDynamic = dynamic(() => import('../SilkBackground'), { ssr: false });

interface SectionProps {
    layout?: Record<string, string>;
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
    priority?: boolean; // Control whether to preload video immediately
    [key: string]: any;
}

export default function Section(props: SectionProps) {
    const {
        layout = {},
        subtitle,
        title,
        content,
        children,
        align = 'center',
        direction,
        anchor,
        buttons,
        media_list,
        parallax_ratio,
        full_height,
        className = "",
        divider,
        shader_gradient,
        silk_background,
        ignore_padding,
        content_inside_wrapper,
        entry_animation,
        overlay_color,
        limit = 10,
        background_scroll_fade,
        disable_content_animation,
        priority,
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

    const hasSpecialBg = (media_list && media_list.length > 0) || shader_gradient || silk_background || rest.bg_images || rest.bg_video;
    const isOverlayLight = overlay_color ? isLightColor(overlay_color) : false;

    const container_class = layout.container_class || "";
    const wrapper_class = layout.wrapper_class || "";

    const typographyColors = useMemo(() => {
        if (overlay_color) {
            return isOverlayLight
                ? { title: "text-gray-900", desc: "text-gray-700", subtitle: "text-brand-accent" }
                : { title: "text-white drop-shadow-md", desc: "text-stone-100/90", subtitle: "text-brand-accent brightness-125 drop-shadow-sm" };
        }
        if (hasSpecialBg) {
            return { title: "text-white drop-shadow-md", desc: "text-stone-100/90", subtitle: "text-brand-accent brightness-125 drop-shadow-sm" };
        }
        return { title: "text-brand-text dark:text-brand-bg", desc: "text-brand-taupe dark:text-brand-taupe", subtitle: "text-brand-accent" };
    }, [overlay_color, isOverlayLight, hasSpecialBg]);

    const resolveClass = (custom: string | undefined, base: string, defaultColor: string) => {
        if (!custom) return `${base} ${defaultColor}`;
        const hasColor = custom.split(/\s+/).some(t =>
            t.startsWith('text-') &&
            !/^text-(xs|sm|base|lg|[2-9]?xl|left|center|right|justify|start|end|clip|ellipsis|wrap|nowrap|balance)$/.test(t)
        );
        return hasColor ? custom : `${custom} ${defaultColor}`;
    };

    const subtitle_class = resolveClass(layout.subtitle_class, "text-sm font-bold tracking-brand uppercase", typographyColors.subtitle);
    const title_class = resolveClass(layout.title_class, "max-w-2xl mt-component", typographyColors.title);
    const content_class_default = resolveClass(layout.content_class, `max-w-4xl py-component text-lg lg:text-xl xl:text-xl ${hasSpecialBg ? 'prose-invert' : ''}`, typographyColors.desc);

    const variants: Variants = {
        hidden: {
            opacity: 0,
            x: direction === "left" ? -100 : direction === "right" ? 100 : 0,
            y: direction ? 0 : 20
        },
        visible: {
            opacity: 1, x: 0, y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    const isChildrenString = typeof children === "string";
    const effectiveContent = content || (isChildrenString ? children : null);
    const bodyContent = isChildrenString ? null : children;
    const alignmentClasses = align === "left" ? "items-start text-left" : "items-center text-center";

    const sectionClassName = [
        "w-full relative section_container py-section",
        full_height ? 'min-h-[100lvh] flex flex-col justify-center' : '',
        container_class,
        className
    ].filter(Boolean).join(' ');

    return (
        <section
            ref={sectionRef}
            id={anchor}
            className={sectionClassName}
            style={{
                backgroundColor: silk_background ? "rgb(var(--color-brand-taupe))" : undefined,
                ...rest.style
            }}
            data-special-bg={hasSpecialBg}
            {...rest}
        >
            {shader_gradient && !content_inside_wrapper && isInView && (
                <ShaderGradientBackgroundDynamic />
            )}

            {divider && (
                <SectionDivider
                    type={divider.type as any}
                    position={divider.position}
                    color={divider.color}
                    flip={divider.flip}
                />
            )}

            {(media_list?.length > 0 || rest.bg_images || rest.bg_video) && (
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
                        priority={priority}
                    />
                </motion.div>
            )}

            {silk_background && isInView && (
                <SilkBackgroundDynamic color="rgb(var(--color-brand-taupe))" />
            )}

            <Container
                limit={limit !== false}
                ignorePadding={ignore_padding}
                className={["flex w-full flex-col relative", align === "left" ? "" : "items-center justify-center text-center"].filter(Boolean).join(' ')}
            >
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    onViewportEnter={() => setIsInView(true)}
                    variants={disable_content_animation ? undefined : variants}
                    className={["w-full flex flex-col", alignmentClasses, wrapper_class].filter(Boolean).join(' ')}
                >
                    {shader_gradient && content_inside_wrapper && isInView && (
                        <ShaderGradientBackgroundDynamic />
                    )}

                    {subtitle && (
                        <div className={["section-subtitle", subtitle_class, align === "left" ? "self-start" : ""].filter(Boolean).join(' ')}>
                            {subtitle}
                        </div>
                    )}

                    {title && (
                        <h2 className={["section-title relative z-10", title_class, align === "left" ? "self-start" : ""].filter(Boolean).join(' ')}>
                            <MarkdownContent content={title} isInline />
                        </h2>
                    )}

                    {effectiveContent && (
                        <div className={["section-description relative z-10", content_class_default, align === "left" ? "self-start" : ""].filter(Boolean).join(' ')}>
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

            {!content_inside_wrapper && bodyContent && (
                <div className={["relative section-body-content z-10", layout.content_body_class].filter(Boolean).join(' ')}>
                    {bodyContent}
                </div>
            )}
        </section>
    );
}
