import React, { useState } from "react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';

import ActionButtons from "./ui/ActionButtons";
import Disclosure from "./ui/Disclosure";
import DevComment from "./ui/DevComment";

const ListSwiper = dynamic(() => import('./ListSwiper'), {
    loading: () => <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />,
    ssr: false,
});

const TestimonialSwiper = dynamic(() => import('./TestimonialSwiper'), {
    loading: () => <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />,
    ssr: false,
});

/**
 * List Layout Configuration
 * 定義各個佈局的特性，例如是否為全寬顯示
 */
export const LIST_LAYOUT_CONFIG = {
    grid_cards: { fullWidth: false },
    compact_grid: { fullWidth: false },
    bento_grid: { fullWidth: false },
    scrollable_grid: { fullWidth: true },
    testimonial_carousel: { fullWidth: true },
    accordion: { fullWidth: false, direction: 'vertical' },
};

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
        const isOpening = activeIndex !== index;
        setActiveIndex(isOpening ? index : null);

        if (isOpening) {
            // 處理滾動位置，避免上方長內容關閉時導致當前項目跳動
            setTimeout(() => {
                const item = items[index];
                const itemId = item.id || index;
                const element = document.getElementById(`dictionary-item-${itemId}`);

                if (element) {
                    // 使用 scrollIntoView 平滑滾動到視窗頂部（考慮導航欄偏移）
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300); // 延遲讓關閉動畫先進行一部分
        }
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
        // 監聽來自其他組件（如 ScheduleBlock）的觸發事件
        React.useEffect(() => {
            const handleDictionaryTrigger = (event) => {
                const { id } = event.detail;
                const targetIndex = items.findIndex(item => item.id === id);

                if (targetIndex !== -1) {
                    // 1. 打開對應的項目
                    setActiveIndex(targetIndex);

                    // 2. 延遲一點點滾動，確保 UI 已經更新（展開）
                    setTimeout(() => {
                        const element = document.getElementById(`dictionary-item-${id}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

                            // 3. 添加臨時的高亮效果
                            element.classList.add('ring-4', 'ring-brand-accent/30');
                            setTimeout(() => {
                                element.classList.remove('ring-4', 'ring-brand-accent/30');
                            }, 1500);
                        }
                    }, 100);
                }
            };

            window.addEventListener('trigger-dictionary-item', handleDictionaryTrigger);
            return () => {
                window.removeEventListener('trigger-dictionary-item', handleDictionaryTrigger);
            };
        }, [items]);

        return (
            <div className="w-full max-w-2xl p-2 mx-auto rounded-2xl">
                {items.map((item, index) => (
                    <div
                        id={`dictionary-item-${item.id || index}`}
                        key={item.id || index}
                        className="transition-all duration-300 rounded-3xl scroll-mt-32"
                    >
                        <Disclosure
                            title={item.title}
                            subtitle={item.subtitle}
                            isOpen={activeIndex === index}
                            onToggle={() => toggleItem(index)}
                            index={index}
                        >
                            {renderItem(item, index)}
                        </Disclosure>
                    </div>
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

    // Bento Grid 佈局 - 具備不同權重的動態網格
    if (layout === "bento_grid") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 max-w-brand mx-auto px-1">
                {items.map((item, index) => {
                    // 根據預設或項目指定的 span 來決定寬度 (12 欄位制)
                    // span 12 = 全寬, 6 = 半寬, 4 = 1/3寬, 8 = 2/3寬
                    const spanClass = {
                        12: "lg:col-span-12",
                        8: "lg:col-span-8",
                        6: "lg:col-span-6",
                        4: "lg:col-span-4",
                    }[item.span || 4] || "lg:col-span-4";

                    return (
                        <motion.div
                            key={item.id || index}
                            className={`${spanClass} flex`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                            <div className="w-full">
                                {renderItem(item, index)}
                            </div>
                        </motion.div>
                    );
                })}

                <DevComment text="Bento Grid Action Buttons" />
                {buttons && buttons.length > 0 && (
                    <div className="col-span-full">
                        <ActionButtons buttons={buttons} align="center" className="mt-12" />
                    </div>
                )}
            </div>
        );
    }

    // Scrollable Grid 佈局 (使用 Swiper EffectCards)
    if (layout === "scrollable_grid") {
        return (
            <ListSwiper
                items={items}
                renderItem={renderItem}
                buttons={buttons}
            />
        );
    }

    // Testimonial Carousel 佈局 (置中放大效果)
    if (layout === "testimonial_carousel") {
        return (
            <TestimonialSwiper
                items={items}
                renderItem={(item, index, pagination) => renderItem(item, index, { pagination })}
            />
        );
    }

    // 默認回退
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
