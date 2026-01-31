import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/outline';

interface ExpandToggleButtonProps {
    isExpanded: boolean;
    onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    showLabel?: boolean;
    expandText?: string;
    collapseText?: string;
    variant?: 'default' | 'minimal';
}

/**
 * 統一的「展開/收合」切換按鈕
 */
const ExpandToggleButton = ({
    isExpanded,
    onToggle,
    className = "",
    showLabel = true,
    expandText = "展開",
    collapseText = "收合",
    variant = 'default'
}: ExpandToggleButtonProps) => {
    if (variant === 'minimal') {
        return (
            <button
                onClick={onToggle}
                className={`group flex items-center gap-2 text-[10px] font-bold text-brand-accent/60 uppercase tracking-widest hover:text-brand-accent transition-colors ${className}`}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? collapseText : expandText}
            >
                {showLabel && (
                    <span>{isExpanded ? collapseText : expandText}</span>
                )}
                <div className={`${isExpanded ? 'rotate-180' : ''} transition-transform duration-300`}>
                    <ChevronDownIcon className={`w-3 h-3 ${!isExpanded ? 'animate-bounce' : ''}`} />
                </div>
            </button>
        );
    }

    return (
        <button
            onClick={onToggle}
            className={`group flex items-center gap-1.5 text-sm font-bold text-brand-accent hover:text-white transition-all duration-300 bg-brand-accent/10 hover:bg-brand-accent backdrop-blur-md px-4 py-1.5 rounded-full border border-brand-accent/30 shadow-sm hover:shadow-brand-accent/20 ${className}`}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? collapseText : expandText}
        >
            {showLabel && (
                <span>{isExpanded ? collapseText : expandText}</span>
            )}
            {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4 transform group-hover:-translate-y-0.5 transition-transform" />
            ) : (
                <ChevronDownIcon className="w-4 h-4 transform group-hover:translate-y-0.5 transition-transform" />
            )}
        </button>
    );
};

export default ExpandToggleButton;
