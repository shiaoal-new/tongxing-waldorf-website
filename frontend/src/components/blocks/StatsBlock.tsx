import React from 'react';
import { StatsBlock as StatsBlockType } from '../../types/content';
import { Icon } from '@iconify/react';

interface StatsBlockProps {
    data: StatsBlockType;
}

/**
 * Helper to calculate years since a specific date
 */
const calculateYearsSince = (dateString: string): number => {
    const startDate = new Date(dateString);
    const now = new Date();
    let years = now.getFullYear() - startDate.getFullYear();
    const monthDiff = now.getMonth() - startDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < startDate.getDate())) {
        years--;
    }
    return years;
};

/**
 * Handle dynamic value calculations
 */
const resolveStatsValue = (value: string): string => {
    if (value && value.startsWith('DYNAMICS:YEARS_SINCE:')) {
        const date = value.replace('DYNAMICS:YEARS_SINCE:', '');
        return calculateYearsSince(date).toString();
    }
    return value;
};

/**
 * StatsBlock - Tesla-inspired statistics/authority section
 * Features large numbers, subtle dividers, and clean typography.
 */
const StatsBlock: React.FC<StatsBlockProps> = ({ data }) => {
    const { items, show_dividers = true, columns } = data;

    // Use a map to ensure Tailwind classes are picked up
    const gridColsClasses: Record<number, string> = {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
    };

    const cols = columns || Math.min(items.length, 4);
    const gridClass = gridColsClasses[cols as keyof typeof gridColsClasses] || 'md:grid-cols-3';

    return (
        <div className="w-full py-16 md:py-24 bg-white dark:bg-transparent overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className={`grid grid-cols-1 ${gridClass} gap-12 md:gap-0`}>
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className={`flex flex-col items-center text-center px-8 relative
                ${show_dividers && index !== items.length - 1 ? 'md:border-r border-stone-100 dark:border-stone-800' : ''}
              `}
                        >
                            {/* Stats Value & Unit */}
                            <div className="flex items-baseline mb-3 group cursor-default">
                                <span className="text-5xl md:text-7xl font-bold tracking-tighter text-stone-900 dark:text-white transition-transform duration-500 group-hover:scale-105">
                                    {resolveStatsValue(item.value)}
                                </span>
                                {item.unit && (
                                    <span className="ml-1 text-2xl md:text-3xl font-medium text-stone-500 dark:text-stone-500">
                                        {item.unit}
                                    </span>
                                )}
                            </div>

                            {/* Label */}
                            <div className="text-base md:text-lg font-bold text-stone-800 dark:text-stone-200 mb-2">
                                {item.label}
                            </div>

                            {/* Description (Optional) */}
                            {item.description && (
                                <div className="text-sm text-stone-500 dark:text-stone-400 max-w-[240px] leading-relaxed">
                                    {item.description}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsBlock;
