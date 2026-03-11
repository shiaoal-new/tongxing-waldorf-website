import React from "react";

interface GridToggleProps {
    showGrid: boolean;
    onToggle: (v: boolean) => void;
    title?: string;
    className?: string;
}

export const GridToggle: React.FC<GridToggleProps> = ({ 
    showGrid, 
    onToggle, 
    title = "網格顯示", 
    className = "" 
}) => {
    return (
        <div className={`flex items-center justify-between w-full px-4 py-2 text-sm ${className}`}>
            <span>{title}</span>
            <div 
                className="relative ml-2" 
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle(showGrid);
                }}
            >
                <div className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${showGrid ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ${showGrid ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
                </div>
            </div>
        </div>
    );
};
