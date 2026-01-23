import { useState, useEffect } from "react";
import Image from "next/image";
import DevComment from "./ui/DevComment";

export default function VideoItem({ video, className }) {

  // Normalize media data
  const mediaData = video.media || { type: 'youtube', url: video.url || video.video_url };
  const videoUrl = mediaData.url || mediaData.video;

  // Helper function to extract YouTube Video ID
  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(videoUrl);

  // Initial thumbnail logic
  const getInitialThumbnail = () => {
    if (videoId) {
      // On mobile, use hqdefault (480x360) to save bandwidth.
      // On desktop, use maxresdefault (1280x720).
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      return `https://img.youtube.com/vi/${videoId}/${isMobile ? 'hqdefault' : 'maxresdefault'}.jpg`;
    }
    if (mediaData.type === 'image') return mediaData.image;
    if (mediaData.poster) return mediaData.poster;
    return null;
  };

  const [thumbnailUrl, setThumbnailUrl] = useState(getInitialThumbnail());

  // Fallback if maxresdefault fails (often happens for older or low-res videos)
  const handleThumbError = () => {
    if (videoId && thumbnailUrl.includes('maxresdefault')) {
      setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
    }
  };

  // Update thumbnail if video prop changes or window resizes
  useEffect(() => {
    setThumbnailUrl(getInitialThumbnail());

    // Add resize listener to update thumbnail if screen orientation/size changes
    const handleResize = () => {
      const newThumb = getInitialThumbnail();
      setThumbnailUrl(prev => prev !== newThumb ? newThumb : prev);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [videoId, mediaData.image, mediaData.poster]);

  // Use the canonical YouTube URL for social sharing/viewing if it's a YouTube video
  const externalUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : videoUrl;

  const handleOpenVideo = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={`
        video-mask group relative flex flex-col h-full overflow-hidden 
        bg-white/40 dark:bg-black/20 backdrop-blur-md 
        rounded-[2rem] md:rounded-[2.5rem] border border-white/20 dark:border-white/5 
        shadow-sm hover:shadow-2xl transition-all duration-500 ease-out
        ${video.className || ''} ${className || ''}
      `}
    >
      <DevComment text="Video Thumbnail Area" />
      <div className="video-container relative w-full overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        <div
          onClick={handleOpenVideo}
          className="absolute inset-0 cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-500" />

          {thumbnailUrl && (
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={thumbnailUrl}
                alt={video.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                onError={handleThumbError}
                unoptimized={thumbnailUrl.startsWith('http')}
              />
            </div>
          )}

          {/* Premium Play Button */}
          <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center shadow-lg transform group-hover:rotate-[360deg] transition-transform duration-700">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-white font-bold text-sm bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                立即觀看
              </span>
            </div>
          </div>

          {/* Minimal Play Icon (Standby) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-brand-accent ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow relative">
        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <h3 className="text-xl md:text-2xl font-bold text-brand-text dark:text-brand-bg mb-4 leading-tight">
            {video.title}
          </h3>
          <p className="text-brand-taupe dark:text-brand-taupe/80 text-base leading-relaxed line-clamp-3">
            {video.content}
          </p>
        </div>
      </div>
    </div>
  );
}


