import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import MediaRenderer from "../ui/MediaRenderer";
import { MediaItem, CTAButton } from "../../types/content";
import StaggeredReveal from "../ui/StaggeredReveal";

interface FeatureItemProps {
  span?: number;
  media?: MediaItem;
  title: string;
  children: string;
  icon: string;
  buttons?: CTAButton[];
  align?: 'left' | 'center' | 'right';
  sub_items?: {
    title: string;
    content: string;
    icon?: string;
    buttons?: CTAButton[];
  }[];
}

export default function FeatureItem({ span, media, title, children, icon, buttons, align = 'left', sub_items }: FeatureItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFullWidth = span === 12;

  const cardClasses = `feature-card group h-full cursor-pointer hover:shadow-xl transition-all duration-500 ${isFullWidth ? 'flex-col md:flex-row' : 'flex-col'} ${align === 'center' ? 'items-center text-center' : 'items-start text-left'}`;

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      {/* Decorative inner glow & glass reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none z-20" />

      {/* Media Support with sophisticated masking */}
      {media && (
        <div className={`relative ${isFullWidth ? 'w-full md:w-1/2 h-72 md:h-auto md:self-stretch' : 'w-full h-56 md:h-64'} overflow-hidden`}>
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
            imgClassName="object-cover transition-transform duration-[2000ms] group-hover:scale-105 ease-out"
          />
        </div>
      )}

      <div className={`relative z-20 flex flex-col px-6 py-8 md:px-10 md:py-10 ${isFullWidth ? 'w-full md:w-1/2 justify-center' : `w-full ${media ? '-mt-16 md:-mt-20' : ''}`} ${align === 'center' ? 'items-center' : 'items-start'}`}>
        <div className="feature-icon-container flex items-center justify-center flex-shrink-0 mb-6 w-14 h-14 rounded-2xl bg-brand-accent/10 text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-all duration-500 ease-out">
          <Icon icon={icon} className="w-7 h-7" />
        </div>

        <StaggeredReveal
          title={title}
          content={children}
          buttons={buttons}
          align={align}
          isNested={true}
          expanded={isExpanded}
          onToggle={setIsExpanded}
          disableExpand={!(sub_items && sub_items.length > 0)}
          variant={sub_items && sub_items.length > 0 ? "minimal" : "default"}
          expandText={sub_items && sub_items.length > 0 ? "展開了解更多" : "展開"}
          className="w-full"
        />

        {/* Sub Items - 更好地呈現深入內容 */}
        {sub_items && sub_items.length > 0 && (
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
            className="overflow-hidden w-full"
          >
            <div className="pt-8 space-y-4 border-t border-brand-accent/10 mt-6">
              <label className="text-[10px] font-bold text-brand-accent uppercase tracking-[0.2em] mb-4 block">深入探索</label>
              <div className="grid grid-cols-1 gap-4">
                {sub_items.map((sub, idx) => {
                  const hasLink = sub.buttons && sub.buttons.length > 0 && sub.buttons[0].link;
                  const itemContent = (
                    <div className="flex items-start gap-4">
                      {sub.icon && (
                        <div className="mt-1 text-brand-accent group-hover/sub:scale-110 transition-transform duration-300">
                          <Icon icon={sub.icon} className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-grow">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-bold text-brand-text dark:text-brand-bg group-hover/sub:text-brand-accent transition-colors">
                            {sub.title}
                          </h4>
                          {hasLink && (
                            <Icon
                              icon="lucide:arrow-up-right"
                              className="w-4 h-4 text-brand-accent opacity-0 -translate-y-1 translate-x-1 group-hover/sub:opacity-100 group-hover/sub:translate-y-0 group-hover/sub:translate-x-0 transition-all duration-300"
                            />
                          )}
                        </div>
                        <p className="text-xs text-brand-taupe leading-relaxed">
                          {sub.content}
                        </p>
                        {hasLink && (
                          <div className="mt-2 text-[10px] font-bold text-brand-accent/80 flex items-center gap-1 group-hover/sub:text-brand-accent transition-colors">
                            <span>探索詳細教學脈絡</span>
                            <span className="w-4 h-[1px] bg-brand-accent/30 group-hover/sub:w-8 transition-all duration-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  );

                  return (
                    <div key={idx} className="relative group/sub">
                      {hasLink ? (
                        <a
                          href={sub.buttons![0].link}
                          className="block bg-white/40 dark:bg-white/5 p-5 rounded-2xl border border-brand-accent/5 hover:border-brand-accent/30 hover:bg-brand-accent/[0.02] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                        >
                          {itemContent}
                        </a>
                      ) : (
                        <div className="bg-white/50 dark:bg-white/5 p-5 rounded-2xl border border-brand-accent/5">
                          {itemContent}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* Extreme hover shadow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 shadow-[0_45px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_45px_100px_-20px_rgba(255,255,255,0.03)] pointer-events-none" />
    </div>
  );
}
