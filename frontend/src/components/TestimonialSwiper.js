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

    return (
        <div className="testimonial-swiper-wrapper py-12 md:py-24 relative px-0 md:px-12 lg:px-20 overflow-x-hidden w-full group">
            {/* Custom Navigation Buttons */}
            <div className="absolute top-1/2 left-4 md:left-8 z-30 -translate-y-1/2 hidden lg:block">
                <button
                    ref={(node) => setPrevEl(node)}
                    className="btn btn-circle bg-white border-none shadow-xl text-brand-accent hover:bg-gray-50 hover:scale-110 transition-all duration-200"
                    aria-label="Previous slide"
                >
                    <ChevronLeftIcon className="w-8 h-8" />
                </button>
            </div>
            <div className="absolute top-1/2 right-4 md:right-8 z-30 -translate-y-1/2 hidden lg:block">
                <button
                    ref={(node) => setNextEl(node)}
                    className="btn btn-circle bg-white border-none shadow-xl text-brand-accent hover:bg-gray-50 hover:scale-110 transition-all duration-200"
                    aria-label="Next slide"
                >
                    <ChevronRightIcon className="w-8 h-8" />
                </button>
            </div>

            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1.4}
                centeredSlides={true}
                loop={true}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
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
                    <SwiperSlide key={item.id || index} className="transition-all duration-500 py-20 px-0">
                        {({ isActive }) => (
                            <div className={`transition-all duration-500 h-full ${isActive ? 'scale-110 z-10' : 'scale-90 opacity-60 grayscale-[0.5]'}`}>
                                {renderItem(item, index)}
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>

            <style jsx global>{`
                .testimonial-swiper .swiper-pagination-bullet-active {
                    background: var(--brand-accent, #6366f1);
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
