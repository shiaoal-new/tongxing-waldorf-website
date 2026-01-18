import Container from "./Container";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useMemo } from "react";
import BackgroundCarousel from "./BackgroundCarousel";
import { ArrowDownIcon } from "@heroicons/react/solid";
import DevComment from "./DevComment";
import SectionDivider from "./SectionDivider";
import Typed from 'typed.js';
import { useUXTestMode } from '../context/UXTestModeContext';

/**
 * Typed.js Hook: 打字機效果
 */
function useTyped(elementRef, options) {
    useEffect(() => {
        if (!elementRef.current) return;

        const typed = new Typed(elementRef.current, options);

        return () => {
            typed.destroy();
        };
    }, [elementRef, options]);
}

/**
 * 逐字显现组件
 * 每个字符依次淡入显现
 */
function CharByCharReveal({ text, delay = 3 }) {
    const characters = text.split('');

    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: delay
            }
        }
    };

    const charVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.8
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.span
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'inline-block' }}
        >
            {characters.map((char, index) => (
                <motion.span
                    key={index}
                    variants={charVariants}
                    style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.span>
    );
}



export default function PageHero({ data }) {
    const {
        layout,
        title,
        subtitle,
        content,
        // Legacy support
        header: legacyHeader,
        sub_header: legacySubHeader,
        description: legacyDescription,
        media_list = [],
        bg_images,
        bg_video,
        transition_type = 'fade',
        scrolling_effect = 'fadeToWhite', // none, fadeToDark, fadeToWhite
        entry_effect = {},
        accent_text = "手、心、腦的均衡成長" // Default or from data
    } = data;

    const effect = scrolling_effect;
    const {
        type: entryType = 'fade_to_dim',
        delay: entryDelay = 1,
        duration: entryDuration = 2,
        brightness: entryBrightness = 0.6
    } = entry_effect;

    // Resolve content 
    const effectiveTitle = title || legacyHeader;
    const effectiveSubTitle = subtitle || legacySubHeader;
    const effectiveContent = content || legacyDescription;

    // Resolve Layout CSS
    const layoutClasses = layout || {};
    const title_class = layoutClasses.title_class || "mb-component text-brand-bg";
    const pretitle_class = layoutClasses.pretitle_class || "inline-block px-4 py-2 mb-component text-sm font-bold tracking-brand text-brand-accent uppercase bg-brand-structural/60 backdrop-blur-md rounded-full border-2 border-brand-accent/40 shadow-[0_0_20px_rgba(251,146,60,0.3)]";
    const description_class = layoutClasses.description_class || "text-lg leading-brand tracking-brand text-brand-bg lg:text-xl xl:text-2xl opacity-90";
    const wrapper_class = layoutClasses.wrapper_class || "max-w-3xl text-center";
    const container_class = layoutClasses.container_class || "items-center justify-center";
    const ref = useRef(null);
    const typedRef = useRef(null);

    // UX 测试模式设置
    const { getComponentSetting } = useUXTestMode();
    const accentAnimationType = getComponentSetting('pageHero', 'accentAnimationType', 'charByChar');
    const uxShowScrollButton = getComponentSetting('pageHero', 'showScrollButton', true);
    const uxEntryDelay = getComponentSetting('pageHero', 'entryDelay', entryDelay);

    // 初始化 Typed.js 打字機效果 (仅在 typed 模式下)
    const typedOptions = useMemo(() => ({
        strings: [accent_text],
        typeSpeed: 100,
        startDelay: (uxEntryDelay + 2) * 1000,
        showCursor: true,
        cursorChar: '|',
        autoInsertCss: true,
    }), [accent_text, uxEntryDelay]);

    useTyped(accentAnimationType === 'typed' ? typedRef : { current: null }, typedOptions);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const bgOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.5
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                delay: 1,
                duration: 2,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    const accentVariants = {
        hidden: { opacity: 0, scale: 0.8, rotate: -5 },
        visible: {
            opacity: 0.8,
            scale: 1,
            rotate: -2,
            transition: {
                delay: 3,
                duration: 2,
                ease: "easeOut"
            }
        }
    };

    return (
        <div ref={ref} className={`relative flex h-[100lvh] ${container_class}`}>

            <DevComment text="Background Carousel" />
            <motion.div
                className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                style={{
                    opacity: effect !== 'none' ? bgOpacity : 1
                }}
            >
                <BackgroundCarousel
                    media_list={media_list}
                    bg_images={bg_images}
                    bg_video={bg_video}
                    transition_type={transition_type}
                    parallax_ratio={data.parallax_ratio}
                />

                {/* 背景進入特效層 (Entry Effect Overlay) */}
                {entryType === 'fade_to_dim' && (
                    <motion.div
                        className="absolute inset-0 bg-black pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 - entryBrightness }}
                        transition={{
                            delay: uxEntryDelay,
                            duration: entryDuration,
                            ease: "easeInOut"
                        }}
                    />
                )}
            </motion.div>


            <DevComment text="Texts" />
            <Container className="relative z-10 py-20 flex w-full">
                <motion.div
                    className={`w-full flex flex-col ${wrapper_class}`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {effectiveSubTitle && (
                        <motion.div variants={itemVariants}>
                            <span className={pretitle_class}>
                                {effectiveSubTitle}
                            </span>
                        </motion.div>
                    )}

                    <motion.div variants={itemVariants} className="relative">
                        <h1 className={title_class}>
                            {effectiveTitle}
                        </h1>

                        {/* 裝飾性手寫文字 - 可切換動畫效果 */}
                        {accent_text && accentAnimationType !== 'none' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: uxEntryDelay + 2, duration: 0.5 }}
                                className="absolute -top-6 -right-2 lg:-top-10 lg:-right-4 font-accent text-brand-accent text-xl lg:text-3xl select-none pointer-events-none"
                                style={{
                                    textShadow: '0 0 20px rgba(251,146,60,0.8), 0 0 40px rgba(251,146,60,0.5), 2px 2px 4px rgba(0, 0, 0, 0.8)',
                                    filter: 'drop-shadow(0 0 10px rgba(251, 146, 60, 0.6))'
                                }}
                            >
                                {accentAnimationType === 'typed' ? (
                                    <span ref={typedRef}></span>
                                ) : accentAnimationType === 'charByChar' ? (
                                    <CharByCharReveal text={accent_text} delay={uxEntryDelay + 2} />
                                ) : (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                        animate={{ opacity: 1, scale: 1, rotate: -2 }}
                                        transition={{ delay: uxEntryDelay + 2, duration: 2, ease: "easeOut" }}
                                    >
                                        {accent_text}
                                    </motion.span>
                                )}
                            </motion.div>
                        )}
                    </motion.div>

                    {effectiveContent && (
                        <motion.div variants={itemVariants}>
                            <div className={`${description_class} backdrop-blur-md bg-black/10 shadow-2xl overflow-hidden group`}>
                                {/* Subtle inner glow for glass effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                <p className="relative z-10">
                                    {effectiveContent}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </Container>

            <DevComment text="Scroll Down Button" />
            {uxShowScrollButton && (
                <motion.div
                    className="absolute bottom-10 md:bottom-20 left-1/2 z-20 cursor-pointer p-3 rounded-full bg-brand-bg/10 backdrop-blur-md border border-brand-bg/20 shadow-lg transition-colors duration-300 group"
                    style={{ x: "-50%" }}
                    initial={{ opacity: 0, y: -20, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)", x: "-50%" }}
                    whileTap={{ scale: 0.9, x: "-50%" }}
                    transition={{
                        y: {
                            delay: uxEntryDelay + 1,
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        },
                        opacity: { delay: uxEntryDelay + 0.5 },
                        default: { duration: 0.3 }
                    }}
                    onClick={() => {
                        const nextSection = document.querySelector('Section');
                        if (nextSection) {
                            nextSection.scrollIntoView({ behavior: 'smooth' });
                        } else {
                            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                        }
                    }}
                    aria-label="Scroll to content"
                >
                    <ArrowDownIcon className="w-6 h-6 md:w-8 md:h-8 text-brand-bg group-hover:text-white transition-colors" />
                </motion.div>
            )}

            {/* Section Divider */}
            {data.divider && (
                <SectionDivider
                    type={data.divider.type}
                    position={data.divider.position || "bottom"}
                    color={data.divider.color}
                    flip={data.divider.flip}
                    zIndex="z-[5]"
                />
            )}

        </div>
    );
}
