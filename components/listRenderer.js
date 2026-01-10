import React, { useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Pagination } from 'swiper/modules';

import ActionButtons from "./actionButtons";
import Disclosure from "./disclosure";
import DevComment from "./DevComment";


/**
 * ListRenderer - 一个通用的列表渲染组件
 * 
 * 使用 direction 参数决定排列方向:
 * - horizontal: 横向排列 (scrollable_grid, grid_cards, compact_grid)
 * - vertical: 纵向排列 (accordion)
 * 
 * @param {Object} props
 * @param {Array} props.items - 要渲染的数据项数组
 * @param {Function} props.renderItem - 渲染每个项目的函数 (item, index) => ReactNode
 * @param {string} props.direction - 排列方向: 'horizontal' | 'vertical'
 * @param {string} props.layout - 布局样式: 'scrollable_grid' | 'grid_cards' | 'compact_grid' | 'accordion'
 * @param {Array} props.buttons - 可选的底部按钮配置
 * @param {number} props.columns - 桌面端的列数,默认为 3 (仅用于 scrollable_grid)
 */
export default function ListRenderer({
    items = [],
    renderItem,
    direction = "horizontal",
    layout = "scrollable_grid",
    buttons,
    columns = 3,
}) {
    const [activeIndex, setActiveIndex] = useState(null);

    // 如果没有数据,返回 null
    if (!items || items.length === 0) {
        return null;
    }

    // Accordion 模式的切换函数
    const toggleItem = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    // 根据列数生成对应的 grid-cols 类名
    const gridColsClass = {
        1: "lg:grid-cols-1",
        2: "lg:grid-cols-2",
        3: "lg:grid-cols-3",
        4: "lg:grid-cols-4",
        5: "lg:grid-cols-5",
        6: "lg:grid-cols-6",
    }[columns] || "lg:grid-cols-3";

    // 垂直排列 - 使用 Disclosure 折叠面板
    if (direction === "vertical") {
        return (
            <div className="w-full max-w-2xl p-2 mx-auto rounded-2xl">
                {items.map((item, index) => (
                    <Disclosure
                        key={item.id || index}
                        title={item.title}
                        isOpen={activeIndex === index}
                        onToggle={() => toggleItem(index)}
                    >
                        {renderItem(item, index)}
                    </Disclosure>
                ))}

                <DevComment text="Vertical List Action Buttons" />
                {/* 底部操作按钮 */}

                {buttons && buttons.length > 0 && (
                    <ActionButtons buttons={buttons} align="center" className="mt-8" />
                )}
            </div>
        );
    }

    // 横向排列 - 根据 layout 决定具体样式

    // Grid Cards 布局 - 静态三栏网格
    if (layout === "grid_cards") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-brand mx-auto">
                {items.map((item, index) => (
                    <div key={item.id || index}>
                        {renderItem(item, index)}
                    </div>
                ))}

                <DevComment text="Grid Cards Action Buttons" />
                {/* 底部操作按钮 */}

                {buttons && buttons.length > 0 && (
                    <div className="col-span-full">
                        <ActionButtons buttons={buttons} align="center" className="mt-8" />
                    </div>
                )}
            </div>
        );
    }

    // Compact Grid 布局 - 紧凑网格
    if (layout === "compact_grid") {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-brand mx-auto">
                {items.map((item, index) => (
                    <div key={item.id || index}>
                        {renderItem(item, index)}
                    </div>
                ))}

                <DevComment text="Compact Grid Action Buttons" />
                {/* 底部操作按钮 */}

                {buttons && buttons.length > 0 && (
                    <div className="col-span-full">
                        <ActionButtons buttons={buttons} align="center" className="mt-8" />
                    </div>
                )}
            </div>
        );
    }

    // Scrollable Grid 布局 (使用 Swiper EffectCards)
    if (layout === "scrollable_grid") {
        return (
            <div className="w-full mx-auto list-swiper-container">
                <DevComment text="Swiper Effect Cards Container" />
                <Swiper
                    effect={'cards'}
                    grabCursor={true}
                    pagination={{
                        clickable: true,
                    }}
                    modules={[EffectCards, Pagination]}
                    className="swiper-cards-container"
                >
                    {items.map((item, index) => (
                        <SwiperSlide key={item.id || index} className="list-swiper-slide">
                            <div className="w-full h-full">
                                {renderItem(item, index)}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <DevComment text="Scrollable Grid Action Buttons" />
                {/* 底部操作按钮 */}

                {buttons && buttons.length > 0 && (
                    <ActionButtons buttons={buttons} align="center" className="mt-8" />
                )}
            </div>
        );
    }

    // 默认回退 (通常不应该到达这里, 因为 scrollable_grid 是默认 layout)
    return (
        <div className={`w-full mx-auto flex flex-wrap lg:gap-10 lg:flex-nowrap spacing-component`}>
            <motion.div className="flex flex-wrap items-start w-full">
                <div className="w-full">
                    {items.map((item, index) => (
                        <div key={item.id || index}>
                            {renderItem(item, index)}
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
