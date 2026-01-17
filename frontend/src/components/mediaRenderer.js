import React from "react";
import Image from "next/image";
import { DotLottiePlayer } from "@dotlottie/react-player";

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
                    src={media.video}
                    poster={media.poster}
                    className={`object-cover ${className}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                />
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
