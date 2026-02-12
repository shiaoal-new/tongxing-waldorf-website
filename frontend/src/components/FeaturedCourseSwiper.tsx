import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import ActionButtons from "./ui/ActionButtons";

interface FeaturedCourseSwiperProps {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    buttons?: any[];
}

export default function FeaturedCourseSwiper({ items, renderItem, buttons }: FeaturedCourseSwiperProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftButton(scrollLeft > 10);
        setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);

        // Calculate current index based on scroll position
        const cardWidth = scrollRef.current.querySelector('.featured-card')?.clientWidth || 0;
        const gap = 16;
        const newIndex = Math.round(scrollLeft / (cardWidth + gap));
        setCurrentIndex(newIndex);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const cardWidth = scrollRef.current.querySelector('.featured-card')?.clientWidth || 0;
        const scrollAmount = cardWidth + 16; // card width + gap
        const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
        scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    };

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            handleScroll(); // Initial check
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const displayItems = items.slice(0, 5);

    return (
        <div className="featured-course-swiper-wrapper py-8 relative w-full group">
            <style jsx>{`
                .scroll-container {
                    display: flex;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    gap: 1rem;
                    padding: 1rem;
                    overscroll-behavior-x: contain;
                }
                
                .scroll-container::-webkit-scrollbar {
                    display: none;
                }
                
                .featured-card {
                    scroll-snap-align: center;
                    scroll-snap-stop: always;
                    flex-shrink: 0;
                    width: calc(100vw - 3rem);
                }
                
                @media (min-width: 640px) {
                    .scroll-container {
                        gap: 1.5rem;
                        padding: 1rem 2rem;
                    }
                    .featured-card {
                        scroll-snap-align: start;
                        width: calc(45% - 0.75rem);
                    }
                }
                
                @media (min-width: 1024px) {
                    .scroll-container {
                        gap: 2rem;
                    }
                    .featured-card {
                        width: calc(31.25% - 1.33rem);
                    }
                }
                
                @media (min-width: 1280px) {
                    .featured-card {
                        width: calc(25% - 1.5rem);
                    }
                }
                
                .pagination-dots {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 2rem;
                }
                
                .pagination-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: rgba(var(--color-brand-accent), 0.3);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                
                .pagination-dot.active {
                    background-color: rgb(var(--color-brand-accent));
                    width: 24px;
                    border-radius: 4px;
                }
            `}</style>

            <div
                ref={scrollRef}
                className="scroll-container"
            >
                {displayItems.map((item, index) => (
                    <div key={item.id || index} className="featured-card py-4">
                        <div className="h-full transform transition-all duration-300 hover:-translate-y-2">
                            {renderItem(item, index)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom Navigation Buttons (Desktop only) */}
            {showLeftButton && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute top-1/2 left-4 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 shadow-lg backdrop-blur-sm hidden lg:flex items-center justify-center text-brand-text dark:text-brand-bg opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1/2 hover:bg-brand-accent hover:text-white"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
            )}
            {showRightButton && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute top-1/2 right-4 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 shadow-lg backdrop-blur-sm hidden lg:flex items-center justify-center text-brand-text dark:text-brand-bg opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1/2 hover:bg-brand-accent hover:text-white"
                >
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            )}

            {/* Pagination Dots */}
            <div className="pagination-dots">
                {displayItems.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            if (!scrollRef.current) return;
                            const cardWidth = scrollRef.current.querySelector('.featured-card')?.clientWidth || 0;
                            const gap = 16;
                            scrollRef.current.scrollTo({ left: index * (cardWidth + gap), behavior: 'smooth' });
                        }}
                        className={`pagination-dot ${currentIndex === index ? 'active' : ''}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {buttons && buttons.length > 0 && (
                <div className="mt-8 flex justify-center">
                    <ActionButtons buttons={buttons} align="center" />
                </div>
            )}
        </div>
    );
}
