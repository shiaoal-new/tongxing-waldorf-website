import React from "react";
import { useWordingStyles } from "../../../../hooks/useWordingStyles";

interface WordingStyleMenuContentProps {
    actionHandlers: {
        wordingContext: {
            getStyle: (pageId: string) => string;
            setStyle: (pageId: string, style: string) => void;
        }
    };
    pageId: string;
    onSelect?: () => void;
}

export const WordingStyleMenuContent: React.FC<WordingStyleMenuContentProps> = ({ 
    actionHandlers, 
    pageId, 
    onSelect 
}) => {
    const { getStyle, setStyle } = actionHandlers.wordingContext;
    const currentStyle = getStyle(pageId);
    const availableStyles = useWordingStyles(pageId);

    return (
        <div className="overflow-hidden">
            <div className="p-2 border-b border-brand-taupe/10 text-[10px] text-brand-taupe px-3">
                目前頁面: {pageId}
            </div>
            <ul className="menu menu-compact p-1">
                {availableStyles.map((style) => (
                    <li key={style}>
                        <button
                            onClick={() => {
                                setStyle(pageId, style);
                                if (onSelect) onSelect();
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded text-xs flex justify-between items-center ${
                                currentStyle === style 
                                ? 'bg-brand-accent/10 text-brand-accent' 
                                : 'hover:bg-brand-accent/5'
                            }`}
                        >
                            <span className="capitalize">{style}</span>
                            {currentStyle === style && <span>✓</span>}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
