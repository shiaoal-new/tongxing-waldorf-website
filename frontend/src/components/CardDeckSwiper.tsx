import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';
import styles from "./CardDeckSwiper.module.css";
import DevComment from "./ui/DevComment";
import ActionButtons from "./ui/ActionButtons";

interface CardDeckSwiperProps {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    buttons?: any[];
}

export default function CardDeckSwiper({ items, renderItem, buttons }: CardDeckSwiperProps) {
    return (
        <div className={`w-full mx-auto ${styles['card-deck-swiper-container']}`}>
            <DevComment text="Swiper Effect Cards Container" />
            <Swiper
                effect={'cards'}
                grabCursor={true}
                pagination={{
                    clickable: true,
                }}
                modules={[EffectCards, Pagination]}
                className={styles['swiper-cards-container']}
            >
                {items.map((item, index) => (
                    <SwiperSlide key={item.id || index} className={styles['card-deck-swiper-slide']}>
                        <div className="w-full h-full flex flex-col">
                            {renderItem(item, index)}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <DevComment text="Scrollable Grid Action Buttons" />
            {/* 底部操作按鈕 */}

            {buttons && buttons.length > 0 && (
                <ActionButtons buttons={buttons} align="center" className="mt-8" />
            )}
        </div>
    );
}
