import Container from "./container";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function PageHero({ data }) {
    const { title, sub_title, description, bg_image, bg_video } = data;
    const ref = useRef(null);
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 200]);

    const getImagePath = (path) => {
        if (!path) return path;
        if (path.startsWith('./')) {
            return path.substring(1);
        }
        return path;
    };

    const imageUrl = getImagePath(bg_image);
    const videoUrl = getImagePath(bg_video);

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
                ) : imageUrl ? (
                    <motion.img
                        style={{ y }}
                        src={imageUrl}
                        alt={title}
                        className="object-cover w-full h-full"
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.1 }}
                        transition={{ duration: 5, ease: "easeOut" }}
                    />
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

            {/* Bottom Gradient Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
        </div>
    );
}
