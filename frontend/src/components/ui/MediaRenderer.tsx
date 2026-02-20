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

    // Use IntersectionObserver to lazy load video when not priority
    React.useEffect(() => {
        if (priority || shouldLoad) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // Start loading when video is within 200px of viewport
                    if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight + 200) {
                        setShouldLoad(true);
                        observer.disconnect();
                    }
                });
            },
            { rootMargin: "200px" }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, [priority, shouldLoad]);

    if (!media || !media.type) return null;

    const commonImageStyles: React.CSSProperties = {
        objectFit: imgClassName.includes('object-contain') ? 'contain' : 'cover'
    };

    switch (media.type.toLowerCase()) {
        case "image":
            if (!media.image) return null;

            // Generate optimized URL (getOptimizedUrl now handles ik: prefix internally)
            const imageUrl = getOptimizedUrl(media.image, "f-auto,q-80");

            return (
                <div className={`relative overflow-hidden ${className}`}>
                    <Image
                        src={imageUrl!}
                        alt={media.alt || "media image"}
                        fill
                        sizes={sizes}
                        priority={priority}
                        style={commonImageStyles}
                        className={imgClassName}
                        unoptimized={isImageKitPath(media.image)} // Let ImageKit handle optimization if it's an ik: path
                    />
                </div>
            );

        case "video":
            if (!media.video) return null;

            // Prepare optimized URLs for both mobile and desktop
            // This allows us to use responsive <source> tags which prevent double-loading on initial page load
            const desktopTransform = "tr:q-80";
            const mobileTransform = "tr:w-720,ar-9-16,fo-auto";

            const desktopVideoUrl = getOptimizedUrl(media.video, desktopTransform);
            const mobileRawVideoPath = media.mobileVideo || media.video;
            const mobileVideoUrl = getOptimizedUrl(mobileRawVideoPath, mobileTransform);

            // Handle Poster (Reactive to isMobile to update the attribute if needed)
            const activeTransform = isMobile ? mobileTransform : desktopTransform;
            const rawPosterPath = isMobile ? (media.mobilePoster || media.poster) : media.poster;
            const posterUrl = getOptimizedUrl(
                rawPosterPath,
                activeTransform.replace("tr:", "tr:so-1,")
            );

            // Trigger video load and play when shouldLoad becomes true
            React.useEffect(() => {
                const video = videoRef.current;
                if (shouldLoad && video && video.paused) {
                    video.load();
                    // Explicitly call play() to ensure it starts as soon as data arrives
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => {
                            // Autoplay was prevented, but at least the video is primed
                        });
                    }
                }
            }, [shouldLoad]);

            return (
                <video
                    ref={videoRef}
                    poster={posterUrl}
                    className={`object-cover ${className} w-full h-full`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    // Change: Use "metadata" instead of "none" to let browser check headers early
                    // This allows the browser to know the video is streamable via our faststart fix
                    preload={priority ? "auto" : "metadata"}
                >
                    {/* Always render sources to help browser state machine, only set URL when needed */}
                    {media.mobileVideo && (
                        <source
                            src={shouldLoad ? mobileVideoUrl : ""}
                            media="(max-width: 768px)"
                        />
                    )}
                    <source
                        src={shouldLoad ? desktopVideoUrl : ""}
                    />
                </video>
            );

        case "youtube":
            if (!media.url) return null;
            const getYoutubeId = (url: string) => {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : url;
            };
            const videoId = getYoutubeId(media.url);
            return (
                <div className={`aspect-video w-full ${className}`}>
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1`}
                        className="w-full h-full"
                        frameBorder="0"
                        loading={priority ? "eager" : "lazy"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            );

        case "lottie":
            if (!media.lottie && !media.url) return null;
            let source = media.lottie || media.url;
            if (source && typeof source === 'string' && !source.startsWith('/') && !source.startsWith('http') && source.includes('-')) {
                source = `https://lottie.host/${source}.lottie`;
            }
            return (
                <div className={`${className}`}>
                    <DotLottiePlayer
                        src={source!}
                        autoplay
                        loop
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            );

        default:
            return null;
    }
};

export default MediaRenderer;
