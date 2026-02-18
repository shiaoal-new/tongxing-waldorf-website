import React from 'react';
import SnapCarousel, { SnapCarouselConfig } from './ui/SnapCarousel';

interface SpotlightCarouselProps {
    items: any[];
    renderItem: (item: any, index: number, pagination: { current: number; total: number }) => React.ReactNode;
}

/**
 * SpotlightCarousel
 * 專為見證設計的輪播組件，具有置中放大的視覺效果
 */
export default function SpotlightCarousel({ items, renderItem }: SpotlightCarouselProps) {
    const config: SnapCarouselConfig = {
        cardClassName: 'testimonial-card',
        wrapperClassName: 'testimonial-carousel-wrapper relative px-0 w-full group overflow-x-hidden',
        showNavigation: true,
        showPagination: false,
        navButtonVariant: 'large',
        snapAlign: 'center',
        clickableCards: true,
        loop: true, // 啟用無限循環
        activeCardClassName: 'active z-10 scale-100 md:scale-110 opacity-100 grayscale-0',
        inactiveCardClassName: 'scale-90 opacity-60 grayscale-[0.5]',
        containerStyles: `
            .snap-carousel-container {
                display: flex;
                gap: 0.75rem; /* 縮小間距讓側邊卡片更靠攏 */
                align-items: center;
                padding: 0; 
            }

            /* 關鍵修復：使用 50% 基準確保完美置中 */
            /* 寬度計算：一半容器寬度 - 一半卡片寬度 */
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
                     width: calc(50% - 320px);
                }
            }

            /* 強制移除 Spacer 的吸附屬性，避免干擾第一張卡片 */
            .carousel-spacer-start,
            .carousel-spacer-end {
                scroll-snap-align: none !important;
                scroll-snap-stop: unset !important;
                pointer-events: none;
            }
            
            /* 隱藏偽元素如果 SnapCarousel 預設有 */
            .snap-carousel-container::before,
            .snap-carousel-container::after {
                display: none;
            }
        `,
        cardStyles: `
            .testimonial-card {
                scroll-snap-align: center;
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
                    width: 480px;
                }
            }
        `,
    };

    return (
        <SnapCarousel
            items={items}
            config={config}
            renderItem={(item, index, extra) => (
                <div className="h-full w-full">
                    {renderItem(item, index, {
                        current: index + 1,
                        total: extra?.totalItems || items.length,
                    })}
                </div>
            )}
        />
    );
}
