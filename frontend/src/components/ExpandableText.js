import { useState, useRef, useEffect } from 'react';
import MarkdownContent from './MarkdownContent';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';

/**
 * 可展開的文字組件
 * 當文字超過一定高度或行數時,顯示「...」或「閱讀更多」按鈕
 * @param {string} content - 要顯示的內容
 * @param {string} className - 額外的 CSS 類名
 * @param {number} collapsedHeight - 折疊時的高度(像素)
 * @param {boolean} disableExpand - 禁用展開功能,直接顯示全部內容(用於已有折疊功能的父組件內)
 * @param {boolean} expanded - (可選) 外部控制的展開狀態
 * @param {function} onToggle - (可選) 展開狀態改變時的回調
 */
const ExpandableText = ({
    content,
    className = "",
    collapsedHeight = 100,
    disableExpand = false,
    expanded: externalExpanded,
    onToggle: externalOnToggle
}) => {
    const [internalExpanded, setInternalExpanded] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const contentRef = useRef(null);

    const isControlled = externalExpanded !== undefined;
    const isExpanded = isControlled ? externalExpanded : internalExpanded;

    useEffect(() => {
        // 如果禁用展開功能,不需要檢測溢出
        if (disableExpand) {
            setHasOverflow(false);
            return;
        }

        if (contentRef.current) {
            const { scrollHeight, clientHeight } = contentRef.current;
            setHasOverflow(scrollHeight > collapsedHeight + 20); // 加上一點緩衝
        }
    }, [content, collapsedHeight, disableExpand]);

    const toggleExpand = (e) => {
        if (e && e.stopPropagation) {
            e.stopPropagation();
        }

        const newState = !isExpanded;

        if (externalOnToggle) {
            externalOnToggle(newState);
        }

        if (!isControlled) {
            setInternalExpanded(newState);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div
                ref={contentRef}
                className={`${disableExpand ? '' : 'overflow-hidden transition-[max-height] duration-700 ease-in-out'} relative`}
                style={disableExpand ? {} : {
                    maxHeight: isExpanded ? '2000px' : `${collapsedHeight}px`,
                    maskImage: !isExpanded && hasOverflow ? 'linear-gradient(to bottom, black 60%, transparent 100%)' : 'none',
                    WebkitMaskImage: !isExpanded && hasOverflow ? 'linear-gradient(to bottom, black 60%, transparent 100%)' : 'none'
                }}
            >
                <MarkdownContent content={content} />
            </div>

            {hasOverflow && (
                <div className="mt-2 flex justify-center relative z-20">
                    <button
                        onClick={toggleExpand}
                        className="group flex items-center gap-1.5 text-sm font-bold text-brand-accent hover:text-white transition-all duration-300 bg-brand-accent/10 hover:bg-brand-accent backdrop-blur-md px-4 py-1.5 rounded-full border border-brand-accent/30 shadow-sm hover:shadow-brand-accent/20"
                    >
                        {isExpanded ? (
                            <>
                                <span>收合</span>
                                <ChevronUpIcon className="w-4 h-4 transform group-hover:-translate-y-0.5 transition-transform" />
                            </>
                        ) : (
                            <>
                                <span>展開</span>
                                <ChevronDownIcon className="w-4 h-4 transform group-hover:translate-y-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExpandableText;
