import { useState, useRef, useEffect } from 'react';
import MarkdownContent from './markdownContent';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';

/**
 * 可展開的文字組件
 * 當文字超過一定高度或行數時，顯示「...」或「閱讀更多」按鈕
 */
const ExpandableText = ({ content, className = "", collapsedHeight = 100 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current) {
            const { scrollHeight, clientHeight } = contentRef.current;
            setHasOverflow(scrollHeight > collapsedHeight + 20); // 加上一點緩衝
        }
    }, [content, collapsedHeight]);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div className={`relative ${className}`}>
            <div
                ref={contentRef}
                className={`overflow-hidden transition-[max-height] duration-700 ease-in-out relative`}
                style={{ maxHeight: isExpanded ? '2000px' : `${collapsedHeight}px` }}
            >
                <MarkdownContent content={content} />

                {hasOverflow && !isExpanded && (
                    <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-brand-bg via-brand-bg/80 to-transparent dark:from-black dark:via-black/80 pointer-events-none z-10" />
                )}
            </div>

            {hasOverflow && (
                <div className={`mt-2 flex ${isExpanded ? 'justify-end' : 'justify-center'} relative z-20`}>
                    <button
                        onClick={toggleExpand}
                        className="group flex items-center gap-1.5 text-sm font-bold text-brand-accent hover:text-white transition-all duration-300 bg-brand-accent/10 hover:bg-brand-accent backdrop-blur-md px-4 py-1.5 rounded-full border border-brand-accent/30 shadow-sm hover:shadow-brand-accent/20"
                    >
                        {isExpanded ? (
                            <>
                                <span>收合內容</span>
                                <ChevronUpIcon className="w-4 h-4 transform group-hover:-translate-y-0.5 transition-transform" />
                            </>
                        ) : (
                            <>
                                <span>... 展開更多</span>
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
