import React from 'react';
import { Icon } from '@iconify/react';
import SnapCarousel, { SnapCarouselConfig } from './ui/SnapCarousel';

interface HighlightCarouselProps {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    buttons?: any[];
}

export default function HighlightCarousel({ items, renderItem, buttons }: HighlightCarouselProps) {
    const displayItems = items.slice(0, 5);
    const hasMoreButton = buttons && buttons.length > 0;

    const config: SnapCarouselConfig = {
        cardClassName: 'highlight-card',
        wrapperClassName: 'highlight-carousel-wrapper relative w-full group overflow-x-hidden',
        showNavigation: true,
        showPagination: true,
        navButtonVariant: 'default',
        snapAlign: 'start',
        clickableCards: false,
        containerStyles: `
            .scroll-container {
                gap: 1rem;
                padding: 0 1rem;
            }

            @media (min-width: 640px) {
                .scroll-container {
                    gap: 1.5rem;
                    padding: 0 2rem;
                }
            }

            @media (min-width: 1024px) {
                .scroll-container {
                    gap: 2rem;
                }
            }
        `,
        cardStyles: `
            .highlight-card {
                scroll-snap-align: center;
                scroll-snap-stop: always;
                flex-shrink: 0;
                width: calc(100vw - 3rem);
                padding: 0;
            }

            @media (min-width: 640px) {
                .highlight-card {
                    scroll-snap-align: start;
                    width: calc(45% - 0.75rem);
                }
            }

            @media (min-width: 1024px) {
                .highlight-card {
                    width: calc(31.25% - 1.33rem);
                }
            }

            @media (min-width: 1280px) {
                .highlight-card {
                    width: calc(25% - 1.5rem);
                }
            }
        `,
    };

    // "View All" 卡片
    const viewAllCard = hasMoreButton ? (
        <div className="h-full transform transition-transform duration-300 hover:-translate-y-2">
            <a
                href={buttons![0].link}
                className="h-full w-full flex flex-col items-center justify-center bg-white/50 dark:bg-white/5 border-2 border-dashed border-brand-accent/30 rounded-3xl group/card hover:bg-brand-accent/5 hover:border-brand-accent hover:shadow-lg transition-all duration-300 gap-4 text-center p-6 cursor-pointer min-h-[300px]"
            >
                <div className="w-20 h-20 rounded-full bg-brand-accent/10 flex items-center justify-center group-hover/card:scale-110 group-hover/card:bg-brand-accent group-hover/card:text-white transition-all duration-300 text-brand-accent">
                    <Icon icon="ph:arrow-right-bold" className="w-10 h-10" />
                </div>
                <span className="text-xl font-bold text-brand-text dark:text-brand-bg group-hover/card:text-brand-accent transition-colors">
                    {buttons![0].text}
                </span>
            </a>
        </div>
    ) : null;

    return (
        <SnapCarousel
            items={displayItems}
            config={config}
            appendContent={viewAllCard}
            renderItem={(item, index) => (
                <div className="h-full transform transition-all duration-300 hover:-translate-y-2">
                    {renderItem(item, index)}
                </div>
            )}
        />
    );
}
