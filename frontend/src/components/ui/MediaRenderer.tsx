import React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { MediaItem } from "../../types/content";
import { getOptimizedUrl, isImageKitPath } from "../../lib/media";

const DotLottiePlayer = dynamic(
    () => import("@dotlottie/react-player").then((mod) => mod.DotLottiePlayer),
    { ssr: false }
);

interface MediaRendererProps {
    media: MediaItem;
    className?: string;
    imgClassName?: string;
    priority?: boolean;
    sizes?: string;
}

const MediaRenderer = ({
    media,
    className = "",
    imgClassName = "",
    priority = false,
    sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: MediaRendererProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [isMobile, setIsMobile] = React.useState(false);
    const [shouldLoad, setShouldLoad] = React.useState(priority);

    // Determines the appropriate video and poster source based on screen width
    React.useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        const updateState = () => setIsMobile(mediaQuery.matches);
        updateState();

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', updateState);
            return () => mediaQuery.removeEventListener('change', updateState);
        } else {
            mediaQuery.addListener(updateState);
            return () => mediaQuery.removeListener(updateState);
        }
    }, []);

    // Use IntersectionObserver to lazy load media when not priority
    React.useEffect(() => {
        if (priority || shouldLoad) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // Start loading when media is within 300px of viewport
                    if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight + 300) {
                        setShouldLoad(true);
                        observer.disconnect();
                    }
                });
            },
            { rootMargin: "300px" }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [priority, shouldLoad]);

    if (!media || !media.type) return null;

    const commonImageStyles: React.CSSProperties = {
        objectFit: imgClassName.includes('object-contain') ? 'contain' : 'cover'
    };

    let content = null;

    switch (media.type.toLowerCase()) {
        case "image":
            if (!media.image) break;
            const imageUrl = getOptimizedUrl(media.image, "f-auto,q-80");
            content = shouldLoad && (
                <Image
                    src={imageUrl!}
                    alt={media.alt || "media image"}
                    fill
                    sizes={sizes}
                    priority={priority}
                    loading={priority ? "eager" : "lazy"}
                    // @ts-ignore
                    fetchpriority={priority ? "high" : "low"}
                    style={commonImageStyles}
                    className={imgClassName}
                    unoptimized={isImageKitPath(media.image)}
                />
            );
            break;

        case "video":
            if (!media.video) break;
            const desktopTransform = "tr:q-80";
            const mobileTransform = "tr:w-720,ar-9-16,fo-auto";
            const desktopVideoUrl = getOptimizedUrl(media.video, desktopTransform);
            const mobileRawVideoPath = media.mobileVideo || media.video;
            const mobileVideoUrl = getOptimizedUrl(mobileRawVideoPath, mobileTransform);
            const activeTransform = isMobile ? mobileTransform : desktopTransform;
            const rawPosterPath = isMobile ? (media.mobilePoster || media.poster) : media.poster;
            const posterUrl = getOptimizedUrl(rawPosterPath, activeTransform.replace("tr:", "tr:so-1,"));

            content = (
                <video
                    ref={videoRef}
                    poster={posterUrl}
                    className={`object-cover ${className} w-full h-full`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload={priority ? "auto" : "metadata"}
                >
                    {shouldLoad && (
                        <>
                            {media.mobileVideo && <source src={mobileVideoUrl} media="(max-width: 768px)" />}
                            <source src={desktopVideoUrl} />
                        </>
                    )}
                </video>
            );
            break;

        case "youtube":
            if (!media.url) break;
            const getYoutubeId = (url: string) => {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : url;
            };
            const videoId = getYoutubeId(media.url);
            content = shouldLoad && (
                <div className={`aspect-video w-full ${className}`}>
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1`}
                        className="w-full h-full"
                        frameBorder="0"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            );
            break;

        case "lottie":
            if (!media.lottie && !media.url) break;
            let source = media.lottie || media.url;
            if (source && typeof source === 'string' && !source.startsWith('/') && !source.startsWith('http') && source.includes('-')) {
                source = `https://lottie.host/${source}.lottie`;
            }
            content = shouldLoad && (
                <div className={`${className}`}>
                    <DotLottiePlayer
                        src={source!}
                        autoplay
                        loop
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            );
            break;

        default:
            return null;
    }

    // Video self-load/play logic
    React.useEffect(() => {
        const video = videoRef.current;
        if (shouldLoad && video && video.paused) {
            video.load();
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => { });
            }
        }
    }, [shouldLoad]);

    return (
        <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
            {content}
        </div>
    );
};

export default MediaRenderer;
