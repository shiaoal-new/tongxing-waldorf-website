import React from "react";
import { Icon } from "@iconify/react";
import ActionButtons from "./actionButtons";

import MediaRenderer from "./mediaRenderer";
import ExpandableText from "./expandableText";

export default function BenefitItem(props) {
  const { span, media, title, children, icon, buttons } = props;

  // Bento-style card classes
  const cardClasses = `
    group relative flex flex-col h-full overflow-hidden
    bg-white/40 dark:bg-black/20 backdrop-blur-md 
    rounded-[2.5rem] border border-white/20 dark:border-white/5 
    shadow-sm hover:shadow-2xl hover:-translate-y-1
    transition-all duration-700 ease-out
  `;

  const hasImage = media && media.type === 'image';

  return (
    <div className={cardClasses}>
      {/* Decorative inner glow & glass reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none z-20" />

      {/* Top Media Support with sophisticated masking */}
      {media && (
        <div className={`relative w-full ${span === 12 ? 'h-72 md:h-96' : 'h-56 md:h-64'} overflow-hidden`}>
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-white/80 via-white/20 to-transparent dark:from-black/80 dark:via-black/20" />
          <MediaRenderer
            media={media}
            className="w-full h-full"
            imgClassName="object-cover transition-transform duration-[2000ms] group-hover:scale-110 ease-out"
          />
        </div>
      )}

      <div className={`relative z-20 flex flex-col h-full p-8 md:p-12 ${media ? '-mt-20 md:-mt-24' : ''}`}>
        <div className="benefit-icon-container flex items-center justify-center flex-shrink-0 mb-8 w-16 h-16 bg-brand-accent/20 rounded-[1.25rem] text-brand-accent shadow-xl shadow-brand-accent/10 group-hover:scale-110 group-hover:bg-brand-accent group-hover:text-white transition-all duration-700 ease-out backdrop-blur-md ring-1 ring-white/30">
          <Icon icon={icon} className="w-8 h-8" />
        </div>

        <div className="flex-grow">
          <h4 className="text-2xl md:text-3xl font-bold text-brand-text dark:text-brand-bg leading-tight mb-5 tracking-tight group-hover:text-brand-accent transition-colors duration-500">
            {title}
          </h4>
          <div className="text-brand-taupe dark:text-brand-taupe/90 leading-relaxed text-lg md:text-xl font-medium opacity-80 group-hover:opacity-100 transition-opacity duration-500">
            <ExpandableText content={children} collapsedHeight={100} />
          </div>
        </div>

        {buttons && buttons.length > 0 && (
          <div className="mt-10 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100">
            <ActionButtons buttons={buttons} align="left" size="sm" />
          </div>
        )}
      </div>

      {/* Extreme hover shadow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 shadow-[0_45px_100px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_45px_100px_-20px_rgba(255,255,255,0.05)] pointer-events-none" />
    </div>
  );
}
