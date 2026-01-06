import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import MediaRenderer from './mediaRenderer';

// --- Constants ---

const TRANSITION_VARIANTS = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 1.5 }
    },
    slide: {
        initial: { x: "100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: "-100%", opacity: 0 },
        transition: { duration: 0.8, ease: "easeInOut" }
    },
    zoom: {
        initial: { scale: 1.2, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 },
        transition: { duration: 1, ease: "easeOut" }
    },
    slide_up: {
        initial: { y: "100%", opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "-50%", opacity: 0 },
        transition: { duration: 0.8, ease: "circOut" }
    },
    blur: {
        initial: { filter: "blur(20px)", opacity: 0, scale: 1.1 },
        animate: { filter: "blur(0px)", opacity: 1, scale: 1 },
        exit: { filter: "blur(20px)", opacity: 0 },
        transition: { duration: 1.2 }
    }
};

// --- Helpers ---

const getImagePath = (path) => {
    if (!path || typeof path !== 'string') return path;
    return path.startsWith('./') ? path.substring(1) : path;
};

const normalizeMediaData = (media_list = [], bg_images = [], bg_video) => {
    const normalized = (media_list || []).map(m => {
        if (m.type === 'image') return { ...m, image: getImagePath(m.image) };
        if (m.type === 'video') return { ...m, video: getImagePath(m.video), poster: getImagePath(m.poster) };
        if (m.type === 'youtube') return { ...m, url: m.url };
        if (m.type === 'lottie') {
            let src = m.lottie || m.url;
            if (src && typeof src === 'string' && !src.startsWith('/') && !src.startsWith('http') && src.includes('-')) {
                src = `https://lottie.host/${src}.lottie`;
            }
            return { ...m, url: src };
        }
        return m;
    }).filter(m => m.image || m.video || m.url || (m.type === 'lottie' && m.url));

    if (normalized.length > 0) return normalized;

    // Legacy fallback
    const legacyImages = (bg_images || []).map(img => getImagePath(img)).filter(Boolean);
    const legacyVideo = getImagePath(bg_video);

    return [
        ...(legacyVideo ? [{ type: 'video', video: legacyVideo }] : []),
        ...legacyImages.map(img => ({ type: 'image', image: img }))
    ];
};

// --- Sub-components ---

const BackgroundMediaItem = ({ item, transition_type, currentIndex, isFullViewport = false }) => {
    const currentVariant = TRANSITION_VARIANTS[transition_type] || TRANSITION_VARIANTS.fade;

    return (
        <AnimatePresence mode="popLayout">
            <motion.div
                key={currentIndex}
                variants={currentVariant}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={currentVariant.transition}
                className="inset-0 w-full h-full"
            >
                <MediaRenderer
                    media={item}
                    className={`${isFullViewport ? 'h-[100lvh]' : 'w-full h-full'} ${item.type === 'youtube' ? 'pointer-events-none scale-150 aspect-auto' : ''}`}
                    imgClassName="object-cover"
                />
            </motion.div>
        </AnimatePresence>
    );
};

const CarouselPagination = ({ itemsCount, currentIndex, onSelect }) => {
    if (itemsCount <= 1) return null;

    return (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-4">
            {Array.from({ length: itemsCount }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(index)}
                    className="group relative flex items-center justify-center w-4 h-4 focus:outline-none"
                    aria-label={`Go to slide ${index + 1}`}
                >
                    <div className={`absolute inset-0 rounded-full border border-brand-bg transition-all duration-500 scale-100 ${currentIndex === index ? "opacity-100 scale-125" : "opacity-0 scale-50 group-hover:opacity-30"}`} />
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${currentIndex === index ? "bg-brand-bg shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-brand-bg/40 group-hover:bg-brand-bg/60"}`} />
                </button>
            ))}
        </div>
    );
};

// --- Main Component ---

export default function BackgroundCarousel({
    media_list = [],
    bg_images,
    bg_video,
    transition_type = 'fade',
    overlay_opacity = 0.4,
    parallax_ratio = 0
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sectionBounds, setSectionBounds] = useState(null);
    const containerRef = useRef(null);

    const items = useMemo(() => normalizeMediaData(media_list, bg_images, bg_video), [media_list, bg_images, bg_video]);
    const currentItem = items[currentIndex] || {};

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const effectiveRatio = parallax_ratio ?? 0;
    const isFixed = effectiveRatio === 0;

    // Parallax logic
    const shift = (effectiveRatio - 1) * 30;
    const y = useTransform(scrollYProgress, [0, 1], [`${shift}vh`, `${-shift}vh`]);

    // Handle section bounds for fixed background clipping
    useEffect(() => {
        if (!isFixed) return;

        const updateBounds = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setSectionBounds({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
            }
        };

        updateBounds();
        window.addEventListener('scroll', updateBounds);
        window.addEventListener('resize', updateBounds);

        return () => {
            window.removeEventListener('scroll', updateBounds);
            window.removeEventListener('resize', updateBounds);
        };
    }, [isFixed]);

    // Auto-play timer
    useEffect(() => {
        if (items.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % items.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [items.length]);

    if (items.length === 0) return <div ref={containerRef} className="absolute inset-0 w-full h-full bg-black/10" />;

    return (
        <div ref={containerRef} className="inset-0 w-full h-full">
            {isFixed ? (
                sectionBounds && (
                    <BackgroundMediaItem
                        item={currentItem}
                        transition_type={transition_type}
                        currentIndex={currentIndex}
                        isFullViewport={true}
                    />
                )
            ) : (
                <motion.div
                    style={{
                        y,
                        height: `calc(100vh + ${Math.abs(shift) * 2}vh)`,
                        top: `-${Math.abs(shift)}vh`
                    }}
                    className="w-full absolute inset-x-0"
                >
                    <BackgroundMediaItem
                        item={currentItem}
                        transition_type={transition_type}
                        currentIndex={currentIndex}
                    />
                    {/* <div className="absolute inset-0 bg-black" style={{ opacity: overlay_opacity }} /> */}
                </motion.div>
            )}

            <CarouselPagination
                itemsCount={items.length}
                currentIndex={currentIndex}
                onSelect={setCurrentIndex}
            />
        </div>
    );
}
