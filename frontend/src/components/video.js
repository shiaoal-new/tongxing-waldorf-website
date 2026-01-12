import { useState, useEffect } from "react";
import DevComment from "./DevComment";

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

  // Initial thumbnail logic: try maxresdefault for YouTube, or use provided image/poster
  const getInitialThumbnail = () => {
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
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

  // Update thumbnail if video prop changes
  useEffect(() => {
    setThumbnailUrl(getInitialThumbnail());
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
      className={`flex flex-col w-full rounded-xl h-full video-mask ${video.className || ''} ${className || ''}`}
    >
      <DevComment text="Video Outer Container (16:9 Aspect Ratio)" />
      {/* Outer container: maintains 16:9 aspect ratio */}

      <div className="video-container relative w-full" style={{ paddingBottom: '56.25%' }}>
        <DevComment text="Video Inner Container & Overlay" />
        {/* Inner container: holds all content */}

        <div
          onClick={handleOpenVideo}
          className="absolute inset-0 cursor-pointer group overflow-hidden"
        >
          <DevComment text="Thumbnail Image with Fallback" />
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={video.title}
              onError={handleThumbError}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}

          <DevComment text="Dark overlay for text/icon visibility" />
          {/* Overlay for better text/icon visibility */}

          <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>

          <button className="btn btn-ghost btn-circle absolute inset-auto text-brand-bg transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 top-1/2 left-1/2 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 drop-shadow-lg"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-5 bg-brand-bg dark:bg-trueGray-800 flex-grow border-t dark:border-trueGray-700">
        <h3 className="text-lg font-bold text-brand-text dark:text-brand-bg mb-2 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-brand-taupe dark:text-brand-taupe text-sm line-clamp-4 leading-relaxed">
          {video.content}
        </p>
      </div>
    </div>
  );
}


