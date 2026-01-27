import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface TestimonialSwiperProps {
    items: any[];
    renderItem: (item: any, index: number, meta: { current: number, total: number }) => React.ReactNode;
}

/**
 * TestimonialSwiper
 * 專為見證設計的輪播組件，具有置中放大的視覺效果
 */
export default function TestimonialSwiper({ items, renderItem }: TestimonialSwiperProps) {
    const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLElement | null>(null);

    return (
        <div className="testimonial-swiper-wrapper py-6 md:py-16 relative px-0 md:px-12 lg:px-20 overflow-x-hidden w-full group">
            {/* Custom Navigation Buttons */}
            <div className="absolute top-1/2 left-4 md:left-8 z-30 -translate-y-1/2 hidden lg:block">
                <button
                    ref={(node) => setPrevEl(node)}
                    className="btn btn-circle bg-white/90 dark:bg-black/40 backdrop-blur-sm border-none shadow-xl text-brand-accent hover:bg-brand-accent hover:text-white hover:scale-110 transition-all duration-300"
                    aria-label="Previous slide"
                >
                    <ChevronLeftIcon className="w-8 h-8" />
                </button>
            </div>
            <div className="absolute top-1/2 right-4 md:right-8 z-30 -translate-y-1/2 hidden lg:block">
                <button
                    ref={(node) => setNextEl(node)}
                    className="btn btn-circle bg-white/90 dark:bg-black/40 backdrop-blur-sm border-none shadow-xl text-brand-accent hover:bg-brand-accent hover:text-white hover:scale-110 transition-all duration-300"
                    aria-label="Next slide"
                >
                    <ChevronRightIcon className="w-8 h-8" />
                </button>
            </div>

            <Swiper
                modules={[Navigation]}
                spaceBetween={16}
                slidesPerView={1.4}
                centeredSlides={true}
                loop={true}
                navigation={{
                    prevEl,
                    nextEl,
                }}
                breakpoints={{
                    640: {
                        slidesPerView: 1.8,
                        spaceBetween: 30,
                    },
                    1024: {
                        slidesPerView: 2.2,
                        spaceBetween: 50,
                    },
                }}
                className="testimonial-swiper !overflow-visible"
            >
                {items.map((item, index) => (
                    <SwiperSlide key={item.id || index} className="transition-all duration-500 pt-16 pb-12 md:py-20 px-0">
                        {({ isActive }) => (
                            <div className={`transition-all duration-500 h-full ${isActive ? 'scale-110 z-10' : 'scale-90 opacity-60 grayscale-[0.5]'}`}>
                                {renderItem(item, index, { current: index + 1, total: items.length })}
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>

            <style jsx global>{`
                .testimonial-swiper .swiper-slide {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            `}</style>
        </div>
    );
}
