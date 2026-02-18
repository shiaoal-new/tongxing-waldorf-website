import React, { useState, useEffect } from "react";
// Touch fix build cache
import { motion } from "framer-motion";

import dynamic from 'next/dynamic';

import ActionButtons from "./ui/ActionButtons";
import Disclosure from "./ui/Disclosure";
import DevComment from "./ui/DevComment";

const CardDeckSwiper = dynamic<any>(() => import('./CardDeckSwiper'), {
    loading: () => <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />,
});



const ListCarousel = dynamic<any>(() => import('./ListCarousel'), {
    loading: () => <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />,
});


/**
 * List Layout Configuration
 * 定義各個佈局的特性，例如是否為全寬顯示
 */
export const LIST_LAYOUT_CONFIG: Record<string, any> = {
    grid_cards: { fullWidth: false },
    compact_grid: { fullWidth: false },
    bento_grid: { fullWidth: false },
    card_deck_swiper: { fullWidth: true },
    scrollable_grid: { fullWidth: true },
    carousel: { fullWidth: true },
    masonry_grid: { fullWidth: true },
    accordion: { fullWidth: false, direction: 'vertical' },
};

interface ListRendererProps {
    items?: any[];
    renderItem: (item: any, index: number, extra?: any) => React.ReactNode;
    direction?: "horizontal" | "vertical";
    layout?: string;
    buttons?: any[];
    columns?: number;
    mobile_scroll?: boolean;
    mobile_layout?: string;
    variant?: string;
    loop?: boolean;
    align?: 'start' | 'center';
    highlightActive?: boolean;
    limit?: number;
    appendMore?: boolean;
    layoutConfig?: any;
    mobileLayoutConfig?: any;
}

/**
 * ListRenderer - 一个通用的列表渲染组件
 */
export default function ListRenderer(props: ListRendererProps) {
    const {
        items = [],
        renderItem,
        direction = "horizontal",
        layout = "card_deck_swiper",
        buttons,
        columns = 3,
        mobile_scroll = false,
        mobile_layout,
        variant,
        layoutConfig = {},
        mobileLayoutConfig = {},
    } = props;

    // ... (rest of the component)

    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // 如果没有数据,返回 null
    if (!items || items.length === 0) {
        return null;
    }

    // 響應式佈局切換：如果指定了不同的行動端佈局，則分別渲染桌機與行動版並透過 CSS 切換
    if (mobile_layout && mobile_layout !== layout) {
        return (
            <>
                <div className="hidden md:block w-full">
                    <ListRenderer {...props} mobile_layout={undefined} layoutConfig={layoutConfig} />
                </div>
                <div className="md:hidden w-full">
                    <ListRenderer
                        {...props}
                        layout={mobile_layout}
                        mobile_layout={undefined}
                        layoutConfig={mobileLayoutConfig && Object.keys(mobileLayoutConfig).length > 0 ? mobileLayoutConfig : layoutConfig}
                    />
                </div>
            </>
        );
    }

    // Accordion 模式的切换函数
    const toggleItem = (index: number) => {
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
    const gridColsClass = ({
        1: "lg:grid-cols-1",
        2: "lg:grid-cols-2",
        3: "lg:grid-cols-3",
        4: "lg:grid-cols-4",
        5: "lg:grid-cols-5",
        6: "lg:grid-cols-6",
    } as Record<number, string>)[columns] || "lg:grid-cols-3";

    // 垂直排列 - 使用 Disclosure 折叠面板
    useEffect(() => {
        if (direction === "vertical") {
            const handleDictionaryTrigger = (event: any) => {
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
        }
    }, [direction, items]);

    if (direction === "vertical") {
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
        const containerClass = mobile_scroll
            ? "flex overflow-x-auto pb-8 -mx-4 px-4 scroll-smooth snap-x snap-mandatory md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 max-w-brand mx-auto"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 max-w-brand mx-auto px-1";

        return (
            <div className={containerClass}>
                {items.map((item, index) => {
                    const span: number = item.span || 4;
                    const spanClass = ({
                        12: "lg:col-span-12",
                        8: "lg:col-span-8",
                        6: "lg:col-span-6",
                        4: "lg:col-span-4",
                    } as Record<number, string>)[span] || "lg:col-span-4";

                    return (
                        <motion.div
                            key={item.id || index}
                            className={`${spanClass} ${mobile_scroll ? 'flex-shrink-0 w-[85vw] md:w-full snap-center' : 'flex'}`}
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
                    <div className={`${mobile_scroll ? 'min-w-[10vw] flex items-center justify-center' : 'col-span-full'}`}>
                        <ActionButtons buttons={buttons} align="center" className={mobile_scroll ? "" : "mt-12"} />
                    </div>
                )}
            </div>
        );
    }

    // Masonry Grid 佈局 - 瀑布流 (Pinterest 風格)
    if (layout === "masonry_grid") {
        return (
            <div className="w-full max-w-brand mx-auto px-4">
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id || index}
                            className="break-inside-avoid mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05, duration: 0.5 }}
                        >
                            <div className="w-full">
                                {renderItem(item, index)}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <DevComment text="Masonry Grid Action Buttons" />
                {buttons && buttons.length > 0 && (
                    <ActionButtons buttons={buttons} align="center" className="mt-12" />
                )}
            </div>
        );
    }

    // Scrollable Grid 佈局 (使用 Swiper EffectCards)
    if (layout === "card_deck_swiper" || layout === "scrollable_grid") {
        return (
            <CardDeckSwiper
                items={items}
                renderItem={renderItem}
                buttons={buttons}
            />
        );
    }

    // List Carousel 佈局
    if (layout === "carousel") {

        // 預設配置
        let defaultProps = {
            loop: true,
            align: 'center',
            highlightActive: true,
            limit: undefined,
            appendMore: false,
        };

        const config = { ...defaultProps, ...layoutConfig };

        return (
            <ListCarousel
                items={items}
                variant={variant}
                loop={config.loop}
                align={config.align}
                highlightActive={config.highlight_active || config.highlightActive} // Handle both casing just in case
                limit={config.limit}
                appendMore={config.append_more || config.appendMore} // Handle both casing
                buttons={buttons}
                renderItem={(item: any, index: number, pagination: any) => renderItem(item, index, { pagination })}
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
