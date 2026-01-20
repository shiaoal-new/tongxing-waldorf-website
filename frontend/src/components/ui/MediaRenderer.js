import React from "react";
import Image from "next/image";
import { DotLottiePlayer } from "@dotlottie/react-player";

// Helper to determine MIME type
const getMimeType = (src) => {
    if (!src) return undefined;
    if (src.endsWith('.webm')) return 'video/webm';
    if (src.endsWith('.mp4')) return 'video/mp4';
    return undefined;
};

const MediaRenderer = ({ media, className = "", imgClassName = "" }) => {
    if (!media || !media.type) return null;

    switch (media.type) {
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

        case "Video":
        case "video":
            if (!media.video) return null;
            return (
                <video
                    // Use transparent pixel as poster to allow background-image to show
                    poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                    className={`object-cover bg-cover bg-center md:bg-[image:var(--desktop-poster)] bg-[image:var(--mobile-poster)] ${className}`}
                    style={{
                        '--desktop-poster': `url(${media.poster})`,
                        '--mobile-poster': `url(${media.mobilePoster || media.poster})`
                    }}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                >
                    {media.mobileVideo && (
                        <source
                            src={media.mobileVideo}
                            type={getMimeType(media.mobileVideo)}
                            media="(max-width: 768px)"
                        />
                    )}
                    <source
                        src={media.video}
                        type={getMimeType(media.video)}
                        media={media.mobileVideo ? "(min-width: 769px)" : undefined}
                    />
                </video>
            );

        case "youtube":
            if (!media.url) return null;
            // Simple YouTube ID extractor
            const getYoutubeId = (url) => {
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
                        src={source}
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
