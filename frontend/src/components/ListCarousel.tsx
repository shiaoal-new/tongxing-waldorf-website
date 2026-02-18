import React from 'react';
import { Icon } from '@iconify/react';
import SnapCarousel, { SnapCarouselConfig } from './ui/SnapCarousel';

interface ListCarouselProps {
    items: any[];
    variant?: string;
    renderItem: (item: any, index: number, pagination: { current: number; total: number }) => React.ReactNode;
    loop?: boolean;
    align?: 'center' | 'start';
    highlightActive?: boolean;
    limit?: number;
    appendMore?: boolean;
    buttons?: any[];
}

/**
 * ListCarousel
 * 統一的列表輪播組件
 * 
 * 使用方式：
 * 
 * 1. Spotlight 模式 (預設):
 *    - loop: true
 *    - align: 'center'
 *    - highlightActive: true
 * 
 * 2. Highlight/List 模式:
 *    - loop: false
 *    - align: 'start'
 *    - highlightActive: false
 *    - limit: 5
 *    - appendMore: true
 * 
 * Variants:
 * - default: 480px width (Desktop)
 * - large: 700px width (Desktop)
 * - cinema: 85vw width (Desktop)
 */
export default function ListCarousel({
    items,
    renderItem,
    variant = 'default',
    loop = true,
    align = 'center',
    highlightActive = true,
    limit,
    appendMore = false,
    buttons
}: ListCarouselProps) {

    // 處理項目過濾
    const displayItems = limit ? items.slice(0, limit) : items;
    const hasMoreButton = appendMore && buttons && buttons.length > 0;

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

    const getVariantStyles = (v: string) => {
        switch (v) {
            case 'large':
                return {
                    desktopWidth: '700px',
                    halfWidth: '350px',
                    mediaHeight: '400px',
                    containerGap: '1.5rem'
                };
            case 'cinema':
                return {
                    desktopWidth: '85vw',
                    halfWidth: '42.5vw',
                    mediaHeight: '65vh',
                    containerGap: '2rem'
                };
            default:
                return {
                    desktopWidth: '480px',
                    halfWidth: '240px', // Corrected calculation: 480/2
                    mediaHeight: null,
                    containerGap: '0.75rem'
                };
        }
    };

    const styles = getVariantStyles(variant);

    // 建構 CSS 樣式
    // Center Align: 使用 spacer 技巧來實現置中
    // Start Align: 使用 padding 和 gap

    const centerAlignStyles = `
        .snap-carousel-container {
            display: flex;
            gap: ${styles.containerGap};
            align-items: center;
            padding-left: 0;
            padding-right: 0; 
        }

        .carousel-spacer-start,
        .carousel-spacer-end {
            width: calc(50% - 36vw); 
            flex: 0 0 auto;
        }

        @media (min-width: 640px) {
            .carousel-spacer-start,
            .carousel-spacer-end {
                width: calc(50% - 240px);
            }
        }

        @media (min-width: 1024px) {
            .carousel-spacer-start,
            .carousel-spacer-end {
                    width: calc(50% - ${styles.halfWidth});
            }
        }

        .carousel-spacer-start,
        .carousel-spacer-end {
            scroll-snap-align: none !important;
            scroll-snap-stop: unset !important;
            pointer-events: none;
        }
        
        .snap-carousel-container::before,
        .snap-carousel-container::after {
            display: none;
        }
    `;

    const startAlignStyles = `
        .snap-carousel-container {
            display: flex;
            gap: 1rem;
            padding-left: 1rem;
            padding-right: 1rem;
            align-items: stretch;
        }

        @media (min-width: 640px) {
            .snap-carousel-container {
                gap: 1.5rem;
                padding-left: 2rem;
                padding-right: 2rem;
            }
        }

        @media (min-width: 1024px) {
            .snap-carousel-container {
                gap: 2rem;
            }
        }
    `;

    const config: SnapCarouselConfig = {
        cardClassName: `testimonial-card ${variant}`,
        wrapperClassName: 'testimonial-carousel-wrapper relative px-0 w-full group',
        showNavigation: true,
        showPagination: false,
        navButtonVariant: 'large',
        snapAlign: align,
        clickableCards: true,
        loop: loop,
        // 如果 highlightActive 為真，則應用縮放和灰階效果。否則保持原樣。
        activeCardClassName: highlightActive ? 'active z-10 scale-100 md:scale-100 opacity-100 grayscale-0' : 'opacity-100',
        inactiveCardClassName: highlightActive ? 'scale-95 opacity-60 grayscale-[0.5]' : 'opacity-100',
        containerStyles: `
            ${align === 'center' ? centerAlignStyles : startAlignStyles}

            .testimonial-card {
                scroll-snap-align: ${align};
                scroll-snap-stop: always;
                flex-shrink: 0;
                width: 72vw;
                transition: all 0.5s ease;
                padding: 0;
                cursor: pointer;
            }

            @media (min-width: 640px) {
                .testimonial-card {
                    width: 480px;
                }
            }

            @media (min-width: 1024px) {
                .testimonial-card {
                    width: ${styles.desktopWidth};
                }
                
                ${styles.mediaHeight ? `
                .testimonial-card .feature-media-container {
                    height: ${styles.mediaHeight} !important;
                }
                ` : ''}
            }
        `,
    };

    return (
        <SnapCarousel
            items={displayItems}
            config={config}
            appendContent={viewAllCard}
            renderItem={(item, index, extra) => (
                <div className="h-full w-full">
                    {renderItem(item, index, {
                        current: index + 1,
                        total: extra?.totalItems || displayItems.length,
                    })}
                </div>
            )}
        />
    );
}
