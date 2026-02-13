import React from 'react';
import ScrollCarousel, { ScrollCarouselConfig } from './ui/ScrollCarousel';

interface TestimonialSwiperProps {
    items: any[];
    renderItem: (item: any, index: number, pagination: { current: number; total: number }) => React.ReactNode;
}

/**
 * TestimonialSwiper
 * 專為見證設計的輪播組件，具有置中放大的視覺效果
 */
export default function TestimonialSwiper({ items, renderItem }: TestimonialSwiperProps) {
    const config: ScrollCarouselConfig = {
        cardClassName: 'testimonial-card',
        wrapperClassName: 'testimonial-swiper-wrapper py-6 md:py-16 relative px-0 w-full group',
        showNavigation: true,
        showPagination: false,
        navButtonVariant: 'large',
        snapAlign: 'center',
        clickableCards: true,
        activeCardClassName: 'active z-10 scale-100 md:scale-110 opacity-100 grayscale-0',
        inactiveCardClassName: 'scale-90 opacity-60 grayscale-[0.5]',
        containerStyles: `
            .scroll-container {
                gap: 1rem;
                padding: 2rem 0;
                align-items: center;
            }

            /* 為了讓第一項和最後一項能置中，添加 spacer */
            .scroll-container::before,
            .scroll-container::after {
                content: '';
                flex: 0 0 auto;
                width: calc((100vw - 75vw) / 2);
            }

            @media (min-width: 640px) {
                .scroll-container::before,
                .scroll-container::after {
                    width: calc((100vw - 520px) / 2);
                }
            }

            @media (min-width: 1024px) {
                .scroll-container::before,
                .scroll-container::after {
                    width: calc((100vw - 700px) / 2);
                }
            }
        `,
        cardStyles: `
            .testimonial-card {
                scroll-snap-align: center;
                scroll-snap-stop: always;
                flex-shrink: 0;
                width: 75vw;
                transition: all 0.5s ease;
                padding: 2.5rem 0;
                cursor: pointer;
            }

            @media (min-width: 640px) {
                .testimonial-card {
                    width: 520px;
                }
            }

            @media (min-width: 1024px) {
                .testimonial-card {
                    width: 700px;
                }
            }
        `,
    };

    return (
        <ScrollCarousel
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
