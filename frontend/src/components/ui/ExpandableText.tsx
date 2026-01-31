import { useState, useRef, useEffect, MouseEvent } from 'react';
import MarkdownContent from './MarkdownContent';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';
import ExpandToggleButton from './ExpandToggleButton';


interface ExpandableTextProps {
    content: string;
    className?: string;
    collapsedHeight?: number;
    disableExpand?: boolean;
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
    variant?: 'default' | 'minimal';
    expandText?: string;
    collapseText?: string;
}

/**
 * 可展開的文字組件
 * 當文字超過一定高度或行數時,顯示「...」或「閱讀更多」按鈕
 */
const ExpandableText = ({
    content,
    className = "",
    collapsedHeight = 220,
    disableExpand = false,
    expanded: externalExpanded,
    onToggle: externalOnToggle,
    variant = 'default',
    expandText,
    collapseText
}: ExpandableTextProps) => {
    const [internalExpanded, setInternalExpanded] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const isControlled = externalExpanded !== undefined;
    const isExpanded = isControlled ? externalExpanded : internalExpanded;

    useEffect(() => {
        // 如果禁用展開功能,不需要檢測溢出
        if (disableExpand) {
            setHasOverflow(false);
            return;
        }

        if (contentRef.current) {
            const { scrollHeight } = contentRef.current;
            setHasOverflow(scrollHeight > collapsedHeight + 50); // 增加緩衝空間

        }

    }, [content, collapsedHeight, disableExpand]);

    const toggleExpand = (e: MouseEvent<HTMLButtonElement>) => {
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
                className={`${(disableExpand || !hasOverflow) ? '' : 'overflow-hidden transition-[max-height] duration-700 ease-in-out'} relative`}
                style={disableExpand ? {} : {
                    maxHeight: (hasOverflow || isExpanded) ? (isExpanded ? '2000px' : `${collapsedHeight}px`) : 'none',
                    maskImage: isExpanded || !hasOverflow ? 'none' : 'linear-gradient(to bottom, black 60%, transparent 100%)',
                    WebkitMaskImage: isExpanded || !hasOverflow ? 'none' : 'linear-gradient(to bottom, black 60%, transparent 100%)'
                }}
            >

                <MarkdownContent content={content} />
            </div>

            {(hasOverflow || (variant === 'minimal' && !isExpanded)) && (
                <div className={`mt-2 flex ${variant === 'minimal' ? 'justify-start' : 'justify-center'} relative z-20`}>
                    <ExpandToggleButton
                        isExpanded={isExpanded}
                        onToggle={toggleExpand}
                        variant={variant}
                        expandText={expandText}
                        collapseText={collapseText}
                    />
                </div>
            )}

        </div>
    );
};

export default ExpandableText;
