import React from "react";
import Container from "../ui/Container";
import ShinyText from "../ui/ShinyText";
import { motion, Variants } from "framer-motion";
import { useEffect, useMemo } from "react";
import { ArrowDownIcon } from "@heroicons/react/solid";
import DevComment from "../ui/DevComment";
import { HeroData, CTAButton } from "../../types/content";
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

interface HeroSectionProps {
    data: HeroData & {
        header?: string;
        sub_header?: string;
        bg_images?: string[];
        bg_video?: string;
        bg_video_mobile?: string;
        transition_type?: 'fade' | 'slide';
        entry_effect?: {
            type?: string;
            delay?: number;
            duration?: number;
            brightness?: number;
        };
        parallax_ratio?: number;
        buttons?: CTAButton[];
    };
}

export default function HeroSection({ data }: HeroSectionProps) {
    const {
        layout = {},
        title,
        subtitle,
        header,
        sub_header,
        media_list = [],
        bg_images,
        bg_video,
        bg_video_mobile,
        transition_type = 'fade',
        entry_effect = {},
        accent_text = "手、心、腦的均衡成長",
        buttons = [],
        full_height = true,
        divider,
        parallax_ratio,
        overlay_color = "#000000"
    } = data;

    const {
        type: entryType = 'fade_to_dim',
        delay: entryDelay = 1,
        duration: entryDuration = 2,
        brightness: entryBrightness = 0.4
    } = entry_effect;

    // Entry animation configuration for Section
    const entryAnimation = entryType === 'fade_to_dim' ? { delay: entryDelay, duration: entryDuration } : false;

    // Resolve overlay color with alpha if it's a fade entry
    const finalOverlayColor = useMemo(() => {
        if (entryType !== 'fade_to_dim' || overlay_color.length > 7) return overlay_color;
        const alpha = Math.round((1 - entryBrightness) * 255).toString(16).padStart(2, '0');
        return `${overlay_color}${alpha}`;
    }, [overlay_color, entryType, entryBrightness]);

    // Content resolution (handles legacy header/subtitle)
    const displayTitle = title || header;
    const displaySubtitle = subtitle || sub_header;

    // Style resolution
    const layoutClasses = layout as Record<string, string>;
    const titleClass = layoutClasses.title_class || "mb-component text-brand-bg";
    const pretitleClass = layoutClasses.pretitle_class || "inline-block px-3 py-1 mb-component text-sm font-bold tracking-brand text-brand-accent/90 uppercase bg-brand-structural/50 rounded-full border border-brand-accent/20";
    const wrapperClass = layoutClasses.wrapper_class || "max-w-3xl text-center";

    useStatusBarScrollLock();

    // Framer motion variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
        visible: {
            opacity: 1, y: 0, filter: "blur(0px)",
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const accentVariants: Variants = {
        hidden: { opacity: 0, scale: 0.8, rotate: -5 },
        visible: {
            opacity: 0.8, scale: 1, rotate: -2,
            transition: { delay: 0.6, duration: 1.2, ease: "easeOut" }
        }
    };

    const handleScrollDown = () => {
        const sections = document.querySelectorAll('section');
        const target = sections.length > 1 ? sections[1] : null;
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }
    };

    // Source file helpers
    const sourceFile = (data as any)._sourceFile;
    const sourceLines = (data as any)._sourceLines || {};
    const getSource = (field: string) => {
        if (!sourceFile) return undefined;
        // 优先使用具体字段的行号，其次使用 hero 块的行号
        const line = sourceLines[field] || (data as any)._sourceLine;
        return line ? `${sourceFile}:${line}` : sourceFile;
    };

    return (
        <Section
            data-yml-src={(data as any)._sourceFile} // Hero 整体定位
            full_height={full_height}
            className="flex flex-col justify-center"
            media_list={media_list as any} // HeroMedia vs MediaItem subtle difference
            bg_images={bg_images}
            bg_video={bg_video}
            bg_video_mobile={bg_video_mobile}
            transition_type={transition_type}
            parallax_ratio={parallax_ratio}
            overlay_color={finalOverlayColor}
            entry_animation={entryAnimation}
            background_scroll_fade
            disable_content_animation
            priority={true} // Hero section videos should preload immediately
            layout={{
                wrapper_class: wrapperClass,
                container_class: layoutClasses.container_class || "items-center justify-center",
                content_body_class: "flex-grow flex flex-col justify-center"
            }}
            divider={divider}
        >
            <DevComment text="Hero Texts" />
            <motion.div
                className="w-full flex flex-col items-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {displaySubtitle && (
                    <motion.div variants={itemVariants} data-yml-src={getSource('subtitle')}>
                        <span className={pretitleClass}>{displaySubtitle}</span>
                    </motion.div>
                )}

                <motion.div variants={itemVariants} className="relative">
                    <h1 className={titleClass} data-yml-src={getSource('title')}>
                        <ShinyText text={displayTitle || ""} speed={3} />
                    </h1>

                    {accent_text && (
                        <motion.span
                            variants={accentVariants}
                            className="absolute -top-6 right-0 lg:-top-10 lg:-right-4 font-accent text-brand-accent text-xl lg:text-3xl opacity-80 select-none pointer-events-none"
                            data-yml-src={getSource('accent_text')}
                        >
                            {accent_text}
                        </motion.span>
                    )}
                </motion.div>

                {buttons.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="relative z-10 mt-6 flex flex-col items-center pb-6"
                        data-yml-src={getSource('buttons')}
                    >
                        <ActionButtons buttons={buttons} align="center" size="lg" />
                        {(data as any).subtext && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                transition={{ delay: 1.2 }}
                                className="mt-paragraph text-sm text-brand-bg/80 italic font-light tracking-brand"
                            >
                                {(data as any).subtext}
                            </motion.p>
                        )}
                    </motion.div>
                )}
            </motion.div>

            <DevComment text="Scroll Down Button" />
            <motion.button
                className="absolute bottom-4 md:bottom-8 left-1/2 z-20 p-3 rounded-full bg-brand-bg/10 backdrop-blur-md border border-brand-bg/20 shadow-lg transition-colors group"
                style={{ x: "-50%" }}
                initial={{ opacity: 0, y: -20, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)", x: "-50%" }}
                whileTap={{ scale: 0.9, x: "-50%" }}
                transition={{
                    y: { delay: 2, duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } as any,
                    default: { duration: 0.3 }
                }}
                onClick={handleScrollDown}
                aria-label="Scroll to content"
            >
                <ArrowDownIcon className="w-6 h-6 md:w-8 md:h-8 text-brand-bg group-hover:text-white transition-colors" />
            </motion.button>
        </Section>
    );
}
