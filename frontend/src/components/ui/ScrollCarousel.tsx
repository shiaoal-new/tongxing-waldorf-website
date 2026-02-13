import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

export interface ScrollCarouselConfig {
    /** CSS class name for the card wrapper */
    cardClassName: string;
    /** CSS class name for the container wrapper */
    wrapperClassName?: string;
    /** Whether to show navigation buttons */
    showNavigation?: boolean;
    /** Whether to show pagination dots */
    showPagination?: boolean;
    /** Custom card styles (JSX CSS) */
    cardStyles?: string;
    /** Custom container styles (JSX CSS) */
    containerStyles?: string;
    /** Navigation button style variant */
    navButtonVariant?: 'default' | 'large';
    /** Snap alignment for cards */
    snapAlign?: 'start' | 'center';
    /** Whether cards should be clickable to scroll to them */
    clickableCards?: boolean;
    /** Custom render for inactive cards (e.g., scale, opacity) */
    inactiveCardClassName?: string;
    /** Custom render for active cards */
    activeCardClassName?: string;
}

interface ScrollCarouselProps {
    items: any[];
    renderItem: (item: any, index: number, extra?: any) => ReactNode;
    config: ScrollCarouselConfig;
    /** Optional extra content to append (e.g., "View All" card) */
    appendContent?: ReactNode;
    /** Callback when active index changes */
    onActiveIndexChange?: (index: number) => void;
}

/**
 * ScrollCarousel - 通用的原生滾動輪播組件
 * 使用 CSS Scroll Snap 實現，支援觸控板/滑鼠滾動
 */
export default function ScrollCarousel({
    items,
    renderItem,
    config,
    appendContent,
    onActiveIndexChange,
}: ScrollCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);

    const {
        cardClassName,
        wrapperClassName = 'py-8 relative w-full group',
        showNavigation = true,
        showPagination = false,
        cardStyles = '',
        containerStyles = '',
        navButtonVariant = 'default',
        snapAlign = 'center',
        clickableCards = false,
        inactiveCardClassName = '',
        activeCardClassName = '',
    } = config;

    // 計算當前活躍的卡片索引
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

        // 更新導航按鈕顯示狀態
        setShowLeftButton(scrollLeft > 10);
        setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);

        // 計算最接近中心/起點的卡片
        const cards = scrollRef.current.querySelectorAll(`.${cardClassName}`);
        if (cards.length === 0) return;

        let closestIndex = 0;
        let minDistance = Number.MAX_VALUE;

        const referencePoint = snapAlign === 'center'
            ? scrollLeft + clientWidth / 2
            : scrollLeft;

        cards.forEach((card, index) => {
            const cardElement = card as HTMLElement;
            const cardPosition = snapAlign === 'center'
                ? cardElement.offsetLeft + cardElement.offsetWidth / 2
                : cardElement.offsetLeft;
            const distance = Math.abs(referencePoint - cardPosition);

            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== activeIndex) {
            setActiveIndex(closestIndex);
            onActiveIndexChange?.(closestIndex);
        }
    };

    // 滾動到指定索引
    const scrollToIndex = (index: number) => {
        if (!scrollRef.current) return;
        const cards = scrollRef.current.querySelectorAll(`.${cardClassName}`);
        if (!cards[index]) return;

        const card = cards[index] as HTMLElement;
        const container = scrollRef.current;

        const scrollLeft = snapAlign === 'center'
            ? card.offsetLeft - (container.clientWidth / 2) + (card.offsetWidth / 2)
            : card.offsetLeft;

        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    };

    // 左右導航
    const handlePrev = () => scrollToIndex(Math.max(0, activeIndex - 1));
    const handleNext = () => scrollToIndex(Math.min(items.length - 1, activeIndex + 1));

    // 初始化滾動監聽
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        // 延遲初始化以確保 layout 完成
        const timer = setTimeout(() => handleScroll(), 100);

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            clearTimeout(timer);
            container.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const totalItems = items.length + (appendContent ? 1 : 0);

    // 導航按鈕樣式
    const navButtonClass = navButtonVariant === 'large'
        ? 'btn btn-circle bg-white/90 dark:bg-black/40 backdrop-blur-sm border-none shadow-xl text-brand-accent hover:bg-brand-accent hover:text-white hover:scale-110 transition-all duration-300'
        : 'w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 shadow-lg backdrop-blur-sm flex items-center justify-center text-brand-text dark:text-brand-bg hover:bg-brand-accent hover:text-white transition-all duration-300';

    const navIconClass = navButtonVariant === 'large' ? 'w-8 h-8' : 'w-6 h-6';

    return (
        <div className={wrapperClassName}>
            {/* 動態樣式 */}
            <style jsx>{`
                .scroll-container {
                    display: flex;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    overscroll-behavior-x: contain;
                }

                .scroll-container::-webkit-scrollbar {
                    display: none;
                }

                ${containerStyles}
                ${cardStyles}
            `}</style>

            {/* 左側導航按鈕 */}
            {showNavigation && showLeftButton && (
                <button
                    onClick={handlePrev}
                    className={`absolute top-1/2 left-4 md:left-8 z-30 -translate-y-1/2 hidden lg:flex ${navButtonClass} ${navButtonVariant === 'default' ? 'opacity-0 group-hover:opacity-100' : ''}`}
                    aria-label="Previous slide"
                >
                    <ChevronLeftIcon className={navIconClass} />
                </button>
            )}

            {/* 右側導航按鈕 */}
            {showNavigation && showRightButton && (
                <button
                    onClick={handleNext}
                    className={`absolute top-1/2 right-4 md:right-8 z-30 -translate-y-1/2 hidden lg:flex ${navButtonClass} ${navButtonVariant === 'default' ? 'opacity-0 group-hover:opacity-100' : ''}`}
                    aria-label="Next slide"
                >
                    <ChevronRightIcon className={navIconClass} />
                </button>
            )}

            {/* 滾動容器 */}
            <div ref={scrollRef} className="scroll-container">
                {items.map((item, index) => {
                    const isActive = index === activeIndex;
                    const cardClass = `${cardClassName} ${isActive ? activeCardClassName : inactiveCardClassName}`;

                    return (
                        <div
                            key={item.id || index}
                            className={cardClass}
                            onClick={clickableCards ? () => scrollToIndex(index) : undefined}
                        >
                            {renderItem(item, index, { isActive, activeIndex, totalItems })}
                        </div>
                    );
                })}

                {/* 附加內容（例如 "View All" 卡片） */}
                {appendContent && <div className={cardClassName}>{appendContent}</div>}
            </div>

            {/* 分頁指示器 */}
            {showPagination && (
                <div className="pagination-dots flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalItems }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToIndex(index)}
                            className={`pagination-dot w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex
                                    ? 'bg-brand-accent w-6'
                                    : 'bg-brand-accent/30'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
