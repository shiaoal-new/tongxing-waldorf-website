import Container from "./container";
import { motion } from "framer-motion";
import { useRef } from "react";
import BackgroundCarousel from "./backgroundCarousel";

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
        transition_type = 'fade'
    } = data;

    // Resolve content 
    const effectiveTitle = header || legacyTitle;
    const effectiveSubTitle = sub_header || legacySubTitle;

    // Resolve Layout CSS
    const layoutClasses = layout || {};
    const title_class = layoutClasses.title_class || "text-4xl font-bold leading-tight text-white lg:text-5xl xl:text-6xl mb-6";
    const pretitle_class = layoutClasses.pretitle_class || "inline-block px-3 py-1 mb-4 text-sm font-bold tracking-wider text-primary-200 uppercase bg-primary-900/40 rounded-full border border-primary-500/30";
    const description_class = layoutClasses.description_class || "text-lg leading-relaxed text-gray-100 lg:text-xl xl:text-2xl opacity-90";
    const wrapper_class = layoutClasses.wrapper_class || "max-w-3xl text-center";
    const container_class = layoutClasses.container_class || "items-center justify-center";
    const ref = useRef(null);

    return (
        <div ref={ref} className={`relative flex min-h-[100vh] overflow-hidden bg-gray-900 ${container_class}`}>
            <BackgroundCarousel
                media_list={media_list}
                bg_images={bg_images}
                bg_video={bg_video}
                transition_type={transition_type}
                parallax_ratio={data.parallax_ratio}
            />

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

        </div>
    );
}
