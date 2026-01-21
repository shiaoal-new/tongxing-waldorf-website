import React from "react";
import Image from "next/image";
import { DotLottiePlayer } from "@dotlottie/react-player";
import { MediaItem } from "../../types/content";

// Helper to determine MIME type
const getMimeType = (src: string | undefined): string | undefined => {
    if (!src) return undefined;
    if (src.endsWith('.webm')) return 'video/webm';
    if (src.endsWith('.mp4')) return 'video/mp4';
    return undefined;
};

interface MediaRendererProps {
    media: MediaItem;
    className?: string;
    imgClassName?: string;
}

const MediaRenderer = ({ media, className = "", imgClassName = "" }: MediaRendererProps) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [videoSrc, setVideoSrc] = React.useState<string | undefined>(undefined);

    // Determines the appropriate video source based on screen width
    React.useEffect(() => {
        if (media.type?.toLowerCase() !== 'video') return;

        const mediaQuery = window.matchMedia("(max-width: 768px)");
        const updateSrc = () => {
            const newSrc = (mediaQuery.matches && media.mobileVideo) ? media.mobileVideo : media.video;
            if (newSrc !== videoSrc) {
                setVideoSrc(newSrc);
            }
        };

        updateSrc();

        // Use modern listener if available, fallback to deprecated one for older Safari
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', updateSrc);
            return () => mediaQuery.removeEventListener('change', updateSrc);
        } else {
            mediaQuery.addListener(updateSrc);
            return () => mediaQuery.removeListener(updateSrc);
        }
    }, [media.video, media.mobileVideo, media.type, videoSrc]);

    // Handles video playback logic
    React.useEffect(() => {
        if (media.type?.toLowerCase() === 'video' && videoRef.current && videoSrc) {
            const video = videoRef.current;

            // Ensure video is muted for autoplay
            video.muted = true;
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');

            // Re-load if src changed
            if (video.src !== videoSrc) {
                video.load();
            }

            const attemptPlay = async () => {
                if (!video.paused) return;
                try {
                    await video.play();
                } catch (error) {
                    console.warn("Autoplay was prevented, waiting for interaction:", error);
                }
            };

            // Try playing as soon as we have enough data
            const onCanPlay = () => {
                attemptPlay();
            };

            // Fallback: Try playing on any user interaction with the document
            const onInteraction = () => {
                attemptPlay();
                document.removeEventListener('touchstart', onInteraction);
                document.removeEventListener('click', onInteraction);
            };

            if (video.readyState >= 2) {
                attemptPlay();
            } else {
                video.addEventListener('canplay', onCanPlay);
            }

            document.addEventListener('touchstart', onInteraction, { passive: true });
            document.addEventListener('click', onInteraction, { passive: true });

            return () => {
                video.removeEventListener('canplay', onCanPlay);
                document.removeEventListener('touchstart', onInteraction);
                document.removeEventListener('click', onInteraction);
            };
        }
    }, [videoSrc, media.type]);

    if (!media || !media.type) return null;

    switch (media.type.toLowerCase()) {
        case "image":
            if (!media.image) return null;
            return (
                <div className={`relative overflow-hidden ${className}`}>
                    <Image
                        src={media.image}
                        alt={media.alt || "media image"}
                        fill
                        style={{ objectFit: imgClassName.includes('object-contain') ? 'contain' : 'cover' }}
                        className={imgClassName}
                    />
                </div>
            );

        case "video":
            if (!media.video) return null;
            return (
                <video
                    ref={videoRef}
                    src={videoSrc}
                    // Use transparent pixel as poster to allow background-image to show
                    poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                    className={`object-cover bg-cover bg-center md:bg-[image:var(--desktop-poster)] bg-[image:var(--mobile-poster)] ${className}`}
                    style={{
                        '--desktop-poster': `url(${media.poster})`,
                        '--mobile-poster': `url(${media.mobilePoster || media.poster})`
                    } as React.CSSProperties}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                />
            );

        case "youtube":
            if (!media.url) return null;
            // Simple YouTube ID extractor
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
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            );

        case "lottie":
            if (!media.lottie && !media.url) return null;

            let source = media.lottie || media.url;

            // If it's a lottie.host ID (contains hyphen but not starting with http/slash)
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
