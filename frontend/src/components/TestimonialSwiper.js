import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/**
 * TestimonialSwiper
 * 專為見證設計的輪播組件，具有置中放大的視覺效果
 */
export default function TestimonialSwiper({ items, renderItem }) {
    return (
        <div className="testimonial-swiper-wrapper py-12 md:py-24 relative px-0 md:px-12 lg:px-20 overflow-x-hidden w-full">
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
                navigation={true}
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
                .testimonial-swiper .swiper-button-next,
                .testimonial-swiper .swiper-button-prev {
                    color: var(--brand-accent, #6366f1);
                    background: white;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    display: none; /* 預設隱藏，手機端使用滑動操作 */
                }
                
                @media (min-width: 1024px) {
                    .testimonial-swiper .swiper-button-next,
                    .testimonial-swiper .swiper-button-prev {
                        display: flex; /* 僅在桌機端顯示按鈕 */
                    }
                    .testimonial-swiper .swiper-button-next { right: 10px; }
                    .testimonial-swiper .swiper-button-prev { left: 10px; }
                }

                .testimonial-swiper .swiper-button-next:after,
                .testimonial-swiper .swiper-button-prev:after {
                    font-size: 18px;
                    font-weight: bold;
                }
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
