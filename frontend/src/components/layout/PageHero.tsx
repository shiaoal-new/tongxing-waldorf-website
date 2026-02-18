import React from "react";
import Container from "../ui/Container";
import ShinyText from "../ui/ShinyText";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { ArrowDownIcon } from "@heroicons/react/solid";
import DevComment from "../ui/DevComment";
import { HeroData } from "../../types/content";
import ActionButtons from "../ui/ActionButtons";
import Section from "./Section";

/**
 * 自定義 Hook: 在 iOS Safari 上鎖定最小滾動位置到狀態欄高度
 * 用於讓背景延伸到狀態欄區域,並防止用戶向上滾動超過此高度
 */
function useStatusBarScrollLock() {
    useEffect(() => {
        // 只在客戶端且是首次載入時執行
        if (typeof window !== 'undefined') {
            // 檢測是否為 iOS 設備(iPhone/iPad)
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

            // 檢測是否為 Safari 瀏覽器
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

            // 檢測是否為獨立模式(PWA)或瀏覽器模式
            const isStandalone = (window.navigator as any).standalone === true ||
                window.matchMedia('(display-mode: standalone)').matches;

            // 只在 iOS Safari 瀏覽器模式下執行(有狀態欄的情況)
            // 獨立模式(PWA)通常沒有狀態欄,所以排除
            if (isIOS && isSafari && !isStandalone) {
                // 從 CSS 變數讀取狀態欄高度
                const statusBarHeight = parseInt(
                    getComputedStyle(document.documentElement)
                        .getPropertyValue('--status-bar-height')
                ) || 44; // 如果讀取失敗,使用預設值 44px

                // 立即滾動到狀態欄高度,不使用 smooth
                window.scrollTo(0, statusBarHeight);

                // 添加滾動事件監聽器,限制不能向上滾動超過 statusBarHeight
                // 使用 scrollend 事件(滾動完成後觸發)
                const handleScrollEnd = () => {
                    if (window.scrollY < statusBarHeight) {
                        // 如果滾動位置小於狀態欄高度,平滑滾動回到狀態欄高度
                        window.scrollTo({ top: statusBarHeight, behavior: 'smooth' });
                    }
                };

                // 監聽 scrollend 事件(現代瀏覽器支持)
                window.addEventListener('scrollend', handleScrollEnd);

                // 後備方案:使用 scroll 事件 + debounce(針對不支持 scrollend 的舊版瀏覽器)
                let scrollTimeout: NodeJS.Timeout;
                const handleScrollDebounced = () => {
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        if (window.scrollY < statusBarHeight) {
                            window.scrollTo({ top: statusBarHeight, behavior: 'smooth' });
                        }
                    }, 150); // 滾動停止 150ms 後執行
                };

                window.addEventListener('scroll', handleScrollDebounced, { passive: true });

                // 清理函數:組件卸載時移除事件監聽器
                return () => {
                    window.removeEventListener('scrollend', handleScrollEnd);
                    window.removeEventListener('scroll', handleScrollDebounced);
                    clearTimeout(scrollTimeout);
                };
            }
        }
    }, []); // 空依賴陣列,只在組件掛載時執行一次
}

interface PageHeroProps {
    data: HeroData & {
        bg_video_mobile?: string;
        parallax_ratio?: number;
        full_height?: boolean;
    };
}

export default function PageHero({ data }: PageHeroProps) {
    const {
        layout,
        title,
        subtitle,
        // Legacy support
        header: legacyHeader,
        sub_header: legacySubHeader,
        media_list = [],
        bg_images,
        bg_video,
        transition_type = 'fade',
        scrolling_effect = 'fadeToWhite', // none, fadeToDark, fadeToWhite
        entry_effect = {},
        accent_text = "手、心、腦的均衡成長", // Default or from data
        buttons = [],
        full_height = true,
    } = data as any;

    const {
        type: entryType = 'fade_to_dim',
        delay: entryDelay = 1,
        duration: entryDuration = 2,
        brightness: entryBrightness = 0.4
    } = entry_effect;

    // Convert old Hero entry_effect to the new common format
    const commonEntryAnimation = entryType === 'fade_to_dim' ? {
        delay: entryDelay,
        duration: entryDuration
    } : false;

    // Consolidate into Hex8 color
    const commonOverlayColor = useMemo(() => {
        const baseColor = data.overlay_color || "#000000";
        // If it's a fade_to_dim hero, use the brightness calculation. 
        // Otherwise use the provided overlay_color directly.
        if (entryType === 'fade_to_dim') {
            const opacity = 1 - entryBrightness;
            if (opacity === 0) return undefined;
            if (baseColor.length > 7) return baseColor; // Already has alpha
            const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
            return `${baseColor}${alpha}`;
        }

        return data.overlay_color;
    }, [data.overlay_color, entryType, entryBrightness]);

    // Resolve content 
    const effectiveTitle = title || legacyHeader;
    const effectiveSubTitle = subtitle || legacySubHeader;

    // Resolve Layout CSS
    const layoutClasses = layout || {};
    const title_class = layoutClasses.title_class || "mb-component text-brand-bg";
    const pretitle_class = layoutClasses.pretitle_class || "inline-block px-3 py-1 mb-component text-sm font-bold tracking-brand text-brand-accent/90 uppercase bg-brand-structural/50 rounded-full border border-brand-accent/20";
    // Default to max-w-3xl for hero, centered
    const wrapper_class = layoutClasses.wrapper_class || "max-w-3xl text-center";

    useStatusBarScrollLock();

    // Animation Variants
    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    const accentVariants: any = {
        hidden: { opacity: 0, scale: 0.8, rotate: -5 },
        visible: {
            opacity: 0.8,
            scale: 1,
            rotate: -2,
            transition: {
                delay: 0.6,
                duration: 1.2,
                ease: "easeOut"
            }
        }
    };

    return (
        <Section
            full_height={full_height}
            className="flex flex-col justify-center"

            // Background Configuration
            media_list={media_list}
            bg_images={bg_images}
            bg_video={bg_video}
            bg_video_mobile={data.bg_video_mobile}
            transition_type={transition_type}
            parallax_ratio={data.parallax_ratio}

            // Overlay & Effects
            overlay_color={commonOverlayColor}
            entry_animation={commonEntryAnimation}
            background_scroll_fade={true}
            disable_content_animation={true} // We handle our own content animation

            // Layout
            layout={{
                wrapper_class: wrapper_class,
                container_class: layoutClasses.container_class || "items-center justify-center",
            }}

            // Divider
            divider={data.divider}
        >
            <DevComment text="Hero Texts" />
            <motion.div
                className="w-full flex flex-col items-center"
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
                        <ShinyText
                            text={effectiveTitle}
                            disabled={false}
                            speed={3}
                            className=""
                        />
                    </h1>

                    {/* 裝飾性手寫文字 - 響應式顯示 */}
                    {accent_text && (
                        <motion.span
                            variants={accentVariants}
                            className="absolute -top-6 right-0 lg:-top-10 lg:-right-4 font-accent text-brand-accent text-xl lg:text-3xl opacity-80 select-none pointer-events-none"
                        >
                            {accent_text}
                        </motion.span>
                    )}
                </motion.div>

                {buttons && buttons.length > 0 && (
                    <motion.div variants={itemVariants} className="relative z-10 mt-6 flex justify-center pb-6">
                        <ActionButtons buttons={buttons} align="center" size="lg" />
                    </motion.div>
                )}
            </motion.div>

            <DevComment text="Scroll Down Button" />
            <motion.button
                className="absolute bottom-10 md:bottom-20 left-1/2 z-20 cursor-pointer p-3 rounded-full bg-brand-bg/10 backdrop-blur-md border border-brand-bg/20 shadow-lg transition-colors duration-300 group"
                style={{ x: "-50%" }}
                initial={{ opacity: 0, y: -20, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)", x: "-50%" }}
                whileTap={{ scale: 0.9, x: "-50%" }}
                transition={{
                    y: {
                        delay: 2,
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    } as any,
                    default: { duration: 0.3 }
                }}
                onClick={() => {
                    // Start searching from the next sibling, or use a more specific selector
                    const sections = document.querySelectorAll('section');
                    // Assuming PageHero is always the first section if present
                    if (sections.length > 1) {
                        sections[1].scrollIntoView({ behavior: 'smooth' });
                    } else {
                        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                    }
                }}
                aria-label="Scroll to content"
            >
                <ArrowDownIcon className="w-6 h-6 md:w-8 md:h-8 text-brand-bg group-hover:text-white transition-colors" />
            </motion.button>
        </Section>
    );
}
