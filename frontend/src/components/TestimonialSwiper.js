import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/**
 * TestimonialSwiper
 * 專為見證設計的輪播組件，具有置中放大的視覺效果
 */
export default function TestimonialSwiper({ items, renderItem }) {
    const [prevEl, setPrevEl] = useState(null);
    const [nextEl, setNextEl] = useState(null);
    const [realIndex, setRealIndex] = useState(0);

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
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1.2}
                centeredSlides={true}
                loop={true}
                onSlideChange={(swiper) => setRealIndex(swiper.realIndex)}
                pagination={{
                    clickable: true,
                    el: '.testimonial-custom-pagination',
                }}
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
                                {renderItem(item, index)}
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Enhanced Pagination Container */}
            <div className="flex flex-col items-center mt-2 md:mt-8 space-y-6 relative z-30">
                <div className="flex items-center bg-white/40 dark:bg-black/30 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/50 dark:hover:bg-black/40">
                    {/* The Bullets Container */}
                    <div className="testimonial-custom-pagination flex items-center gap-2.5 mr-6 h-4"></div>

                    {/* The Counter */}
                    <div className="pl-6 border-l border-brand-accent/30 dark:border-white/20 flex items-center">
                        <span className="text-brand-accent dark:text-white font-bold text-lg tabular-nums tracking-tighter">
                            {String(realIndex + 1).padStart(2, '0')}
                        </span>
                        <span className="mx-2 text-brand-accent/40 dark:text-white/30 text-xs font-medium">/</span>
                        <span className="text-brand-accent/60 dark:text-white/50 text-sm font-medium tabular-nums">
                            {String(items.length).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .testimonial-custom-pagination .swiper-pagination-bullet {
                    width: 10px;
                    height: 10px;
                    background: rgb(var(--color-brand-accent, 99, 102, 241));
                    opacity: 0.2;
                    margin: 0 !important;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                }
                
                .testimonial-custom-pagination .swiper-pagination-bullet-active {
                    opacity: 1;
                    width: 32px;
                    border-radius: 5px;
                    background: rgb(var(--color-brand-accent, 99, 102, 241));
                    box-shadow: 0 0 15px rgba(var(--color-brand-accent, 99, 102, 241), 0.4);
                }

                .dark .testimonial-custom-pagination .swiper-pagination-bullet {
                    background: white;
                    opacity: 0.3;
                }

                .dark .testimonial-custom-pagination .swiper-pagination-bullet-active {
                    background: white;
                    opacity: 1;
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
                }

                .testimonial-swiper .swiper-slide {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            `}</style>
        </div>
    );
}
