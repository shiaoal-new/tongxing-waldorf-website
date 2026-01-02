import React from "react";
import { motion } from "framer-motion";
import ActionButtons from "./actionButtons";

/**
 * ScrollableGrid - 一个通用的响应式网格组件
 * 
 * 功能:
 * - 移动端:横向滚动的卡片列表
 * - 桌面端:网格布局
 * - 支持任意子组件
 * - 可选的底部操作按钮
 * 
 * @param {Object} props
 * @param {Array} props.items - 要渲染的数据项数组
 * @param {Function} props.renderItem - 渲染每个项目的函数 (item, index) => ReactNode
 * @param {Array} props.buttons - 可选的底部按钮配置
 * @param {number} props.columns - 桌面端的列数,默认为 3

 */
export default function ScrollableGrid({
    items = [],
    renderItem,
    buttons,
    columns = 3,
}) {
    // 根据列数生成对应的 grid-cols 类名
    const gridColsClass = {
        1: "lg:grid-cols-1",
        2: "lg:grid-cols-2",
        3: "lg:grid-cols-3",
        4: "lg:grid-cols-4",
        5: "lg:grid-cols-5",
        6: "lg:grid-cols-6",
    }[columns] || "lg:grid-cols-3";



    return (
        <div className={`w-full mx-auto flex flex-wrap lg:gap-10 lg:flex-nowrap spacing-component`}>
            <motion.div className="flex flex-wrap items-start w-full">
                <div>
                    {/* 网格容器 */}
                    <div className={`flex lg:grid overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none ${gridColsClass} lg:gap-6 -mx-4 lg:mx-0`}>
                        {items.map((item, index) => (
                            <div
                                key={item.id || index}
                                id={`grid-item-${index}`}
                                className={`min-w-[85%] lg:min-w-0 w-[85%] lg:w-auto px-4 lg:px-0 snap-center flex-shrink-0`}
                            >
                                <div className="w-full">
                                    {renderItem(item, index)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 底部操作按钮 */}
                    {buttons && buttons.length > 0 && (
                        <ActionButtons buttons={buttons} align="center" className="mt-8" />
                    )}
                </div>
            </motion.div>
        </div>
    );
}
