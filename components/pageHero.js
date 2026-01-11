import Container from "./container";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import BackgroundCarousel from "./backgroundCarousel";
import { ArrowDownIcon } from "@heroicons/react/solid";
import DevComment from "./DevComment";

/**
 * 自定義 Hook: 在 iOS Safari 上鎖定最小滾動位置到狀態欄高度
 * 用於讓背景延伸到狀態欄區域,並防止用戶向上滾動超過此高度
 */
function useStatusBarScrollLock() {
    useEffect(() => {
        // 只在客戶端且是首次載入時執行
        if (typeof window !== 'undefined') {
            // 檢測是否為 iOS 設備(iPhone/iPad)
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            // 檢測是否為 Safari 瀏覽器
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

            // 檢測是否為獨立模式(PWA)或瀏覽器模式
            const isStandalone = window.navigator.standalone === true ||
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
                //todo 把hero section 加高

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
                let scrollTimeout;
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
        entry_effect = {}
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
    const pretitle_class = layoutClasses.pretitle_class || "inline-block px-3 py-1 mb-component text-sm font-bold tracking-brand text-brand-accent/40 uppercase bg-brand-structural/40 rounded-full border border-brand-accent/20";
    const description_class = layoutClasses.description_class || "text-lg leading-brand tracking-brand text-brand-bg lg:text-xl xl:text-2xl opacity-90";
    const wrapper_class = layoutClasses.wrapper_class || "max-w-3xl text-center";
    const container_class = layoutClasses.container_class || "items-center justify-center";
    const ref = useRef(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const bgOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

    // 在 iOS Safari 上鎖定最小滾動位置到狀態欄高度
    // useStatusBarScrollLock();

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
                            delay: entryDelay,
                            duration: entryDuration,
                            ease: "easeInOut"
                        }}
                    />
                )}
            </motion.div>


            <DevComment text="Texts" />
            <Container className="relative z-10 py-20 flex w-full">
                <div className={`w-full flex flex-col ${wrapper_class}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {effectiveSubTitle && (
                            <span className={pretitle_class}>
                                {effectiveSubTitle}
                            </span>
                        )}
                        <h1 className={title_class}>
                            {effectiveTitle}
                        </h1>
                        {effectiveContent && (
                            <p className={description_class}>
                                {effectiveContent}
                            </p>
                        )}
                    </motion.div>
                </div>
            </Container>

            <DevComment text="Scroll Down Button" />
            <motion.div
                className="absolute bottom-20 left-1/2 z-20 cursor-pointer p-2 rounded-full bg-brand-bg/10 backdrop-blur-sm border border-brand-bg/20 transition-colors duration-300"
                style={{ x: "-50%" }}
                initial={{ opacity: 0.5, y: -20, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)", x: "-50%" }}
                whileTap={{ scale: 0.9, x: "-50%" }}
                transition={{
                    y: { delay: 1, duration: 1, repeat: Infinity, repeatType: "reverse" },
                    default: { duration: 0.2 }
                }}
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            >
                <ArrowDownIcon className="w-8 h-8 text-brand-bg shadow-sm" />
            </motion.div>

        </div>
    );
}

