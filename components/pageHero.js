import Container from "./container";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function PageHero({ data }) {
    const { title, sub_title, description, bg_images, bg_video, transition_type = 'fade' } = data;
    const ref = useRef(null);
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 200]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const getImagePath = (path) => {
        if (!path) return path;
        if (path.startsWith('./')) {
            return path.substring(1);
        }
        return path;
    };

    // Normalize images list
    const images = (bg_images || []).map(img => getImagePath(img)).filter(Boolean);
    const videoUrl = getImagePath(bg_video);

    useEffect(() => {
        if (!videoUrl && images.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [images.length, videoUrl]);

    // Transition Variants mapping
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
        <div ref={ref} className="relative flex items-center justify-center min-h-[100vh] overflow-hidden bg-gray-900">
            {/* Background Media */}
            <div className="absolute inset-0 w-full h-full">
                {videoUrl ? (
                    <motion.video
                        style={{ y }}
                        src={videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="object-cover w-full h-full"
                    />
                ) : images.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={currentIndex}
                            style={{ y }}
                            variants={currentVariant}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={currentVariant.transition}
                            className="absolute inset-0 w-full h-full"
                        >
                            <img
                                src={images[currentIndex]}
                                alt={`${title} background ${currentIndex}`}
                                className="object-cover w-full h-full"
                            />
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-900"></div>
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div>

            <Container className="relative z-10 py-20">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {sub_title && (
                            <span className="inline-block px-3 py-1 mb-4 text-sm font-bold tracking-wider text-primary-200 uppercase bg-primary-900/40 rounded-full border border-primary-500/30">
                                {sub_title}
                            </span>
                        )}
                        <h1 className="text-4xl font-bold leading-tight text-white lg:text-5xl xl:text-6xl mb-6">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-lg leading-relaxed text-gray-100 lg:text-xl xl:text-2xl opacity-90">
                                {description}
                            </p>
                        )}
                    </motion.div>
                </div>
            </Container>

            {/* Indicators */}
            {!videoUrl && images.length > 1 && (
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-4">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className="group relative flex items-center justify-center w-6 h-6 focus:outline-none"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <div className={`absolute inset-0 rounded-full border-2 border-white transition-all duration-500 scale-100 ${currentIndex === index ? "opacity-100 scale-110" : "opacity-0 scale-50 group-hover:opacity-30"
                                }`} />
                            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${currentIndex === index ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-white/40 group-hover:bg-white/60"
                                }`} />
                        </button>
                    ))}
                </div>
            )}

            {/* Bottom Gradient Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
        </div>
    );
}
