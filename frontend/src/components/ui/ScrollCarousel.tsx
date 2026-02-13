import React, { useRef, useState, useEffect, ReactNode, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

export interface ScrollCarouselConfig {
    cardClassName: string;
    wrapperClassName?: string;
    showNavigation?: boolean;
    showPagination?: boolean;
    cardStyles?: string;
    containerStyles?: string;
    navButtonVariant?: 'default' | 'large';
    snapAlign?: 'start' | 'center';
    clickableCards?: boolean;
    inactiveCardClassName?: string;
    activeCardClassName?: string;
    /** Enable infinite loop scrolling */
    loop?: boolean;
}

interface ScrollCarouselProps {
    items: any[];
    renderItem: (item: any, index: number, extra?: any) => ReactNode;
    config: ScrollCarouselConfig;
    appendContent?: ReactNode;
    onActiveIndexChange?: (index: number) => void;
}

export default function ScrollCarousel({
    items,
    renderItem,
    config,
    appendContent,
    onActiveIndexChange,
}: ScrollCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoopReady, setIsLoopReady] = useState(false);

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
        loop = false,
    } = config;

    // 只有當 loop 為 true 且 items 足夠多時才啟用 loop
    const enableLoop = loop && items.length > 1;
    // 複製數量：前後各複製2個已足夠覆蓋大部分螢幕寬度（對於寬卡片）
    const cloneCount = enableLoop ? 2 : 0;

    // 準備渲染清單：[Tail Clones] + [Original] + [Head Clones]
    // 注意：Tail Clones 是 items 的最後幾個放到最前面
    const renderList = enableLoop
        ? [
            ...items.slice(-cloneCount), // Clone End (放到前面)
            ...items,                    // Real
            ...items.slice(0, cloneCount)// Clone Start (放到後面)
        ]
        : items;

    // 將渲染索引映射回真實數據索引
    const getRealIndex = (renderIndex: number) => {
        if (!enableLoop) return renderIndex;
        // renderIndex 0 是 clone 的倒數第2個
        // 真實的第一個 item 在 index = cloneCount
        let realIndex = renderIndex - cloneCount;

        if (realIndex < 0) {
            realIndex = items.length + realIndex;
        } else if (realIndex >= items.length) {
            realIndex = realIndex - items.length;
        }
        return realIndex;
    };

    const totalRealItems = items.length + (appendContent && !enableLoop ? 1 : 0);

    const scrollToIndex = useCallback((index: number, immediate = false) => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const cards = container.querySelectorAll(`.${cardClassName}`);

        // 對於 Loop 模式，我們操作的 index 是渲染列表的 index
        // 但是傳入的 index 通常是「邏輯」index，這需要轉換嗎？
        // 為了簡單，內部方法 scrollToIndex 接受的是「渲染列表」的絕對 index

        if (!cards[index]) return;
        const card = cards[index] as HTMLElement;

        const scrollLeft = snapAlign === 'center'
            ? card.offsetLeft - (container.clientWidth / 2) + (card.offsetWidth / 2)
            : card.offsetLeft;

        container.scrollTo({
            left: scrollLeft,
            behavior: immediate ? 'auto' : 'smooth'
        });
    }, [cardClassName, snapAlign]);

    // 初始化 Loop 位置
    useEffect(() => {
        if (enableLoop && scrollRef.current && !isLoopReady) {
            // 瞬間跳轉到真實的第一個項目 (跳過前面的 clones)
            // 稍微延遲以確保 DOM 渲染完畢
            setTimeout(() => {
                scrollToIndex(cloneCount, true);
                setIsLoopReady(true);
            }, 50); // 對於部分手機可能需要更長一點點
        }
    }, [enableLoop, cloneCount, scrollToIndex, isLoopReady]);


    const handleScroll = () => {
        const container = scrollRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const containerCenter = snapAlign === 'center'
            ? containerRect.left + containerRect.width / 2
            : containerRect.left;

        const cards = container.querySelectorAll(`.${cardClassName}`);
        if (cards.length === 0) return;

        let closestRenderIndex = 0;
        let minDistance = Number.MAX_VALUE;

        cards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = snapAlign === 'center'
                ? cardRect.left + cardRect.width / 2
                : cardRect.left;

            const distance = Math.abs(containerCenter - cardCenter);
            if (distance < minDistance) {
                minDistance = distance;
                closestRenderIndex = index;
            }
        });

        const realActiveIndex = getRealIndex(closestRenderIndex);
        if (realActiveIndex !== activeIndex) {
            setActiveIndex(realActiveIndex);
            onActiveIndexChange?.(realActiveIndex);
        }
    };

    // 為了處理 Loop 跳轉，我们需要監聽 scroll end
    useEffect(() => {
        if (!enableLoop) return;

        const container = scrollRef.current;
        if (!container) return;

        let itemsLength = items.length;
        let timeout: NodeJS.Timeout;

        const onScrollEnd = () => {
            const container = scrollRef.current;
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            const containerCenter = snapAlign === 'center'
                ? containerRect.left + containerRect.width / 2
                : containerRect.left;

            const cards = container.querySelectorAll(`.${cardClassName}`);
            let currentRenderIndex = 0;
            let minDistance = Number.MAX_VALUE;

            cards.forEach((card, index) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = snapAlign === 'center'
                    ? cardRect.left + cardRect.width / 2
                    : cardRect.left;

                const dist = Math.abs(containerCenter - cardCenter);
                if (dist < minDistance) {
                    minDistance = dist;
                    currentRenderIndex = index;
                }
            });

            // 核心 Loop 跳轉邏輯
            let targetRenderIndex = -1;

            if (currentRenderIndex < cloneCount) {
                targetRenderIndex = currentRenderIndex + itemsLength;
            } else if (currentRenderIndex >= cloneCount + itemsLength) {
                targetRenderIndex = currentRenderIndex - itemsLength;
            }

            if (targetRenderIndex !== -1) {
                scrollToIndex(targetRenderIndex, true);
                const newRealIndex = getRealIndex(targetRenderIndex);
                setActiveIndex(newRealIndex);
                onActiveIndexChange?.(newRealIndex);
            } else {
                const newRealIndex = getRealIndex(currentRenderIndex);
                if (newRealIndex !== activeIndex) {
                    setActiveIndex(newRealIndex);
                    onActiveIndexChange?.(newRealIndex);
                }
            }
        };

        const handleScrollEndCheck = () => {
            clearTimeout(timeout);
            timeout = setTimeout(onScrollEnd, 50);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        container.addEventListener('scroll', handleScrollEndCheck, { passive: true });
        return () => {
            container.removeEventListener('scroll', handleScroll);
            container.removeEventListener('scroll', handleScrollEndCheck);
            clearTimeout(timeout);
        };
    }, [enableLoop, items.length, cloneCount, cardClassName, snapAlign, scrollToIndex, activeIndex]);


    const handleNavigation = (direction: 'prev' | 'next') => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const section = container.querySelectorAll(`.${cardClassName}`);
        const { scrollLeft, clientWidth } = container;
        const referencePoint = snapAlign === 'center' ? scrollLeft + clientWidth / 2 : scrollLeft;

        let currentRenderIndex = 0;
        let minDistance = Number.MAX_VALUE;
        section.forEach((card, index) => {
            const el = card as HTMLElement;
            const pos = snapAlign === 'center' ? el.offsetLeft + el.offsetWidth / 2 : el.offsetLeft;
            const dist = Math.abs(referencePoint - pos);
            if (dist < minDistance) {
                minDistance = dist;
                currentRenderIndex = index;
            }
        });

        let targetRenderIndex = direction === 'prev' ? currentRenderIndex - 1 : currentRenderIndex + 1;

        if (!enableLoop) {
            targetRenderIndex = Math.max(0, Math.min(renderList.length - 1, targetRenderIndex));
        } else {
            targetRenderIndex = Math.max(0, Math.min(renderList.length - 1, targetRenderIndex));
        }

        scrollToIndex(targetRenderIndex);
    };


    const navButtonClass = navButtonVariant === 'large'
        ? 'btn btn-circle bg-white/90 dark:bg-black/40 backdrop-blur-sm border-none shadow-xl text-brand-accent hover:bg-brand-accent hover:text-white hover:scale-110 transition-all duration-300'
        : 'w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 shadow-lg backdrop-blur-sm flex items-center justify-center text-brand-text dark:text-brand-bg hover:bg-brand-accent hover:text-white transition-all duration-300';
    const navIconClass = navButtonVariant === 'large' ? 'w-8 h-8' : 'w-6 h-6';

    return (
        <div className={wrapperClassName}>
            <style>{`
                .scroll-container {
                    display: flex;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    overscroll-behavior-x: contain;
                    position: relative;
                }
                .scroll-container::-webkit-scrollbar { display: none; }
                ${containerStyles}
                ${cardStyles}
            `}</style>

            {showNavigation && (enableLoop || activeIndex > 0) && (
                <button
                    onClick={() => handleNavigation('prev')}
                    className={`absolute top-1/2 left-4 md:left-8 z-30 -translate-y-1/2 hidden lg:flex ${navButtonClass}`}
                    aria-label="Previous slide"
                >
                    <ChevronLeftIcon className={navIconClass} />
                </button>
            )}

            {showNavigation && (enableLoop || activeIndex < totalRealItems - 1) && (
                <button
                    onClick={() => handleNavigation('next')}
                    className={`absolute top-1/2 right-4 md:right-8 z-30 -translate-y-1/2 hidden lg:flex ${navButtonClass}`}
                    aria-label="Next slide"
                >
                    <ChevronRightIcon className={navIconClass} />
                </button>
            )}

            <div
                ref={scrollRef}
                className="scroll-container"
                onScroll={!enableLoop ? handleScroll : undefined} // 非 Loop 模式時使用 react prop 綁定，Loop模式因為有複雜 useEffect，我們在 useEffect 裡 unified bind
            >
                {!enableLoop && snapAlign === 'center' && (
                    <div className="carousel-spacer-start flex-shrink-0" aria-hidden="true" />
                )}

                {renderList.map((item, renderIndex) => {
                    const uniqueKey = `${item.id || renderIndex}-clone-${renderIndex}`;
                    const thisRealIndex = getRealIndex(renderIndex);
                    const isActive = thisRealIndex === activeIndex;
                    const cardClass = `${cardClassName} ${isActive ? activeCardClassName : inactiveCardClassName}`;

                    return (
                        <div
                            key={uniqueKey}
                            className={cardClass}
                            style={{ scrollSnapAlign: snapAlign }}
                            onClick={clickableCards ? () => scrollToIndex(renderIndex) : undefined}
                        >
                            {renderItem(item, thisRealIndex, { isActive, activeIndex, totalItems: items.length })}
                        </div>
                    );
                })}

                {appendContent && !enableLoop && <div className={cardClassName} style={{ scrollSnapAlign: snapAlign }}>{appendContent}</div>}

                {!enableLoop && snapAlign === 'center' && (
                    <div className="carousel-spacer-end flex-shrink-0" aria-hidden="true" />
                )}
            </div>

            {showPagination && (
                <div className="pagination-dots flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalRealItems }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                const targetRenderIndex = enableLoop ? index + cloneCount : index;
                                scrollToIndex(targetRenderIndex);
                            }}
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
