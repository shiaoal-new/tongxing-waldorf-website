import React from "react";
import Image from "next/image";

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

        case "video":
            if (!media.video) return null;
            return (
                <video
                    src={media.video}
                    className={`w-full h-full object-cover ${className}`}
                    autoPlay
                    loop
                    muted
                    playsInline
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
            if (!media.url) return null;

            let lottieId = media.url;


            if (lottieId) {
                return (
                    <div className={`w-full h-full ${className}`}>
                        <iframe
                            src={`https://lottie.host/embed/${lottieId}.lottie`}
                            className="w-full h-full"
                            frameBorder="0"
                        ></iframe>
                    </div>
                );
            }

            // Fallback for invalid lottie data
            return (
                <div className={`w-full h-full flex items-center justify-center ${className}`}>
                    <p className="text-xs text-gray-400">Lottie Anim: {media.url}</p>
                </div>
            );

        default:
            return null;
    }
};

export default MediaRenderer;
