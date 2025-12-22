import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { DotLottiePlayer } from "@dotlottie/react-player";

export default function BackgroundCarousel({ media_list = [], bg_images, bg_video, transition_type = 'fade', overlay_opacity = 0.4, parallax_ratio = 0 }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sectionBounds, setSectionBounds] = useState(null);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Parallax ratio logic:
    // 0 = fixed (handled separately with position:fixed)
    // 1 = no parallax (background moves at same speed as content)
    // >1 = background moves faster than content
    // <1 = background moves slower than content
    const effectiveRatio = parallax_ratio ?? 0;
    const shift = (effectiveRatio - 1) * 30; // 30vh per ratio unit above 1
    const y = useTransform(scrollYProgress, [0, 1], [`${shift}vh`, `${-shift}vh`]);

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
        if (m.type === 'lottie') {
            let src = m.lottie || m.url;
            if (src && typeof src === 'string' && !src.startsWith('/') && !src.startsWith('http') && src.includes('-')) {
                src = `https://lottie.host/${src}.lottie`;
            }
            return { ...m, src };
        }
        return m;
    }).filter(m => m.src || m.image || m.video || m.lottie || (m.type === 'lottie' && m.url));

    // Legacy fallback
    const legacyImages = (bg_images || []).map(img => getImagePath(img)).filter(Boolean);
    const legacyVideo = getImagePath(bg_video);

    const items = normalizedMedia.length > 0 ? normalizedMedia : [
        ...(legacyVideo ? [{ type: 'video', src: legacyVideo }] : []),
        ...legacyImages.map(img => ({ type: 'image', src: img }))
    ];

    // Track section bounds for fixed background clipping
    useEffect(() => {
        if (effectiveRatio !== 0) return;

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
    }, [effectiveRatio]);

    useEffect(() => {
        if (items.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % items.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [items.length]);

    const currentItem = items[currentIndex] || {};

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
    const isFixed = effectiveRatio === 0;

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden">
            {items.length > 0 && (
                <>
                    {isFixed ? (
                        sectionBounds && (
                            <div
                                className="fixed inset-0 w-screen h-screen"
                                style={{
                                    clipPath: `inset(${sectionBounds.top}px ${window.innerWidth - sectionBounds.left - sectionBounds.width}px ${window.innerHeight - sectionBounds.top - sectionBounds.height}px ${sectionBounds.left}px)`
                                }}
                            >
                                <AnimatePresence mode="popLayout">
                                    <motion.div
                                        key={currentIndex}
                                        variants={currentVariant}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        transition={currentVariant.transition}
                                        className="absolute inset-0 w-full h-full"
                                    >
                                        {currentItem.type === 'video' && (
                                            <video src={currentItem.src} autoPlay loop muted playsInline className="object-cover w-full h-full" />
                                        )}
                                        {currentItem.type === 'image' && (
                                            <img src={currentItem.src} alt="" className="object-cover w-full h-full" />
                                        )}
                                        {currentItem.type === 'lottie' && (
                                            <div className="w-full h-full">
                                                <DotLottiePlayer
                                                    src={currentItem.src}
                                                    autoplay
                                                    loop
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
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
                                <div className="absolute inset-0 bg-black" style={{ opacity: overlay_opacity }}></div>
                            </div>
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
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={currentIndex}
                                    variants={currentVariant}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={currentVariant.transition}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    {currentItem.type === 'video' && (
                                        <video src={currentItem.src} autoPlay loop muted playsInline className="object-cover w-full h-full" />
                                    )}
                                    {currentItem.type === 'image' && (
                                        <img src={currentItem.src} alt="" className="object-cover w-full h-full" />
                                    )}
                                    {currentItem.type === 'lottie' && (
                                        <div className="w-full h-full">
                                            <DotLottiePlayer
                                                src={currentItem.src}
                                                autoplay
                                                loop
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
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
                            <div className="absolute inset-0 bg-black" style={{ opacity: overlay_opacity }}></div>
                        </motion.div>
                    )}
                </>
            )}

            {items.length > 1 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-4">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className="group relative flex items-center justify-center w-4 h-4 focus:outline-none"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <div className={`absolute inset-0 rounded-full border border-brand-bg transition-all duration-500 scale-100 ${currentIndex === index ? "opacity-100 scale-125" : "opacity-0 scale-50 group-hover:opacity-30"}`} />
                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${currentIndex === index ? "bg-brand-bg shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-brand-bg/40 group-hover:bg-brand-bg/60"}`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
