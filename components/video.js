import { useState, useMemo } from "react";
import { videoData } from "./data";

export default function VideoList({ videoList }) {
  const data = videoList || videoData;
  return (
    <div className="grid spacing-component gap-y-16 md:grid-cols-2 lg:grid-cols-3">
      {data.map((video, index) => (
        <VideoItem
          key={index}
          video={video}
          className="md:even:translate-y-12 lg:even:translate-y-0 lg:[&:nth-child(3n+2)]:translate-y-12"
        />
      ))}
    </div>
  );
}

function VideoItem({ video, className }) {
  const [playVideo, setPlayVideo] = useState(false);

  // Generate a random hue rotation value between 0 and 360 degrees
  const randomHue = useMemo(() => Math.floor(Math.random() * 360), []);

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
  const embedUrl = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1` : videoUrl;
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : (mediaData.type === 'image' ? mediaData.image : null);

  return (
    <div
      className={`flex flex-col w-full rounded-xl h-full ${video.className || ''} ${className || ''}`}
      style={{ '--frame-hue': `${randomHue}deg` }}
    >
      <div
        onClick={() => setPlayVideo(!playVideo)}
        className="relative cursor-pointer aspect-w-16 aspect-h-9 bg-gray-200 group"
        style={{
          backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {!playVideo && (
          <>
            {/* Overlay for better text/icon visibility */}
            <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>

            <button className="absolute inset-auto text-brand-bg transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 top-1/2 left-1/2 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
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
              <span className="sr-only">Play Video</span>
            </button>
          </>
        )}
        {playVideo && (
          <iframe
            src={embedUrl}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          ></iframe>
        )}
      </div>
      <div className="p-5 bg-brand-bg dark:bg-trueGray-800 flex-grow border-t dark:border-trueGray-700">
        <h3 className="text-lg font-bold text-brand-text dark:text-brand-bg mb-2 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-brand-taupe dark:text-brand-taupe text-sm line-clamp-4 leading-relaxed">
          {video.description}
        </p>
      </div>
    </div>
  );
}

