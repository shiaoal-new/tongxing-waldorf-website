import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

export default function BackgroundCarousel({ media_list = [], bg_images, bg_video, transition_type = 'fade', overlay_opacity = 0.4 }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 200]); // Parallax effect

    const getImagePath = (path) => {
        if (!path) return path;
        if (typeof path !== 'string') return null;
        if (path.startsWith('./')) {
            return path.substring(1);
        }
        return path;
    };

    // Normalize media list from new structure
    const normalizedMedia = (media_list || []).map(m => {
        if (m.type === 'image') return { ...m, src: getImagePath(m.image) };
        if (m.type === 'video') return { ...m, src: getImagePath(m.video) };
        if (m.type === 'youtube') return { ...m, src: m.url };
        return m;
    }).filter(m => m.src || m.image || m.video);

    // Legacy fallback
    const legacyImages = (bg_images || []).map(img => getImagePath(img)).filter(Boolean);
    const legacyVideo = getImagePath(bg_video);

    const items = normalizedMedia.length > 0 ? normalizedMedia : [
        ...(legacyVideo ? [{ type: 'video', src: legacyVideo }] : []),
        ...legacyImages.map(img => ({ type: 'image', src: img }))
    ];

    if (items.length === 0) return null;

    useEffect(() => {
        if (items.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % items.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [items.length]);

    const itemsSafe = items.length > 0 ? items : [];
    const currentItem = itemsSafe[currentIndex] || {};

    const variants = {
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

    const currentVariant = variants[transition_type] || variants.fade;

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentIndex}
                    style={{ y }} // Apply parallax only to the container
                    variants={currentVariant}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={currentVariant.transition}
                    className="absolute inset-0 w-full h-full"
                >
                    {currentItem.type === 'video' && (
                        <video
                            src={currentItem.src}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="object-cover w-full h-full"
                        />
                    )}

                    {currentItem.type === 'image' && (
                        <img
                            src={currentItem.src}
                            alt=""
                            className="object-cover w-full h-full"
                        />
                    )}
                    {currentItem.type === 'youtube' && (
                        <div className="w-full h-full pointer-events-none scale-150">
                            <iframe
                                src={`https://www.youtube.com/embed/${currentItem.url.split('v=')[1] || currentItem.url.split('/').pop()}?autoplay=1&mute=1&loop=1&playlist=${currentItem.url.split('v=')[1] || currentItem.url.split('/').pop()}&controls=0&showinfo=0`}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="autoplay"
                            />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div
                className="absolute inset-0 bg-black backdrop-blur-[0px]"
                style={{ opacity: overlay_opacity }}
            ></div>

            {/* Indicators */}
            {items.length > 1 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-4">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className="group relative flex items-center justify-center w-4 h-4 focus:outline-none"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <div className={`absolute inset-0 rounded-full border border-white transition-all duration-500 scale-100 ${currentIndex === index ? "opacity-100 scale-125" : "opacity-0 scale-50 group-hover:opacity-30"
                                }`} />
                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${currentIndex === index ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-white/40 group-hover:bg-white/60"
                                }`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
