import React, { useState } from "react";
import { Icon } from "@iconify/react";
import ActionButtons from "../ui/ActionButtons";

import MediaRenderer from "../ui/MediaRenderer";
import ExpandableText from "../ui/ExpandableText";
import { MediaItem, CTAButton } from "../../types/content";

interface FeatureItemProps {
  span?: number;
  media?: MediaItem;
  title: string;
  children: string;
  icon: string;
  buttons?: CTAButton[];
  align?: 'left' | 'center' | 'right';
}

export default function FeatureItem({ span, media, title, children, icon, buttons, align = 'left' }: FeatureItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFullWidth = span === 12;

  const cardClasses = `feature-card group ${isFullWidth ? 'flex-col md:flex-row' : 'flex-col'} ${align === 'center' ? 'items-center text-center' : 'items-start text-left'}`;

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      {/* Decorative inner glow & glass reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none z-20" />

      {/* Media Support with sophisticated masking */}
      {media && (
        <div className={`relative ${isFullWidth ? 'w-full md:w-1/2 h-72 md:h-auto' : 'w-full h-56 md:h-64'} overflow-hidden`}>
          <div className={`absolute inset-0 z-10 bg-gradient-to-t md:bg-gradient-to-r ${isFullWidth ? 'from-white/80 via-white/20 to-transparent dark:from-black/80 dark:via-black/20' : 'from-white/80 via-white/20 to-transparent dark:from-black/80 dark:via-black/20'}`} />
          <MediaRenderer
            media={media as any}
            className="w-full h-full"
            sizes={
              span === 12
                ? "(max-width: 768px) 100vw, 50vw"
                : span === 8
                  ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 66vw"
                  : span === 6
                    ? "(max-width: 768px) 100vw, 50vw"
                    : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            imgClassName="object-cover transition-transform duration-[2000ms] group-hover:scale-110 ease-out"
          />
        </div>
      )}

      <div className={`relative z-20 flex flex-col px-8 pt-8 pb-8 md:px-12 md:pt-12 md:pb-12 ${isFullWidth ? 'w-full md:w-1/2 justify-center' : `w-full ${media ? '-mt-20 md:-mt-24' : ''}`} ${align === 'center' ? 'items-center' : 'items-start'}`}>
        <div className="feature-icon-container flex items-center justify-center flex-shrink-0 mb-6 w-16 h-16 rounded-full text-brand-accent group-hover:scale-110 group-hover:text-white transition-all duration-700 ease-out">
          <Icon icon={icon} className="w-8 h-8" />
        </div>

        <div className="flex flex-col">
          <h3 className="text-2xl md:text-3xl font-bold text-brand-text dark:text-brand-bg leading-tight mb-4 tracking-tight group-hover:text-brand-accent transition-colors duration-500">
            {title}
          </h3>
          <div className="text-brand-taupe dark:text-brand-taupe/90 leading-relaxed text-lg md:text-xl font-medium opacity-80 group-hover:opacity-100 transition-opacity duration-500">
            <ExpandableText
              content={children}
              collapsedHeight={220}

              expanded={isExpanded}
              onToggle={setIsExpanded}
            />

          </div>
        </div>

        {buttons && buttons.length > 0 && (
          <div
            className="mt-10 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100"
            onClick={(e) => e.stopPropagation()}
          >
            <ActionButtons buttons={buttons} align={align} size="sm" />
          </div>
        )}
      </div>

      {/* Extreme hover shadow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 shadow-[0_45px_100px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_45px_100px_-20px_rgba(255,255,255,0.05)] pointer-events-none" />

    </div>
  );
}
