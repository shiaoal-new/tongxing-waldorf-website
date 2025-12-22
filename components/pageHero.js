import Container from "./container";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import BackgroundCarousel from "./backgroundCarousel";
import { ArrowDownIcon } from "@heroicons/react/solid";

export default function PageHero({ data }) {
    const {
        layout,
        header,
        sub_header,
        // Legacy support
        title: legacyTitle,
        sub_title: legacySubTitle,
        description,
        media_list = [],
        bg_images,
        bg_video,
        transition_type = 'fade',
        scrolling_effect = 'fadeToWhite' // none, fadeToDark, fadeToWhite
    } = data;

    const effect = scrolling_effect;

    // Resolve content 
    const effectiveTitle = header || legacyTitle;
    const effectiveSubTitle = sub_header || legacySubTitle;

    // Resolve Layout CSS
    const layoutClasses = layout || {};
    const title_class = layoutClasses.title_class || "text-4xl font-bold leading-brand tracking-brand text-brand-bg lg:text-5xl xl:text-6xl mb-component";
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

    // Determine background color based on effect
    let bgClass = "bg-brand-structural";
    if (effect === 'fadeToDark') bgClass = "bg-black";
    if (effect === 'fadeToWhite') bgClass = "bg-brand-bg";

    return (
        <div ref={ref} className={`relative flex min-h-[100vh] overflow-hidden ${bgClass} ${container_class}`}>
            <motion.div
                className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                style={{ opacity: effect !== 'none' ? bgOpacity : 1 }}
            >
                <BackgroundCarousel
                    media_list={media_list}
                    bg_images={bg_images}
                    bg_video={bg_video}
                    transition_type={transition_type}
                    parallax_ratio={data.parallax_ratio}
                />
            </motion.div>



            <Container className="relative z-10 py-20 flex w-full h-full">
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
                        {description && (
                            <p className={description_class}>
                                {description}
                            </p>
                        )}
                    </motion.div>
                </div>
            </Container>

            <motion.div
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer p-2 rounded-full bg-brand-bg/10 backdrop-blur-sm border border-brand-bg/20 transition-colors duration-300"
                initial={{ opacity: 0.5, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.9 }}
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

